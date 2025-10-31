# 🎯 MEV Type Detection - Front-Run vs Back-Run

## ✅ Feature Added

Your dashboard now **distinguishes between different types of MEV attacks** with visual badges!

---

## 🎨 MEV Type Badges

### 1. 🎯 FRONT-RUN (Orange)
- **Indicates:** First high-gas transaction in a sequence
- **Color:** Orange gradient with glow
- **Detection:** High gas + No prior transaction from same address
- **Typical:** Attacker trying to get in before victim

### 2. 🔄 BACK-RUN (Purple)
- **Indicates:** Follow-up high-gas transaction
- **Color:** Purple gradient with glow
- **Detection:** High gas + Previous transaction from same address
- **Typical:** Attacker closing the sandwich

### 3. ✅ NORMAL (Green)
- **Indicates:** Standard transaction
- **Color:** Green gradient
- **Detection:** Risk score < 15
- **Typical:** Regular user transaction

### 4. ⚠️ SUSPICIOUS (Yellow)
- **Indicates:** Unusual but not confirmed MEV
- **Color:** Yellow gradient
- **Detection:** Risk score 15-29 without clear pattern
- **Typical:** Borderline activity

---

## 🔍 How Detection Works

### Pattern Recognition

```javascript
// First high-gas transaction from address
if (highGas && riskScore >= 30 && !seenBefore) {
    → FRONT-RUN 🎯
}

// Subsequent high-gas transaction from same address
if (highGas && riskScore >= 30 && seenBefore) {
    → BACK-RUN 🔄
}

// Low risk transaction
if (riskScore < 15) {
    → NORMAL ✅
}

// Everything else
else {
    → SUSPICIOUS ⚠️
}
```

---

## 📊 Visual Examples

### Front-Run Alert
```
┌─────────────────────────────────────────────────────────┐
│ 🟠 swapTokenAForTokenB - HIGH                          │
│    🎯 FRONT-RUN ATTEMPT  🤖 KNOWN BOT                  │
├─────────────────────────────────────────────────────────┤
│ From: 0xb376...d5b                                      │
│ Risk Score: 70/100                                      │
│ Gas: 12.5 Gwei tip (8.3x avg)                          │
│ • 🎯 Potential front-run transaction detected          │
│ • High gas tip: 8.3x network average                   │
│ • Very low slippage protection                          │
├─────────────────────────────────────────────────────────┤
│ 🔬 Alchemy Bot Detection                                │
│ Address Transactions: 1                                 │
│ Simulation: ✅ Passed                                   │
└─────────────────────────────────────────────────────────┘
```

### Back-Run Alert
```
┌─────────────────────────────────────────────────────────┐
│ 🟠 swapTokenAForTokenB - HIGH                          │
│    🔄 BACK-RUN ATTEMPT  ⚠️ SUSPICIOUS                  │
├─────────────────────────────────────────────────────────┤
│ From: 0xb376...d5b                                      │
│ Risk Score: 65/100                                      │
│ Gas: 11.2 Gwei tip (7.5x avg)                          │
│ • 🔄 Potential back-run transaction detected           │
│ • High gas tip: 7.5x network average                   │
│ • ⚠️ Suspicious behavior pattern (2 txs, 100% high gas)│
├─────────────────────────────────────────────────────────┤
│ 🔬 Alchemy Bot Detection                                │
│ Address Transactions: 2                                 │
│ Simulation: ✅ Passed                                   │
│ ⚠️ Suspicious behavior pattern                         │
└─────────────────────────────────────────────────────────┘
```

### Normal Transaction
```
┌─────────────────────────────────────────────────────────┐
│ 🟢 swapTokenAForTokenB - LOW                           │
│    ✅ NORMAL TRANSACTION                                │
├─────────────────────────────────────────────────────────┤
│ From: 0x1234...5678                                     │
│ Risk Score: 5/100                                       │
│ Gas: 2.1 Gwei tip (1.2x avg)                           │
├─────────────────────────────────────────────────────────┤
│ 🔬 Alchemy Bot Detection                                │
│ Address Transactions: 1                                 │
│ Simulation: ✅ Passed                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test Sequence

Run these commands to see different MEV types:

```bash
# Terminal 1: Backend running
npm start

# Terminal 2: Test front-run
npm run swap-frontrun
# Dashboard shows: 🎯 FRONT-RUN ATTEMPT (orange badge)
# Server logs: MEV Type: 🎯 FRONT-RUN ATTEMPT

# Wait 2 seconds, then test back-run
npm run swap-backrun
# Dashboard shows: 🔄 BACK-RUN ATTEMPT (purple badge)
# Server logs: MEV Type: 🔄 BACK-RUN ATTEMPT

# Test normal transaction
npm run swap-victim
# Dashboard shows: ✅ NORMAL TRANSACTION (green badge)
# Server logs: MEV Type: ✅ NORMAL TRANSACTION
```

---

## 📈 What You'll See

### Server Logs
```
[9:35:42 AM] 📡 Detected TX: 0xabc123... from 0xb376...
   Risk Level: HIGH (Score: 70)
   MEV Type: 🎯 FRONT-RUN ATTEMPT
   Risk Factors: 🎯 Potential front-run transaction detected, High gas tip: 8.3x
   
