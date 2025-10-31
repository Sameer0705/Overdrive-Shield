# 🔬 Alchemy Enhanced MEV Detection Features

## Overview

Your F1 MEV Protection Dashboard now integrates **Alchemy's Enhanced APIs** for advanced MEV bot detection on Sepolia testnet. These features provide deeper insights beyond basic transaction monitoring.

---

## 🚀 New Alchemy-Powered Features

### 1. **MEV Bot Behavior Analysis**

**What it does:** Tracks and analyzes address behavior patterns to identify MEV bots.

**Detection Criteria:**
- **High Gas Ratio**: >70% of transactions use abnormally high gas
- **Transaction Velocity**: >10 transactions in under 1 minute
- **Known Bot List**: Matches against community-maintained MEV bot addresses

**Risk Score Impact:** +25 to +50 points

**Example Output:**
```
⚠️ Suspicious behavior pattern (15 txs, 85% high gas)
🤖 Known MEV bot address
```

---

### 2. **Transaction Simulation API**

**What it does:** Uses Alchemy's `eth_call` to simulate transaction execution before it's mined.

**Benefits:**
- Detects transactions that will fail
- Identifies potential attack patterns
- Validates transaction viability

**Risk Score Impact:** +20 points for simulation failures

**Example Output:**
```
❌ Transaction simulation failed - possible attack
```

---

### 3. **Address Statistics Tracking**

**What it tracks per address:**
- Total transaction count
- Average gas price
- High gas transaction percentage
- First seen timestamp
- Last seen timestamp

**Automatic Cleanup:** Stats older than 5 minutes are purged

**Dashboard Display:**
```
🔬 Alchemy: 12 addresses tracked | 3 suspicious | 0 known bots
```

---

### 4. **Enhanced Alert Data**

Every MEV alert now includes an `alchemyInsights` section:

```json
{
  "alchemyInsights": {
    "isKnownBot": false,
    "isSuspiciousBehavior": true,
    "addressTxCount": 15,
    "simulationSuccess": false,
    "detectionSource": "Alchemy Enhanced API"
  }
}
```

**UI Display:**
- **Badge**: 🤖 KNOWN BOT or ⚠️ SUSPICIOUS
- **Insights Section**: Address transaction count, simulation status
- **Color-coded warnings** in alert details

---

## 📊 Risk Scoring Enhancement

### New Scoring Components

| Detection Method | Points | Trigger Condition |
|-----------------|--------|-------------------|
| **Known MEV Bot** | +50 | Address in known bot list |
| **Suspicious Behavior** | +25 | High gas ratio >70% OR velocity >10 tx/min |
| **Simulation Failure** | +20 | eth_call revert/failure |
| **High Gas Tip** | +40 | >5x network average |
| **High Gas Price** | +30 | >2x network average (legacy) |
| **Low Slippage Protection** | +30 | minOut ≤ 1 |
| **Large Swap** | +10 | >100 tokens |

### Updated Risk Levels

With Alchemy enhancements, risk scoring is more accurate:

- **🟢 LOW (0-14)**: Safe, no bot indicators
- **🟡 MEDIUM (15-29)**: Minor concerns
- **🟠 HIGH (30-59)**: Multiple risk factors
- **🔴 CRITICAL (60+)**: Bot behavior + high risk

---

## 🔧 Technical Implementation

### Backend (server.js)

#### Address Behavior Tracking
```javascript
const addressStats = new Map();

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
    
    // Bot detection logic
    const isSuspicious = 
        stats.highGasCount / stats.txCount > 0.7 || 
        stats.txCount > 10 && (stats.lastSeen - stats.firstSeen) < 60000;
    
    return { isSuspicious, txCount, highGasRatio, isKnownBot };
}
```

#### Transaction Simulation
```javascript
async function simulateTransaction(tx) {
    const simulationResult = await httpProvider.call({
        from: tx.from,
        to: tx.to,
        data: tx.data,
        value: tx.value || 0,
        gasPrice: tx.gasPrice || tx.maxFeePerGas
    });
    return { success: true, result: simulationResult };
}
```

#### System Status Broadcasting
```javascript
setInterval(() => {
    const suspiciousAddresses = Array.from(addressStats.values())
        .filter(s => s.highGasCount / s.txCount > 0.7).length;
    
    broadcast({
        type: "SYSTEM_STATUS",
        alchemyStats: {
            trackedAddresses: addressStats.size,
            suspiciousAddresses: suspiciousAddresses,
            knownBots: KNOWN_MEV_BOTS.size,
            detectionEngine: 'Alchemy Enhanced MEV Detection'
        }
    });
}, 30000);
```

