// We need 'dotenv' to read from the .env file
require('dotenv').config();
const { ethers } = require("ethers");
const { WebSocketServer } = require("ws");

// --- 1. CONFIGURATION (Loaded from .env file) ---
const WSS_URL = process.env.ALCHEMY_WSS_URL;
const HTTPS_URL = WSS_URL.replace('wss://', 'https://');
const MY_DEX_ADDRESS = process.env.MY_DEX_ADDRESS.toLowerCase();
const SANDWICH_WINDOW_MS = 30000; // Look for sandwich parts within 30 seconds
const GAS_MULTIPLE_THRESHOLD = 5; // Alert if gas is 5x higher than network average

// --- MyDEX ABI for MyHyperOptimizedDEX ---
const DEX_ABI = [
    "function swapTokenAForTokenB(uint256 amountInA, uint256 amountOutMin)",
    "function addLiquidity(uint256 amountA, uint256 amountB)",
    "function reserveA() view returns (uint256)",
    "function reserveB() view returns (uint256)",
    "function tokenA() view returns (address)",
    "function tokenB() view returns (address)"
];
const dexInterface = new ethers.Interface(DEX_ABI);
const SWAP_SIGNATURE = dexInterface.getFunction("swapTokenAForTokenB").selector;
const ADD_LIQUIDITY_SIGNATURE = dexInterface.getFunction("addLiquidity").selector;

// --- ALCHEMY ENHANCED APIs ---
// Track known MEV bot addresses (community-maintained list)
const KNOWN_MEV_BOTS = new Set([
    // Add known MEV bot addresses as they're identified
]);

// Track address behavior patterns
const addressStats = new Map(); // address -> { txCount, avgGasPrice, lastSeen }

if (!WSS_URL || !MY_DEX_ADDRESS) {
    console.error("FATAL ERROR: ALCHEMY_WSS_URL or MY_DEX_ADDRESS is not set in your .env file.");
    process.exit(1);
}

