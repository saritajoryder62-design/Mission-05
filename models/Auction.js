import mongoose from 'mongoose';
//This loads Mongoose the library that connects Node to MongoDB//

// The schema is the set of rules every auction document must follow.
const auctionSchema = new mongoose.Schema(
  {
    // Name of the item, e.g. "Vintage bike". Must be text and cannot be left out.
    title: { type: String, required: true },
    
    description: { type: String, required: true },
   
    start_price: { type: Number, required: true },
   
    reserve_price: { type: Number, required: true },
  },
 
  { timestamps: true }
);

// Build the Auction model from the schema and link it to the "auctions" collection.
// If the model already exists (e.g. the file was loaded twice), reuse it instead of
// creating it again, because Mongoose throws an error on a duplicate model.
const Auction =
  mongoose.models.Auction || mongoose.model('Auction', auctionSchema, 'auctions');


export default Auction;
// "The schema defines the shape of an auction document: which fields it has, what type each holds, and which are required.