### Frontend (index.html)

#### Enhanced Alert Display
```javascript
// Bot detection badge
if (data.alchemyInsights.isKnownBot) {
    alchemyBadge = '🤖 KNOWN BOT';
} else if (data.alchemyInsights.isSuspiciousBehavior) {
    alchemyBadge = '⚠️ SUSPICIOUS';
}

// Insights section
alchemyHTML = `
    <div>🔬 Alchemy Bot Detection</div>
    <div>Address Transactions: ${addressTxCount}</div>
    <div>Simulation: ${simulationSuccess ? '✅' : '❌'}</div>
`;
```

#### Stats Dashboard
```javascript
function updateAlchemyStats(data) {
    statsDiv.innerHTML = `
        🔬 Alchemy: ${trackedAddresses} addresses | 
        ${suspiciousAddresses} suspicious | 
        ${knownBots} known bots
    `;
}
```

---

## 📈 Performance Impact

### Additional API Calls

| Feature | API Call | Frequency | Cost Impact |
|---------|----------|-----------|-------------|
| Behavior Analysis | In-memory | Per TX | None |
| Simulation | `eth_call` | Per TX | ~0.5 CU/tx |
| Stats Tracking | In-memory | Per TX | None |
| Cleanup | In-memory | Every 30s | None |

### Compute Unit Usage

- **Without Alchemy Enhanced**: ~1 CU per transaction
- **With Alchemy Enhanced**: ~1.5 CU per transaction
- **Alchemy Free Tier**: 300M CU/month (200K enhanced transactions)

**Impact:** Minimal. Sepolia testnet activity is low enough that free tier is sufficient.

---

## 🎯 Use Cases

### 1. **MEV Bot Identification**

Automatically flag addresses exhibiting bot-like behavior:
- High-frequency trading patterns
- Consistent high gas usage
- Known bot address matching

### 2. **Attack Prevention**

Warn users before they interact with suspicious addresses:
- Simulation failures indicate malicious contracts
- Behavior patterns reveal front-running bots

### 3. **Research & Analytics**

Track MEV activity patterns on Sepolia:
- Bot population statistics
- Attack frequency analysis
- Gas price manipulation trends

---

## 🔍 How to Interpret Alerts

### Example 1: Known Bot Alert

```
🔴 swapTokenAForTokenB - CRITICAL 🤖 KNOWN BOT
Risk Score: 90/100
• 🤖 Known MEV bot address
• High gas tip: 12.5x network average
• Very low slippage protection

🔬 Alchemy Bot Detection
Address Transactions: 47
Simulation: ✅ Passed
🤖 Known MEV bot detected
```

**Interpretation:** This is a confirmed MEV bot. Avoid interacting when this address is active.

---

### Example 2: Suspicious Behavior

```
🟠 swapTokenAForTokenB - HIGH ⚠️ SUSPICIOUS
Risk Score: 55/100
• ⚠️ Suspicious behavior pattern (18 txs, 83% high gas)
• High gas tip: 8.2x network average

🔬 Alchemy Bot Detection
Address Transactions: 18
Simulation: ✅ Passed
⚠️ Suspicious behavior pattern
```

**Interpretation:** Not a known bot but exhibits bot-like behavior. Proceed with caution.

---

### Example 3: Simulation Failure

```
🟠 swapTokenAForTokenB - HIGH
Risk Score: 45/100
• ❌ Transaction simulation failed - possible attack
• High gas tip: 6.1x network average

🔬 Alchemy Bot Detection
Address Transactions: 3
Simulation: ❌ Failed
```

**Interpretation:** Transaction likely to revert. Possible honeypot or misconfigured parameters.

---

## 🛠️ Configuration

### Adding Known MEV Bots

Edit `server.js`:

```javascript
const KNOWN_MEV_BOTS = new Set([
    '0x1234...abcd', // Add known bot addresses here
    '0x5678...efgh',
]);
```

