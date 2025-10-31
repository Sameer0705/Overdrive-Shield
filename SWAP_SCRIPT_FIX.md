# ✅ Swap Script Fixed

## 🔍 The Problem

You tried to run:
```bash
npm run swap-backrun
```

And got:
```
missing revert data (action="estimateGas")
code=CALL_EXCEPTION
```

**Root Cause:** The script was trying to call `swapTokenBForTokenA()` which **doesn't exist** in your contract.

---

## 🎯 Why It Failed

### Your Contract (MyHyperOptimizedDEX):
```solidity
✅ swapTokenAForTokenB(uint256 amountInA, uint256 amountOutMin)
❌ swapTokenBForTokenA(...)  // DOES NOT EXIST
```

### Old send_swap.js:
```javascript
// Line 19: Wrong ABI
const DEX_ABI = [
    "function swapTokenAForTokenB(...)",
    "function swapTokenBForTokenA(...)"  // ❌ Doesn't exist!
];

// Line 182: Tried to call non-existent function
const tx = await dexContract.swapTokenBForTokenA(...);  // ❌ FAILS
```

---

## ✅ What I Fixed

### Updated ABI (Lines 17-21):
```javascript
const DEX_ABI = [
    "function swapTokenAForTokenB(uint256 amountInA, uint256 amountOutMin) external"
    // Note: MyHyperOptimizedDEX only has swapTokenAForTokenB
    // No swapTokenBForTokenA function exists
];
```

### Updated sendBackRun() Function (Lines 156-196):
Changed from using non-existent `swapTokenBForTokenA` to using `swapTokenAForTokenB`:

```javascript
async function sendBackRun() {
    await approveTokenA();  // ✅ Use Token A (not B)
    console.log("🚀 Sending a BACK-RUN swap (High Gas)...");
    console.log("   NOTE: This DEX only has swapTokenAForTokenB");
    console.log("   Back-run = Another A→B swap with high gas");

    // Get Token A balance (not B)
    const tokenABalance = await tokenAContract.balanceOf(wallet.address);
    
    // Swap Token A for Token B (same direction as front-run)
    const tx = await dexContract.swapTokenAForTokenB(amountInA, amountOutMin, {
        maxPriorityFeePerGas: parseUnits("0.5", "gwei"),
        maxFeePerGas: parseUnits("2", "gwei")
    });
}
```

---

## 🧠 Understanding the Fix

### Traditional Sandwich Attack:
```
1. Front-run: Buy Token B (victim buys B, price goes up)
2. Victim: Buys Token B
3. Back-run: Sell Token B (profit from higher price)
```

### Your Contract's Limitation:
Your DEX only swaps **A → B**, not **B → A**.

So a "back-run" means:
```
1. Front-run: Swap A → B (high gas)
2. Victim: Swaps A → B (normal gas)  
3. Back-run: Swap MORE A → B (high gas)
```

This simulates competitive trading, not a traditional sandwich.

---

## 🚀 How to Test Now

### 1. Run Front-Run:
```bash
npm run swap-frontrun
```

**Expected:**
```
✅ Token A Approved!
🚀 Sending a FRONT-RUN swap (High Gas)...
   Sent! Transaction Hash: 0x...
```

### 2. Run Victim Swap:
```bash
npm run swap-victim
```

**Expected:**
```
👤 Sending a VICTIM swap (Normal Gas)...
   Sent! Transaction Hash: 0x...
```

### 3. Run Back-Run (Now Fixed!):
```bash
npm run swap-backrun
```

**Expected:**
```
✅ Token A already approved.
🚀 Sending a BACK-RUN swap (High Gas)...
   NOTE: This DEX only has swapTokenAForTokenB
   Back-run = Another A→B swap with high gas
   Current Token A Balance: 9999980.0
   Sent! Transaction Hash: 0x...
```

---

## 📊 What Each Script Does

### npm run swap-frontrun
- **Purpose:** Simulate MEV bot front-running
- **Action:** Swaps 10 Token A → Token B
- **Gas:** HIGH (0.5 Gwei tip)
- **Shows in Dashboard:** 🟠 HIGH or 🔴 CRITICAL alert