[9:35:45 AM] 📡 Detected TX: 0xdef456... from 0xb376...
   Risk Level: HIGH (Score: 65)
   MEV Type: 🔄 BACK-RUN ATTEMPT
   Risk Factors: 🔄 Potential back-run transaction detected, High gas tip: 7.5x
```

### Dashboard Alerts

**Color Coding:**
- 🎯 **Orange badge** = Front-run
- 🔄 **Purple badge** = Back-run
- ✅ **Green badge** = Normal
- ⚠️ **Yellow badge** = Suspicious

---

## 🎨 Badge Styles

### CSS Classes

```css
.mev-frontrun { 
    background: linear-gradient(135deg, #FF6B35, #FF8C5C);
    color: white;
    box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
}

.mev-backrun { 
    background: linear-gradient(135deg, #9333EA, #A855F7);
    color: white;
    box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
}

.mev-normal { 
    background: linear-gradient(135deg, #10B981, #34D399);
    color: white;
}

.mev-suspicious { 
    background: linear-gradient(135deg, #FFD700, #FDE047);
    color: black;
}
```

---

## 🔧 Detection Logic Details

### Risk Score Thresholds

```javascript
if (riskScore >= 60) → CRITICAL
if (riskScore >= 30) → HIGH  (enables MEV type detection)
if (riskScore >= 15) → MEDIUM
if (riskScore < 15)  → LOW (marked as NORMAL)
```

### High Gas Criteria

```javascript
isHighGas = 
    gasPrice > networkAverage * 2 ||
    priorityFee > networkAverage * 5
```

### Pattern Tracking

```javascript
// Server maintains a map of recent high-risk transactions
potentialFrontRuns = {
    '0xb376...': { txHash, timestamp, riskScore }
}

// First high-risk tx from address → FRONT-RUN
// Second high-risk tx from address → BACK-RUN
```

---

## 📊 Data Structure

### Alert Data (Backend → Frontend)

```json
{
  "type": "MEV_ALERT",
  "hash": "0xabc...",
  "from": "0xb376...",
  "riskLevel": "HIGH",
  "riskScore": 70,
  "mevType": "FRONT-RUN",
  "mevBadge": "🎯 FRONT-RUN ATTEMPT",
  "riskFactors": [
    "🎯 Potential front-run transaction detected",
    "High gas tip: 8.3x network average",
    "Very low slippage protection"
  ],
  "alchemyInsights": {
    "isKnownBot": false,
    "isSuspiciousBehavior": true,
    "addressTxCount": 1,
    "simulationSuccess": true
  }
}
```

---

## 🎯 Use Cases

### 1. Identifying Sandwich Attacks

**Pattern:**
```
1. 🎯 FRONT-RUN from 0xAttacker (buys Token B, price goes up)
2. ✅ NORMAL from 0xVictim (buys Token B at inflated price)
3. 🔄 BACK-RUN from 0xAttacker (sells Token B, profits)
```

**Dashboard Shows:**
- Orange badge on first tx
- Green badge on victim tx
- Purple badge on final tx

### 2. Bot Activity Monitoring

Track if same address performs:
- Multiple front-runs (🎯 → 🎯 → 🎯)
- Multiple back-runs (🔄 → 🔄 → 🔄)
- Front-run/back-run pairs (🎯 → 🔄)

### 3. User Protection

**Before trade, check alerts:**
- Many 🎯 badges → High front-run activity, wait
- Many 🔄 badges → Bots active, increase slippage
- Mostly ✅ badges → Safe to trade

---

## 🔍 Advanced Detection (Future)

### Potential Enhancements

1. **Victim Detection**
   - Identify transactions sandwiched between front/back runs
   - Add 🎯 VICTIM badge

2. **Time-Based Patterns**
   - Track front-run → back-run time gap
   - Flag suspiciously quick sequences (<10 seconds)

3. **Multi-Address Tracking**
   - Detect coordinated attacks from multiple addresses
   - Identify bot networks

4. **Profitability Analysis**
   - Calculate estimated profit from sandwich
   - Show in alert: "Est. Profit: 2.5 ETH"

---

## 📚 Reference

### MEV Type Classification

| Type | Emoji | Color | Risk | Meaning |
|------|-------|-------|------|---------|
| FRONT-RUN | 🎯 | Orange | HIGH | First attack tx |
| BACK-RUN | 🔄 | Purple | HIGH | Follow-up tx |
| NORMAL | ✅ | Green | LOW | Regular tx |
| SUSPICIOUS | ⚠️ | Yellow | MEDIUM | Unclear pattern |

### Detection Confidence

- **High Confidence:** 🎯 FRONT-RUN, 🔄 BACK-RUN
  - Based on gas price + transaction sequence
  
- **Medium Confidence:** ⚠️ SUSPICIOUS
  - Elevated risk but no clear pattern
  
- **High Confidence:** ✅ NORMAL
  - Low risk score, normal gas

---

## ✅ Summary

**New Feature:** MEV Type Detection  
**Types:** Front-Run, Back-Run, Normal, Suspicious  
**Visual:** Color-coded badges with icons  
**Detection:** Gas analysis + transaction sequencing  
**Display:** Both server logs and dashboard alerts  

---

**🎯 Test it now! Run `npm run swap-frontrun` then `npm run swap-backrun` to see different badges!**