// --- 2. WEBSOCKET SERVER (For your React Frontend) ---
const wss = new WebSocketServer({ port: 8080 });
console.log(`WebSocket alert server started on port 8080`);
wss.on("connection", (ws) => {
    console.log("Front-end dashboard connected");
    ws.send(JSON.stringify({ type: "WELCOME", message: "Connected to MEV Detection Server" }));
});
function broadcast(alertObject) {
    const message = JSON.stringify(alertObject);
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

// --- 3. STATE FOR SANDWICH DETECTION (Now with swap-awareness) ---
const potentialFrontRuns = new Map();
const potentialSandwiches = new Map();

// --- 4. MEMPOOL MONITOR ---
const provider = new ethers.WebSocketProvider(WSS_URL);
const httpProvider = new ethers.JsonRpcProvider(HTTPS_URL);

// --- ALCHEMY ENHANCED MEV DETECTION FUNCTIONS ---

/**
 * Use Alchemy's Transaction Simulation API to detect MEV opportunities
 */
async function simulateTransaction(tx) {
    try {
        // Alchemy's eth_call can simulate transaction execution
        const simulationResult = await httpProvider.call({
            from: tx.from,
            to: tx.to,
            data: tx.data,
            value: tx.value || 0,
            gasPrice: tx.gasPrice || tx.maxFeePerGas
        });
        return { success: true, result: simulationResult };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Check if address exhibits MEV bot behavior patterns
 */
function analyzeAddressBehavior(address) {
    const stats = addressStats.get(address) || { 
        txCount: 0, 
        totalGasPrice: 0n, 
        highGasCount: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now()
    };
    
    stats.txCount++;
    stats.lastSeen = Date.now();
    
    addressStats.set(address, stats);
    
    // MEV Bot indicators:
    const isSuspicious = 
        stats.highGasCount / stats.txCount > 0.7 || // >70% high gas txs
        stats.txCount > 10 && (stats.lastSeen - stats.firstSeen) < 60000; // >10 txs in 1 min
    
    return {
        isSuspicious,
        txCount: stats.txCount,
        highGasRatio: stats.txCount > 0 ? stats.highGasCount / stats.txCount : 0,
        isKnownBot: KNOWN_MEV_BOTS.has(address)
    };
}

/**
 * Use Alchemy's getTransactionReceipt for post-execution analysis
 */
async function analyzeTransactionReceipt(txHash) {
    try {
        const receipt = await httpProvider.getTransactionReceipt(txHash);
        if (!receipt) return null;
        
        return {
            status: receipt.status,
            gasUsed: receipt.gasUsed.toString(),
            effectiveGasPrice: receipt.gasPrice?.toString(),
            logs: receipt.logs.length
        };
    } catch (error) {
        return null;
    }
}

/**
 * Detect sandwich attack patterns using Alchemy's block data
 */
async function detectSandwichPattern(victimTx, blockNumber) {
    try {
        // Get full block with all transactions
        const block = await httpProvider.getBlock(blockNumber, true);
        if (!block) return { isSandwich: false };
        
        const txIndex = block.transactions.findIndex(tx => tx.hash === victimTx.hash);
        if (txIndex === -1) return { isSandwich: false };
        
        // Check transaction before (front-run)
        const prevTx = block.transactions[txIndex - 1];
        // Check transaction after (back-run)
        const nextTx = block.transactions[txIndex + 1];
        
        const isSandwich = 
            prevTx && nextTx &&
            prevTx.from === nextTx.from && // Same attacker
            prevTx.to === victimTx.to && nextTx.to === victimTx.to && // Same DEX
            prevTx.gasPrice > victimTx.gasPrice; // Front-run has higher gas
        
        return {
            isSandwich,
            attacker: isSandwich ? prevTx.from : null,
            frontRunTx: isSandwich ? prevTx.hash : null,
            backRunTx: isSandwich ? nextTx.hash : null
        };
    } catch (error) {
        return { isSandwich: false, error: error.message };
    }
}

/**
 * Use Alchemy's pending transaction subscription with enhanced filters
 */
async function setupAlchemySubscription() {
    console.log('🔧 Setting up Alchemy Enhanced Subscription...');
    
    // Subscribe to pending transactions with Alchemy-specific options
    provider._subscribe(
        "alchemy_pendingTransactions",
        ["alchemy_pendingTransactions", {
            toAddress: [MY_DEX_ADDRESS],
            hashesOnly: false
        }],
        (tx) => {
            // This will be handled by the main listener
            console.log('📨 Received from Alchemy subscription:', tx);
        }
    );
}

async function monitorMempool() {
    console.log(`✅ Monitoring Sepolia mempool for MyDEX: ${MY_DEX_ADDRESS}`);
    console.log(`   Swap Signature: ${SWAP_SIGNATURE}`);
    console.log(`   Liquidity Signature: ${ADD_LIQUIDITY_SIGNATURE}`);

    provider.on("pending", async (txHash) => {
        let tx;
        try {
            tx = await provider.getTransaction(txHash);
            const now = Date.now(); 

            // --- FILTER 1: Must be to our DEX ---
            if (!tx || !tx.to || tx.to.toLowerCase() !== MY_DEX_ADDRESS) {
                return; // Not to our DEX, ignore
            }
            
            const sender = tx.from.toLowerCase();
            const functionSignature = tx.data.substring(0, 10);
            
            // Filter for swap and liquidity functions
            if (!tx.data.startsWith(SWAP_SIGNATURE) && !tx.data.startsWith(ADD_LIQUIDITY_SIGNATURE)) {
                return; // Not a monitored function
            }

            console.log(`[${new Date().toLocaleTimeString()}] 📡 Detected TX: ${txHash.substring(0,10)}... from ${sender.substring(0,8)}...`);
            
            const isSwap = tx.data.startsWith(SWAP_SIGNATURE);

            // --- ALCHEMY ENHANCED: Behavior Analysis ---
            const behaviorAnalysis = analyzeAddressBehavior(sender);
            
            // --- ALCHEMY ENHANCED: Transaction Simulation ---
            const simulation = await simulateTransaction(tx);

            // --- RISK ANALYSIS: Gas Price & MEV Indicators ---
            const feeData = await provider.getFeeData();
            let riskScore = 0;
            let riskFactors = [];
            let gasInfo = "";
            
            // ALCHEMY: Add bot detection scoring
            if (behaviorAnalysis.isKnownBot) {
                riskScore += 50;
                riskFactors.push('🤖 Known MEV bot address');
            }
            
            if (behaviorAnalysis.isSuspicious) {
                riskScore += 25;
                riskFactors.push(`⚠️ Suspicious behavior pattern (${behaviorAnalysis.txCount} txs, ${(behaviorAnalysis.highGasRatio * 100).toFixed(0)}% high gas)`);
            }
            
            // ALCHEMY: Add simulation failure detection
            if (!simulation.success && isSwap) {
                riskScore += 20;
                riskFactors.push('❌ Transaction simulation failed - possible attack');
            }

            // Check for abnormally high gas (MEV bot indicator)
            let isHighGas = false;
            if (tx.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas) {
                const gasTipMultiple = Number(tx.maxPriorityFeePerGas * 100n / feeData.maxPriorityFeePerGas) / 100;
                gasInfo = `${ethers.formatUnits(tx.maxPriorityFeePerGas, "gwei")} Gwei tip (${gasTipMultiple.toFixed(1)}x avg)`;
                
                if (tx.maxPriorityFeePerGas > feeData.maxPriorityFeePerGas * BigInt(GAS_MULTIPLE_THRESHOLD)) {
                    isHighGas = true;
                    riskScore += 40;
                    riskFactors.push(`High gas tip: ${gasTipMultiple.toFixed(1)}x network average`);
                }
            } else if (tx.gasPrice && feeData.gasPrice) {
                const gasPriceMultiple = Number(tx.gasPrice * 100n / feeData.gasPrice) / 100;
                gasInfo = `${ethers.formatUnits(tx.gasPrice, "gwei")} Gwei (${gasPriceMultiple.toFixed(1)}x avg)`;
                
                if (tx.gasPrice > feeData.gasPrice * 2n) {
                    isHighGas = true;
                    riskScore += 30;
                    riskFactors.push(`High gas price: ${gasPriceMultiple.toFixed(1)}x network average`);
                }
            }
            
            // ALCHEMY: Update address stats with high gas info
            if (isHighGas) {
                const stats = addressStats.get(sender);
                if (stats) {
                    stats.highGasCount++;
                    addressStats.set(sender, stats);
                }
            }
            
            // Decode transaction data for additional analysis
            let decodedData = null;
            try {
                if (isSwap) {
                    decodedData = dexInterface.decodeFunctionData("swapTokenAForTokenB", tx.data);
                    const amountIn = decodedData[0];
                    const minOut = decodedData[1];
                    
                    // Very low minOut could indicate MEV vulnerability
                    if (minOut === 1n || minOut === 0n) {
                        riskScore += 30;
                        riskFactors.push("Very low slippage protection (minOut too low)");
                    }
                    
                    // Large swap amounts are more attractive to MEV
                    if (amountIn > ethers.parseEther("100")) {
                        riskScore += 10;
                        riskFactors.push("Large swap amount (MEV attractive)");
                    }
                }
            } catch (e) {
                // Decode failed, skip
            }

            // Determine risk level
            let riskLevel = "LOW";
            if (riskScore >= 60) riskLevel = "CRITICAL";
            else if (riskScore >= 30) riskLevel = "HIGH";
            else if (riskScore >= 15) riskLevel = "MEDIUM";
            
            // ENHANCED: Determine MEV attack type based on patterns
            let mevType = null;
            let mevBadge = null;
            
            // Check for front-run pattern (high gas, first in sequence)
            const isLikelyFrontRun = isHighGas && riskScore >= 30 && 
                                      !potentialFrontRuns.has(sender);
            
            // Check for back-run pattern (high gas, following a front-run from same sender)
            const isLikelyBackRun = isHighGas && riskScore >= 30 && 
                                     potentialFrontRuns.has(sender);
            
            if (isLikelyFrontRun) {
                mevType = "FRONT-RUN";
                mevBadge = "🎯 FRONT-RUN ATTEMPT";
                riskFactors.unshift("🎯 Potential front-run transaction detected");
            } else if (isLikelyBackRun) {
                mevType = "BACK-RUN";
                mevBadge = "🔄 BACK-RUN ATTEMPT";
                riskFactors.unshift("🔄 Potential back-run transaction detected");
            } else if (riskScore < 15) {
                mevType = "NORMAL";
                mevBadge = "✅ NORMAL TRANSACTION";
            } else {
                mevType = "SUSPICIOUS";
                mevBadge = "⚠️ SUSPICIOUS ACTIVITY";
            }
            
            // Broadcast alert with comprehensive risk data including Alchemy insights
            if (riskScore > 0 || isSwap) {
                const alertData = {
                    type: "MEV_ALERT",
                    hash: tx.hash,
                    from: tx.from,
                    functionName: isSwap ? "swapTokenAForTokenB" : "addLiquidity",
                    riskLevel: riskLevel,
                    riskScore: riskScore,
                    riskFactors: riskFactors,
                    gasInfo: gasInfo,
                    timestamp: now,
                    decodedData: decodedData ? {
                        amountIn: decodedData[0].toString(),
                        amountOutMin: decodedData[1]?.toString() || "N/A"
                    } : null,
                    // ENHANCED: MEV attack type classification
                    mevType: mevType,
                    mevBadge: mevBadge,
                    // ALCHEMY ENHANCED: Additional insights
                    alchemyInsights: {
                        isKnownBot: behaviorAnalysis.isKnownBot,
                        isSuspiciousBehavior: behaviorAnalysis.isSuspicious,
                        addressTxCount: behaviorAnalysis.txCount,
                        simulationSuccess: simulation.success,
                        detectionSource: 'Alchemy Enhanced API'
                    }
                };
                
                console.log(`   Risk Level: ${riskLevel} (Score: ${riskScore})`);
                console.log(`   MEV Type: ${mevBadge}`);
                if (riskFactors.length > 0) {
                    console.log(`   Risk Factors: ${riskFactors.join(', ')}`);
                }
                if (behaviorAnalysis.isKnownBot || behaviorAnalysis.isSuspicious) {
                    console.log(`   🤖 Alchemy Bot Detection: Known=${behaviorAnalysis.isKnownBot}, Suspicious=${behaviorAnalysis.isSuspicious}`);
                }
                
                broadcast(alertData);
                
                // Track high-risk transactions for pattern detection
                if (riskScore >= 30) {
                    potentialFrontRuns.set(sender, { 
                        txHash, 
                        timestamp: now, 
                        functionSignature,
                        riskScore,
                        behaviorAnalysis
                    });
                }
            }

        } catch (err) {
            if (err.code !== 'REPLACEMENT_TRANSACTION' && !err.message.includes('transaction failed') && !err.message.includes('could not detect network')) {
                // console.error(`Error processing hash ${txHash}:`, err.message); // Too noisy
            }
        }
    });

    provider.on("error", (err) => {
        console.error("WebSocket Provider Error. Reconnecting...", err);
    });

    // --- Cleanup old entries periodically ---
    setInterval(() => {
        const now = Date.now();
        
        // Clean up front-run tracking
        for (const [sender, frontRun] of potentialFrontRuns.entries()) {
            if (now - frontRun.timestamp > SANDWICH_WINDOW_MS * 2) { 
                potentialFrontRuns.delete(sender);
            }
        }
        
        // Clean up sandwich detection map
        for (const [victimHash, sandwichData] of potentialSandwiches.entries()) {
            if (now - sandwichData.victimTimestamp > SANDWICH_WINDOW_MS * 2) {
                potentialSandwiches.delete(victimHash);
            }
        }
        
        // ALCHEMY: Clean up old address stats (older than 5 minutes)
        for (const [address, stats] of addressStats.entries()) {
            if (now - stats.lastSeen > 300000) { // 5 minutes
                addressStats.delete(address);
            }
        }
        
        console.log(`🧹 Cleanup: Tracking ${potentialFrontRuns.size} potential front-runs, ${addressStats.size} addresses`);
    }, SANDWICH_WINDOW_MS);
    
    // Broadcast system status every 30 seconds with Alchemy insights
    setInterval(() => {
        const suspiciousAddresses = Array.from(addressStats.values()).filter(s => 
            s.highGasCount / s.txCount > 0.7
        ).length;
        
        broadcast({
            type: "SYSTEM_STATUS",
            status: "ONLINE",
            monitoredContract: MY_DEX_ADDRESS,
            timestamp: Date.now(),
            trackedTransactions: potentialFrontRuns.size,
            alchemyStats: {
                trackedAddresses: addressStats.size,
                suspiciousAddresses: suspiciousAddresses,
                knownBots: KNOWN_MEV_BOTS.size,
                detectionEngine: 'Alchemy Enhanced MEV Detection'
            }
        });
    }, 30000);

} // End monitorMempool

monitorMempool();

