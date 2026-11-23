import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    start_price: { type: Number, required: true },
    reserve_price: { type: Number, required: true },
  },
  { timestamps: true }
);

const Auction =
  mongoose.models.Auction || mongoose.model('Auction', auctionSchema, 'auctions');

export default Auction;