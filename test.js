// --- test_connection.js ---
const WebSocket = require('ws'); // Use the 'ws' library directly

// !! EDIT THIS VALUE !!
const WSS_URL = "wss://eth-sepolia.g.alchemy.com/v2/RpEw0-KogWJY7CHXFpEwR";

console.log(`Attempting to connect to: ${WSS_URL}`);

const ws = new WebSocket(WSS_URL);

ws.on('open', function open() {
  console.log('✅ WebSocket Connection Opened Successfully!');
  // Now we try to subscribe to new blocks (a simple command)
  const subscriptionRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_subscribe',
    params: ['newHeads'] // Subscribe to new block headers
  });
  console.log('Sending subscription request...');
  ws.send(subscriptionRequest);
});

ws.on('message', function message(data) {
  // Convert Buffer to string
  const messageString = data.toString();
  console.log('📬 Received message:', messageString);
  // You should see a subscription ID first, then block headers
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket Error:', err.message);
});

ws.on('close', function close(code, reason) {
  // Convert Buffer reason to string if needed
  const reasonString = reason ? reason.toString() : 'No reason given';
  console.log(`🔌 WebSocket Closed. Code: ${code}, Reason: ${reasonString}`);
});