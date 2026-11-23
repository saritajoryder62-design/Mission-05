import express from 'express';
import { connectDB } from './db.js';
import auctionRoutes from './routes/auctions.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check: visit http://localhost:3000 to confirm the server is up
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mission 5 Auction API running' });
});

// All auction routes live under /api/auctions
app.use('/api/auctions', auctionRoutes);

// Any route not matched above → JSON 404 instead of an HTML page
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Connect to MongoDB first, then start listening
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API running at http://localhost:${PORT}  ✌️👌☑️`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();