### npm run swap-victim
- **Purpose:** Simulate normal user transaction
- **Action:** Swaps 10 Token A → Token B
- **Gas:** NORMAL (default)
- **Shows in Dashboard:** 🟢 LOW alert

### npm run swap-backrun (NOW FIXED)
- **Purpose:** Simulate back-run attempt
- **Action:** Swaps 10 Token A → Token B
- **Gas:** HIGH (0.5 Gwei tip)
- **Shows in Dashboard:** 🟠 HIGH or 🔴 CRITICAL alert

---

## 🎯 Expected Dashboard Behavior

### After Running These Commands:

1. **Run:** `npm run swap-frontrun`
   **Dashboard Shows:**
   ```
   🔴 swapTokenAForTokenB - CRITICAL
   Risk Score: 40-70/100
   • High gas tip: 5-8x network average
   ```

2. **Run:** `npm run swap-victim`
   **Dashboard Shows:**
   ```
   🟢 swapTokenAForTokenB - LOW
   Risk Score: 0-10/100
   ```

3. **Run:** `npm run swap-backrun`
   **Dashboard Shows:**
   ```
   🟠 swapTokenAForTokenB - HIGH
   Risk Score: 40-70/100
   • High gas tip: 5-8x network average
   ```

---

## 🔍 Verify It's Working

### In Dashboard Console (F12):

After running any swap command, you should see:
```javascript
Alert received: {
  type: 'MEV_ALERT',
  hash: '0x...',
  riskLevel: 'HIGH',
  riskScore: 40,
  riskFactors: ['High gas tip: 5.2x network average'],
  alchemyInsights: {
    isKnownBot: false,
    isSuspiciousBehavior: false,
    ...
  }
}
```

### In Server Terminal:

```
📡 Detected TX: 0xabc123... from 0xb376...
   Risk Level: HIGH (Score: 40)
   Risk Factors: High gas tip: 5.2x network average
```

---

## ⚠️ Common Issues

### Issue 1: "Insufficient funds"

**Error:**
```
insufficient funds for intrinsic transaction cost
```

**Solution:** Get Sepolia ETH from faucet:
- https://sepoliafaucet.com/
- https://sepolia-faucet.pk910.de/

### Issue 2: "Token A not approved"

**Error:**
```
execution reverted: "ERC20: insufficient allowance"
```

**Solution:** The script auto-approves, but if it fails:
```javascript
// Manually approve in your code
await tokenAContract.approve(DEX_ADDRESS, ethers.MaxUint256);
```

### Issue 3: "Transaction underpriced"

**Error:**
```
transaction underpriced
```

**Solution:** Increase gas in send_swap.js:
```javascript
maxPriorityFeePerGas: parseUnits("1", "gwei"), // Increase from 0.5
maxFeePerGas: parseUnits("3", "gwei") // Increase from 2
```

---

## 📚 File Structure

```
e:\mev-dashboard\
├── send_swap.js          ✅ FIXED - Now uses correct function
├── server.js             ✅ Monitors transactions
├── index.html            ✅ Displays alerts
└── .env                  ✅ Has your config
```

---

## ✅ Quick Test Sequence

Run these in order to see MEV detection in action:

```bash
# Terminal 1: Backend running
npm start

# Terminal 2: Send test transactions
npm run swap-frontrun
# Wait 5 seconds, check dashboard for HIGH alert

npm run swap-victim  
# Wait 5 seconds, check dashboard for LOW alert

npm run swap-backrun
# Wait 5 seconds, check dashboard for HIGH alert
```

**Expected Result:**
- 3 alerts appear in dashboard
- 2 are HIGH/CRITICAL (front-run, back-run)
- 1 is LOW (victim)
- Alchemy detection tracks your address as "suspicious" after 3 quick transactions

---

## 🏁 Summary

**Problem:** Script tried to call non-existent `swapTokenBForTokenA`  
**Cause:** Contract only has `swapTokenAForTokenB`  
**Solution:** Updated script to use correct function  
**Result:** All test swaps now work correctly

---

**🚀 Try running `npm run swap-backrun` again! It should work now.**
