require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');

const app = express();

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map(s => s.trim()),
    credentials: true,
  })
);

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth', authLimiter);

app.use('/auth', authRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  if (NODE_ENV !== 'production') {
    // minimal leak in dev only
    console.error(err);
  }
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Auth server listening on port ${PORT}`);
});