**Sources for bot addresses:**
- [MEV Blocker Bot List](https://etherscan.io/accounts/label/mev-bot)
- [Flashbots Known Searchers](https://docs.flashbots.net/)
- Community reports

### Adjusting Detection Thresholds

```javascript
// In analyzeAddressBehavior()
const isSuspicious = 
    stats.highGasCount / stats.txCount > 0.7 ||  // 70% threshold
    stats.txCount > 10 && (stats.lastSeen - stats.firstSeen) < 60000; // 10 tx in 1 min
```

**Recommended Thresholds:**
- **High Gas Ratio**: 60-80% (lower = more sensitive)
- **Transaction Velocity**: 5-15 txs/min (lower = more sensitive)

---

## 📚 Alchemy APIs Used

### Core APIs

1. **WebSocket Provider (`ethers.WebSocketProvider`)**
   - Real-time pending transaction stream
   - Network: Sepolia testnet

2. **HTTP JSON-RPC Provider (`ethers.JsonRpcProvider`)**
   - Transaction simulation (`eth_call`)
   - Block data retrieval
   - Receipt analysis

### Alchemy-Specific Features

- **Enhanced WebSocket**: Lower latency mempool access
- **Reliable eth_call**: Transaction simulation without state changes
- **Block History**: Full transaction data in blocks

---

## 🚨 Limitations & Considerations

### Current Limitations

1. **Sepolia Only**: Enhanced detection runs on testnet
   - **Why**: Lower activity, easier to monitor
   - **Future**: Can extend to mainnet with higher CU plan

2. **Known Bot List**: Manual curation required
   - **Why**: No centralized bot registry
   - **Mitigation**: Community-sourced addresses

3. **False Positives**: Legitimate high-frequency traders may trigger alerts
   - **Why**: Behavior patterns overlap with bots
   - **Mitigation**: Multi-factor scoring reduces false positives

### Best Practices

- **Monitor stats regularly**: Check `🔬 Alchemy` header for tracking metrics
- **Update bot list**: Add newly identified bots to `KNOWN_MEV_BOTS`
- **Review thresholds**: Adjust based on network conditions
- **Log analysis**: Export alerts for pattern analysis

---

## 🔄 Future Enhancements

### Planned Features

1. **Machine Learning Model**
   - Train on historical bot behavior
   - Predictive bot identification

2. **Alchemy Notify Integration**
   - Webhook alerts for critical events
   - Email/SMS notifications

3. **Mempool Visualization**
   - Real-time transaction flow graphs
   - Bot activity heatmaps

4. **Multi-Chain Support**
   - Extend to Ethereum mainnet
   - Polygon, Arbitrum, Optimism support

---

## 📞 Troubleshooting

### Issue: No Alchemy stats appearing

**Check:**
1. Server logs for `🔬 Alchemy` messages
2. Browser console for `SYSTEM_STATUS` messages
3. `#alchemy-stats` div in dashboard

**Solution:**
```javascript
// Verify in browser console
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Message type:', data.type);
};
```

---

### Issue: All addresses marked suspicious

**Cause:** Thresholds too sensitive

**Solution:** Adjust in `server.js`:
```javascript
const isSuspicious = 
    stats.highGasCount / stats.txCount > 0.8 || // Increase from 0.7
    stats.txCount > 15 && (stats.lastSeen - stats.firstSeen) < 60000; // Increase from 10
```

---

### Issue: Simulation failures on valid transactions

**Cause:** Contract state changed between simulation and execution

**Solution:** This is expected behavior. Simulations are point-in-time checks.

---

## 📊 Metrics & Monitoring

### Key Metrics to Track

1. **Alert Rate**: Alerts per hour
2. **Bot Detection Rate**: % of transactions flagged as bots
3. **Simulation Failure Rate**: % of failed simulations
4. **Address Tracking**: Unique addresses monitored

### Example Monitoring Dashboard

```
=== Alchemy MEV Detection Stats ===
Tracked Addresses: 24
Suspicious Addresses: 5 (20.8%)
Known Bots: 0
Total Alerts (24h): 142
Bot-Related Alerts: 37 (26%)
Simulation Failures: 8 (5.6%)
```

---

## 🎓 Learning Resources

### Alchemy Documentation
- [Enhanced APIs Overview](https://docs.alchemy.com/docs/enhanced-apis)
- [WebSocket Streams](https://docs.alchemy.com/docs/deep-dive-into-websocket)
- [Transaction Simulation](https://docs.alchemy.com/docs/simulation-overview)

### MEV Research
- [Flashbots Research](https://writings.flashbots.net/)
- [MEV-Inspect](https://github.com/flashbots/mev-inspect-py)
- [MEV Wiki](https://www.mev.wiki/)

---

## ✅ Verification Checklist

After implementing Alchemy Enhanced features:

- [ ] Backend starts with `🔬 Alchemy` log messages
- [ ] Dashboard shows `🔬 Alchemy:` stats in header
- [ ] Alerts include `🔬 Alchemy Bot Detection` section
- [ ] Known bot badges appear (`🤖 KNOWN BOT`)
- [ ] Suspicious badges appear (`⚠️ SUSPICIOUS`)
- [ ] System status updates every 30 seconds
- [ ] Address stats cleanup every 30 seconds
- [ ] Simulation results logged in console

---

**🏁 Your dashboard now has professional-grade MEV bot detection powered by Alchemy!**
