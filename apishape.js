// Describes the shapes of the JSON the API sends back.
// The API sends only the minimum fields (the TradeMe "less clutter" brief),
// so createdAt and updatedAt are stored in MongoDB but never sent.

// One auction item
// Each key is a field name, and each value is the type that field holds.
export const auctionShape = {
  _id: 'string', // unique id MongoDB gives every document, e.g. "6b03dd57819e8837a29c1929"
  title: 'string', // name of the item
  description: 'string', // details about the item
  start_price: 'number', // price the bidding opens at
  reserve_price: 'number', // lowest price the seller will accept
};

// GET /api/auctions
// Returns an array of auction items: [auctionShape, auctionShape, ...]

// GET /api/auctions/search?q=milk
export const searchResponseShape = {
  query: 'string', // the search word, e.g. "milk"
  count: 'number', // how many items matched
  results: 'array', // matching auction items: [auctionShape, ...]
};

// Any error (status 400, 404 or 500)
export const errorShape = {
  error: 'string', // e.g. "Search term must be at least 2 characters"
};
