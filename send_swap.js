// We need 'dotenv' to read from the .env file
require('dotenv').config();
const { ethers, parseUnits } = require("ethers");

// --- 1. CONFIGURATION (Loaded from .env file) ---
// Use replace to ensure we get a valid HTTP URL from the WSS URL
const ALCHEMY_HTTP_URL = process.env.ALCHEMY_WSS_URL ? process.env.ALCHEMY_WSS_URL.replace("wss://", "https://") : '';
const MY_DEX_ADDRESS = process.env.MY_DEX_ADDRESS;
const MY_WALLET_PRIVATE_KEY = process.env.MY_WALLET_PRIVATE_KEY;

// --- Your Token Contract addresses (from deploying in Remix) ---
// You must get these from Remix and paste them here.
const TOKEN_A_ADDRESS = "0x934c9535ea7722d12c71a207e4df0e771277f321";
const TOKEN_B_ADDRESS = "0xcfc2a483f7d18802d84576bb337b1af3a9d142bf";

// --- ABIs (Minimal) ---
const DEX_ABI = [
    "function swapTokenAForTokenB(uint256 amountInA, uint256 amountOutMin) external"
    // Note: MyHyperOptimizedDEX only has swapTokenAForTokenB
    // No swapTokenBForTokenA function exists
];
const TOKEN_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)" // Added balanceOf
];

// --- 2. SETUP ---

// --- NEW VALIDATION BLOCK ---
console.log("--- Checking All 5 Required Variables ---");
let allValid = true;

// Check .env variables
if (ALCHEMY_HTTP_URL && ALCHEMY_HTTP_URL.startsWith("https://")) {
    console.log("✅ 1/5 ALCHEMY_WSS_URL: OK");
} else {
    console.log("❌ 1/5 ALCHEMY_WSS_URL: MISSING or WRONG in .env file");
    allValid = false;
}

if (MY_DEX_ADDRESS && MY_DEX_ADDRESS.startsWith("0x")) {
    console.log("✅ 2/5 MY_DEX_ADDRESS: OK");
} else {
    console.log("❌ 2/5 MY_DEX_ADDRESS: MISSING in .env file");
    allValid = false;
}

if (MY_WALLET_PRIVATE_KEY && MY_WALLET_PRIVATE_KEY.length > 10) { // Simple check
    console.log("✅ 3/5 MY_WALLET_PRIVATE_KEY: OK");
} else {
    console.log("❌ 3/5 MY_WALLET_PRIVATE_KEY: MISSING in .env file");
    allValid = false;
}

// Check send_swap.js variables
if (TOKEN_A_ADDRESS && TOKEN_A_ADDRESS.startsWith("0x")) {
    console.log("✅ 4/5 TOKEN_A_ADDRESS: OK");
} else {
    console.log("❌ 4/5 TOKEN_A_ADDRESS: MISSING (Please paste it into send_swap.js)");
    allValid = false;
}

if (TOKEN_B_ADDRESS && TOKEN_B_ADDRESS.startsWith("0x")) {
    console.log("✅ 5/5 TOKEN_B_ADDRESS: OK");
} else {
    console.log("❌ 5/5 TOKEN_B_ADDRESS: MISSING (Please paste it into send_swap.js)");
    allValid = false;
}

// Validate all required variables are present
if (!allValid) {
    console.error("\nFATAL ERROR: Please fix the 'MISSING' variables listed above.");
    process.exit(1); // Stop the script
}
// --- END NEW VALIDATION BLOCK ---

// Connect to the network
const provider = new ethers.JsonRpcProvider(ALCHEMY_HTTP_URL);
const wallet = new ethers.Wallet(MY_WALLET_PRIVATE_KEY, provider);
const dexContract = new ethers.Contract(MY_DEX_ADDRESS, DEX_ABI, wallet);
const tokenAContract = new ethers.Contract(TOKEN_A_ADDRESS, TOKEN_ABI, wallet);
const tokenBContract = new ethers.Contract(TOKEN_B_ADDRESS, TOKEN_ABI, wallet);

console.log(`\n✅ Script setup complete.`);
console.log(`   Wallet: ${wallet.address}`);
console.log(`   DEX: ${MY_DEX_ADDRESS}`);
console.log(`   Token A: ${TOKEN_A_ADDRESS}`);
console.log(`   Token B: ${TOKEN_B_ADDRESS}`);

// --- 3. HELPER FUNCTIONS ---

/**
 * Checks and sends an approve transaction for Token A if needed.
 */
