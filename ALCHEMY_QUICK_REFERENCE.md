# 🚀 Alchemy Enhanced Detection - Quick Reference

## One-Page Cheat Sheet

---

## 🎯 What's New?

```
✨ MEV Bot Behavior Tracking
✨ Transaction Simulation (eth_call)
✨ Address Statistics
✨ Enhanced Risk Scoring (+75 points)
✨ Live Bot Stats in Dashboard
```

---

## 📊 Enhanced Risk Scoring

| Detection | Points | Trigger |
|-----------|--------|---------|
| 🤖 Known Bot | +50 | Address in known bot list |
| ⚠️ Suspicious | +25 | >70% high gas OR >10 tx/min |
| ❌ Simulation Fail | +20 | eth_call reverts |
| 🔥 High Gas | +40 | >5x network average |
| 💸 Low Slippage | +30 | minOut ≤ 1 |
| 📈 Large Swap | +10 | >100 tokens |

**Risk Levels:**
- 🟢 LOW (0-14)
- 🟡 MEDIUM (15-29)
- 🟠 HIGH (30-59)
- 🔴 CRITICAL (60+)

---

## 🔍 Alert Badges

| Badge | Meaning | Action |
|-------|---------|--------|
| 🤖 KNOWN BOT | Confirmed MEV bot | Avoid trading now |
| ⚠️ SUSPICIOUS | Bot-like behavior | Proceed with caution |
| ❌ Sim Failed | Will likely revert | Check parameters |
| 🟢 (none) | Normal transaction | Safe to trade |

---

## 📱 Dashboard Elements

### Header Stats
```
🔬 Alchemy: 12 addresses tracked | 3 suspicious | 0 known bots
```

### Alert Card
```
🔴 swapTokenAForTokenB - CRITICAL 🤖 KNOWN BOT
Risk Score: 90/100

• 🤖 Known MEV bot address
• High gas tip: 15.2x network average

🔬 Alchemy Bot Detection
Address Transactions: 237
Simulation: ✅ Passed
🤖 Known MEV bot detected
```

---

## ⚙️ Configuration

### Add Known Bots
```javascript
// In server.js
const KNOWN_MEV_BOTS = new Set([
    '0x1234567890abcdef...',
    '0xfedcba0987654321...',
]);
```

### Adjust Thresholds
```javascript
// In server.js, analyzeAddressBehavior()
const isSuspicious = 
    stats.highGasCount / stats.txCount > 0.7 ||  // 70% threshold
    stats.txCount > 10 && (duration < 60000);    // 10 tx/min
```

---

## 🔧 Key Functions

### Backend (server.js)
```javascript
analyzeAddressBehavior(address)  // Bot detection
simulateTransaction(tx)           // eth_call check
updateAlchemyStats()              // Stats broadcast
```

### Frontend (index.html)
```javascript
updateAlchemyStats(data)  // Update header
addAlert(data)            // Show bot badges
```

---

## 📊 API Usage

**Per Transaction:**
- Base detection: 0 CU
- Simulation: ~0.5 CU
- **Total: ~0.5 CU**

**Free Tier:**
- 300M CU/month
- = 600,000 enhanced transactions/month
- Sepolia usage: <1,000/month
- **Utilization: <0.2%**

---

## 🐛 Quick Troubleshooting

### No Stats in Header
```bash
# Check server logs for:
🧹 Cleanup: Tracking X potential front-runs, Y addresses
```

### No Bot Badges
```javascript
// Verify in browser console:
data.alchemyInsights.isKnownBot
data.alchemyInsights.isSuspiciousBehavior
```

### All Transactions Flagged
```javascript
// Lower sensitivity in server.js:
stats.highGasCount / stats.txCount > 0.8  // was 0.7
stats.txCount > 15  // was 10
```

---

## 📚 Full Documentation

| File | Purpose |
|------|---------|
| **ALCHEMY_FEATURES.md** | Complete technical docs |
| **ALCHEMY_INTEGRATION_SUMMARY.md** | Overview & examples |
| **ALCHEMY_QUICK_REFERENCE.md** | This cheat sheet |

---

## ✅ Quick Verification

```bash
# 1. Start server
npm start
# Look for: 🧹 Cleanup: Tracking...

# 2. Open dashboard
# Check header: 🔬 Alchemy: ...

# 3. Trigger alert
# (Send test transaction or wait for real one)

# 4. Verify alert shows:
#    - Bot badge (if applicable)
#    - 🔬 Alchemy Bot Detection section
```

---

## 🎓 Key Concepts

**Suspicious Behavior:**
- >70% transactions with high gas
- OR >10 transactions in <1 minute

**Transaction Simulation:**
- Executes tx without mining
- Detects likely failures
- Uses Alchemy's eth_call

**Address Tracking:**
- Automatic per-transaction
- 5-minute expiry
- Zero overhead

---

## 🏆 Pro Tips

1. **Add bots as you find them** → Update `KNOWN_MEV_BOTS`
2. **Monitor the header stats** → Track suspicious addresses
3. **Check simulation failures** → Often indicates honeypots
4. **Export logs periodically** → Analyze patterns
5. **Tune thresholds** → Adjust for your network activity

---

## 🚀 Commands

```bash
# Start monitoring
npm start

# View logs
# (Check terminal)

# Open dashboard
npx http-server . -p 3000

# Test connection
npm run test-connection
```

---

## 📞 Support

**Check Logs:** Server terminal + Browser console (F12)

**Verify Config:** `.env` has correct URLs

**Read Docs:** `ALCHEMY_FEATURES.md` for deep dive

---

**🏁 Quick Start: `npm start` → Open `index.html` → Watch for 🤖 badges!**
