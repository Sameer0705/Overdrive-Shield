# 🚀 F1 MEV Protection Dashboard - Deployment Guide

## Quick Start (Local Development)

### Step 1: Prerequisites Check

```bash
# Verify Node.js (must be v16+)
node --version

# Verify npm
npm --version

# Verify MetaMask is installed in browser
# Visit: https://metamask.io/
```

### Step 2: Install Dependencies

```bash
cd e:\mev-dashboard
npm install
```

### Step 3: Verify Configuration

Your `.env` file is already configured:
```bash
ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/RpEw0-KogWJY7CHXFpEwR
MY_DEX_ADDRESS=0xe723eec12d0c50c57b651c45b325a9a1ccc54ec1
```

### Step 4: Start the System

**Terminal 1 - Backend Server:**
```bash
npm start
```

Expected output:
```
WebSocket alert server started on port 8080
✅ Monitoring Sepolia mempool for MyDEX: 0xe723eec12d0c50c57b651c45b325a9a1ccc54ec1
   Swap Signature: 0x...
   Liquidity Signature: 0x...
```

**Terminal 2 - Frontend Dashboard:**
```bash
# Option 1: Open directly in browser
# Navigate to index.html in File Explorer and double-click

# Option 2: Use http-server (recommended)
npx http-server . -p 3000
# Then open: http://localhost:3000
```

### Step 5: Connect & Test

1. **Open Dashboard** → `http://localhost:3000` or `file:///e:/mev-dashboard/index.html`
2. **Check Status** → Top-right should show "Live" with green indicator
3. **Connect Wallet** → Click "Connect Wallet", approve MetaMask
4. **Switch Network** → MetaMask should be on "Sepolia Test Network"
5. **Test Simulation**:
   - Enter amount: `10`
   - Set slippage: `1`
   - Click "🏁 Simulate Swap"
   - Results appear with reserve data

---

## 🌐 Production Deployment Options

### Option A: Backend on Render + Frontend on Netlify (Recommended)

#### Backend (Render.com)