async function approveTokenA() {
    const allowance = await tokenAContract.allowance(wallet.address, MY_DEX_ADDRESS);
    const amount = parseUnits("1000", 18); // Approve 1000 tokens

    if (allowance < amount) {
        console.log("Sending APPROVE transaction for Token A...");
        const tx = await tokenAContract.approve(MY_DEX_ADDRESS, ethers.MaxUint256); // Approve max
        await tx.wait();
        console.log(`✅ Token A Approved! Hash: ${tx.hash}`);
    } else {
        console.log("✅ Token A already approved.");
    }
}

/**
 * Checks and sends an approve transaction for Token B if needed.
 */
async function approveTokenB() {
    const allowance = await tokenBContract.allowance(wallet.address, MY_DEX_ADDRESS);
    const amount = parseUnits("1000", 18); // Approve 1000 tokens

    if (allowance < amount) {
        console.log("Sending APPROVE transaction for Token B...");
        const tx = await tokenBContract.approve(MY_DEX_ADDRESS, ethers.MaxUint256); // Approve max
        await tx.wait();
        console.log(`✅ Token B Approved! Hash: ${tx.hash}`);
    } else {
        console.log("✅ Token B already approved.");
    }
}

/**
 * Sends the swap transaction.
 * @param {boolean} isFrontRun - If true, sends with high gas.
 */
async function sendSwapAForB(isFrontRun = false) {
    await approveTokenA(); // Ensure token A is approved
    console.log("\n----------------------------------");

    const amountInA = parseUnits("10", 18); // 10 tokens
    const amountOutMin = 1;

    if (isFrontRun) {
        console.log("🚀 Sending a FRONT-RUN swap (High Gas)...");
        // Manually set high gas to simulate a front-run
        // *** EDITED FOR LOWER GAS FEE ***
        const tx = await dexContract.swapTokenAForTokenB(amountInA, amountOutMin, {
            maxPriorityFeePerGas: parseUnits("0.5", "gwei"), // 0.5 Gwei tip (Much cheaper)
            maxFeePerGas: parseUnits("2", "gwei") // 2 Gwei total cap
        });
        console.log(`   Sent! Transaction Hash: ${tx.hash}`);
    } else {
        console.log("👤 Sending a VICTIM swap (Normal Gas)...");
        // Send with normal gas (no fee object)
        const tx = await dexContract.swapTokenAForTokenB(amountInA, amountOutMin);
        console.log(`   Sent! Transaction Hash: ${tx.hash}`);
    }
    console.log("----------------------------------");
}

/**
 * Sends the BACK-RUN swap.
 * NOTE: MyHyperOptimizedDEX only has swapTokenAForTokenB.
 * A "back-run" would swap Token A again (selling high after the victim's trade).
 */
async function sendBackRun() {
    await approveTokenA(); // Ensure token A is approved
    console.log("\n----------------------------------");
    console.log("🚀 Sending a BACK-RUN swap (High Gas)...");
    console.log("   NOTE: This DEX only has swapTokenAForTokenB");
    console.log("   Back-run = Another A→B swap with high gas");

    // Get Token A balance
    const tokenABalance = await tokenAContract.balanceOf(wallet.address);
    console.log(`   Current Token A Balance: ${ethers.formatUnits(tokenABalance, 18)}`);

    // Check if we have any Token A to swap
    if (tokenABalance === 0n) {
        console.error("   Back-run failed: You have 0 Token A to swap.");
        console.log("----------------------------------");
        return;
    }

    // Use a smaller amount for back-run (10 tokens or balance, whichever is less)
    const amountInA = tokenABalance > parseUnits("10", 18) ? parseUnits("10", 18) : tokenABalance;
    const amountOutMin = 1; // Minimum Token B we accept

    try {
        const tx = await dexContract.swapTokenAForTokenB(amountInA, amountOutMin, {
            maxPriorityFeePerGas: parseUnits("0.5", "gwei"), // High gas for back-run
            maxFeePerGas: parseUnits("2", "gwei")
        });
        console.log(`   Sent! Transaction Hash: ${tx.hash}`);
    } catch (error) {
        console.error("Back-run failed:", error.message);
        if (error.message.includes("insufficient balance")) {
            console.error("Hint: You don't have enough Token A to perform the back-run.");
        }
    }
    console.log("----------------------------------");
}

// --- 4. SCRIPT EXECUTION ---
// This part reads which script you ran from 'npm run ...'
async function main() {
    const args = process.argv;
    
    // Check which script was run
    if (args.includes("frontrun")) {
        await sendSwapAForB(true);
    } else if (args.includes("victim")) {
        await sendSwapAForB(false);
    } else if (args.includes("backrun")) {
        await sendBackRun();
    } else {
        console.log("Usage: node send_swap.js [frontrun|victim|backrun]");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

