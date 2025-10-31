# ⚡ Quick Start Guide - F1 MEV Protection Dashboard

## 🎯 Get Running in 2 Minutes

### Step 1: Start the Backend (Terminal 1)

```bash
npm start
```

**Expected Output:**
```
WebSocket alert server started on port 8080
✅ Monitoring Sepolia mempool for MyDEX: 0xe723eec12d0c50c57b651c45b325a9a1ccc54ec1
```

### Step 2: Open the Dashboard

**Option A - Direct File Access:**
- Navigate to `e:\mev-dashboard` in File Explorer
- Double-click `index.html`

**Option B - Local Server (Recommended):**
```bash
npx http-server . -p 3000
```
Then open: `http://localhost:3000`

### Step 3: Connect Your Wallet

1. Click **"Connect Wallet"** button (top-right)
2. Approve MetaMask connection
3. **Switch to Sepolia Testnet** in MetaMask
4. Dashboard shows your address

### Step 4: Try a Simulation

1. **Enter Amount**: `10` (Token A)
2. **Set Slippage**: `1` (%)
3. Click **"🏁 Simulate Swap"**
4. **View Results**:
   - Expected output
   - Minimum output with slippage
   - Price impact
   - Current reserves

### Step 5: Monitor Alerts

- Alerts appear **automatically** when transactions hit the mempool
- Color-coded by risk: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
- Check **Security Advice** panel for recommendations

---

## 🎨 What You'll See

### Dashboard Features

```
┌─────────────────────────────────────────────────────────┐
│ 🏎️ F1 MEV PROTECTION                    [Connect Wallet]│
│ Contract: 0xe723...4ec1                 Status: ● Live  │
├─────────────────────┬───────────────────────────────────┤
│ ⚡ Swap Simulator   │ 🚨 Live MEV Alerts               │
│                     │                                   │
│ Token A: [10]       │ 🔴 swapTokenAForTokenB - CRITICAL│
│ Slippage: [1%]      │ Risk Score: 70/100                │
│                     │ • High gas tip: 8.3x avg          │
│ [🏁 Simulate Swap]  │ • Low slippage protection         │
│                     │                                   │
│ Expected: 9.8 B     │ 🟢 addLiquidity - LOW             │
│ Min Out: 9.7 B      │ Risk Score: 5/100                 │
│ Impact: 0.8%        │                                   │
├─────────────────────┼───────────────────────────────────┤
│ 💡 Security Advice  │ 🏆 F1 Applications               │
│                     │                                   │
│ ✅ Good slippage    │ 🎟️ Team Merch & Ticketing        │
│ ✅ Low impact       │ 🏅 Fan Token Trading              │
│ 💡 Verify before... │ 💰 Sponsorship Escrow             │
│                     │ 📊 Telemetry Marketplace          │
└─────────────────────┴───────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### "Offline" Status
```bash
# Check if server is running
# Should see: "WebSocket alert server started on port 8080"
```

### Can't Connect Wallet
1. Install [MetaMask](https://metamask.io/)
2. Switch to **Sepolia** network
3. Refresh page

### Simulation Fails
1. Check console (F12)
2. Verify you're on Sepolia
3. Ensure contract has liquidity

### No Alerts Appearing
- Alerts only appear when **new transactions** are sent to your DEX
- To test: Use `npm run swap-victim` in another terminal (if you have test tokens)

---

## 📚 Next Steps

- **Read Full Docs**: `README.md`
- **Deploy to Production**: `DEPLOYMENT.md`
- **Learn the Architecture**: See README > Architecture section
- **Customize Theme**: Edit CSS variables in `index.html`

---

## 🆘 Need Help?

1. **Check logs**: Server terminal + Browser console (F12)
2. **Verify setup**: `.env` file has correct values
3. **Test connection**: `npm run test-connection`
4. **Review docs**: `README.md` has detailed troubleshooting

---

**🏁 That's it! You're monitoring MEV in real-time with an F1-themed dashboard.**