1. **Create account** at [render.com](https://render.com)

2. **New Web Service**:
   - Connect your Git repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
   - Plan: Free tier

3. **Add Environment Variables**:
   ```
   ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/RpEw0-KogWJY7CHXFpEwR
   MY_DEX_ADDRESS=0xe723eec12d0c50c57b651c45b325a9a1ccc54ec1
   PORT=8080
   ```

4. **Deploy** → Note WebSocket URL (e.g., `wss://your-app.onrender.com`)

#### Frontend (Netlify)

1. **Update** `index.html` WebSocket URL:
   ```javascript
   // Change from:
   const socket = new WebSocket('ws://localhost:8080');
   
   // To:
   const socket = new WebSocket('wss://your-app.onrender.com');
   ```

2. **Deploy to Netlify**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=.
   ```

3. **Configure**: Select `index.html` as entry point

---

### Option B: Full Stack on Fly.io

1. **Install Fly CLI**:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Verify
   fly version
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Create `fly.toml`**:
   ```toml
   app = "f1-mev-dashboard"
   
   [build]
     builder = "heroku/buildpacks:20"
   
   [[services]]
     internal_port = 8080
     protocol = "tcp"
   
     [[services.ports]]
       handlers = ["http"]
       port = 80
   
     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   ```

4. **Set Secrets**:
   ```bash
   fly secrets set ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/RpEw0-KogWJY7CHXFpEwR
   fly secrets set MY_DEX_ADDRESS=0xe723eec12d0c50c57b651c45b325a9a1ccc54ec1
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

---

### Option C: AWS EC2 (Advanced)

1. **Launch EC2 Instance** (Ubuntu 22.04, t2.micro free tier)

2. **SSH into instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Setup**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   
   # Clone/upload your code
   git clone your-repo-url
   cd f1-mev-dashboard
   npm install
   ```

4. **Configure environment**:
   ```bash
   nano .env
   # Paste your ALCHEMY_WSS_URL and MY_DEX_ADDRESS
   ```

5. **Start with PM2**:
   ```bash
   pm2 start server.js --name "f1-mev-backend"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx** (reverse proxy):
   ```bash
   sudo apt install -y nginx
   sudo nano /etc/nginx/sites-available/default
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /home/ubuntu/f1-mev-dashboard;
           index index.html;
           try_files $uri $uri/ =404;
       }
       
       location /ws {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```
   
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL** (optional, recommended):
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🔒 Security Checklist

### Before Deployment

- [ ] Remove any test private keys from code
- [ ] Verify `.env` is in `.gitignore`
- [ ] Update CORS settings if needed
- [ ] Set rate limits on WebSocket server
- [ ] Enable HTTPS/WSS in production
- [ ] Add authentication for admin endpoints (if any)
- [ ] Review and minimize RPC call frequency
- [ ] Test with production RPC limits

### Post Deployment

- [ ] Monitor server logs for errors
- [ ] Test WebSocket connection from client
- [ ] Verify alerts are appearing
- [ ] Check simulation accuracy against on-chain data
- [ ] Monitor Alchemy usage/rate limits
- [ ] Set up uptime monitoring (UptimeRobot, etc.)

---

## 📊 Monitoring & Maintenance

### Log Monitoring

**Local:**
```bash
# Server logs
npm start

# WebSocket traffic (enable in server.js if needed)
```

**Production (PM2):**
```bash
pm2 logs f1-mev-backend
pm2 monit
```

### Health Checks

Create `healthcheck.js`:
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');
ws.on('open', () => {
    console.log('✅ WebSocket server is healthy');
    ws.close();
    process.exit(0);
});
ws.on('error', (err) => {
    console.error('❌ WebSocket server is down:', err.message);
    process.exit(1);
});
```

Run:
```bash
node healthcheck.js
```

### Updating Code

```bash
# Pull latest changes
git pull

# Restart server
pm2 restart f1-mev-backend

# Or locally
# Ctrl+C and npm start again
```

---

## 🐛 Common Deployment Issues

### Issue: WebSocket won't connect

**Symptoms**: Dashboard shows "Offline" status

**Solutions**:
1. Check server is running: `pm2 status` or check terminal
2. Verify firewall allows port 8080
3. Check WebSocket URL in `index.html` matches deployment
4. For WSS (production), ensure SSL certificate is valid

### Issue: "CORS error" in browser console

**Solution**: Add CORS headers to server.js:
```javascript
wss.on("connection", (ws, req) => {
    ws.setHeader('Access-Control-Allow-Origin', '*');
    // ... rest of code
});
```

### Issue: Alchemy rate limit exceeded

**Symptoms**: Server logs "429 Too Many Requests"

**Solutions**:
1. Upgrade Alchemy plan
2. Add rate limiting in server.js
3. Cache reserve data instead of fetching every time
4. Reduce WebSocket subscription frequency

### Issue: Dashboard loads but simulation fails

**Solutions**:
1. Check browser console for errors
2. Verify RPC URL in `index.html` is correct
3. Test RPC endpoint: `curl https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
4. Ensure contract has liquidity (check on Etherscan)

---

## 📈 Performance Optimization

### Backend

```javascript
// Add to server.js

// 1. Rate limit broadcasts
let lastBroadcast = 0;
const BROADCAST_COOLDOWN = 500; // ms

function broadcast(data) {
    const now = Date.now();
    if (now - lastBroadcast < BROADCAST_COOLDOWN) return;
    lastBroadcast = now;
    // ... existing broadcast code
}

// 2. Connection limit
const MAX_CONNECTIONS = 100;
let connectionCount = 0;

wss.on("connection", (ws) => {
    if (connectionCount >= MAX_CONNECTIONS) {
        ws.close(1008, 'Server at capacity');
        return;
    }
    connectionCount++;
    ws.on('close', () => connectionCount--);
});
```

### Frontend

```javascript
// Add to index.html

// 1. Debounce simulation
let simTimeout;
function simulateSwap() {
    clearTimeout(simTimeout);
    simTimeout = setTimeout(() => {
        // ... existing simulation code
    }, 300);
}

// 2. Limit stored alerts
const MAX_ALERTS = 50;
function addAlert(data) {
    // ... existing code
    while (alertFeed.children.length > MAX_ALERTS) {
        alertFeed.removeChild(alertFeed.lastChild);
    }
}
```

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST \
            https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys \
            -H "Authorization: Bearer $RENDER_API_KEY"
```

---

## 📞 Support & Troubleshooting

### Quick Diagnostics

```bash
# Test server connectivity
npm run test-connection

# Check environment variables
cat .env

# Verify contract on Etherscan
# https://sepolia.etherscan.io/address/0xe723eec12d0c50c57b651c45b325a9a1ccc54ec1
```

### Debug Mode

Enable verbose logging in `server.js`:
```javascript
const DEBUG = true;

if (DEBUG) {
    console.log(`[DEBUG] Processing TX: ${txHash}`);
    console.log(`[DEBUG] Risk score: ${riskScore}`);
}
```

---

## ✅ Deployment Checklist

### Pre-Launch
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Server starts without errors
- [ ] WebSocket connects successfully
- [ ] Wallet connects to dashboard
- [ ] Simulation returns accurate results
- [ ] Alerts display in real-time

### Launch
- [ ] Server deployed and running
- [ ] Frontend accessible via URL
- [ ] SSL/TLS enabled (production)
- [ ] Monitoring/logging configured
- [ ] Backup/recovery plan in place

### Post-Launch
- [ ] Test all features in production
- [ ] Monitor performance metrics
- [ ] Check error rates
- [ ] Verify Alchemy usage stays within limits
- [ ] Document any production-specific configs

---

**🏁 You're ready to deploy! Start with local testing, then choose a production platform.**
