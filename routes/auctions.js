import express from 'express';
import Auction from '../models/Auction.js';

const router = express.Router();

// Only send the minimum fields (the TradeMe "less clutter" brief)
const FIELDS = 'title description start_price reserve_price';
const MIN_LENGTH = 2;

// GET /api/auctions  → all items
router.get('/', async (req, res) => {
  try {
    const items = await Auction.find({}, FIELDS);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auctions/search?q=gate  → keyword search
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();

  if (!q) {
    return res.status(400).json({ error: 'Add a search term, e.g. ?q=gate' });
  }
  if (q.length < MIN_LENGTH) {
    return res
      .status(400)
      .json({ error: `Search term must be at least ${MIN_LENGTH} characters` });
  }

  try {
    // Escape special regex characters so searches like "c++" don't break
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safe, 'i'); // i = case-insensitive

    const items = await Auction.find(
      { $or: [{ title: regex }, { description: regex }] },
      FIELDS
    );

    res.json({ query: q, count: items.length, results: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;