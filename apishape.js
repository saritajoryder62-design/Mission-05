// Describes the shapes of the JSON the API sends back.
// The API sends only the minimum fields (the TradeMe "less clutter" brief),
// so createdAt and updatedAt are stored in MongoDB but never sent.

// One auction item
export const auctionShape = {
  _id: 'string',
  title: 'string',
  description: 'string',
  start_price: 'number',
  reserve_price: 'number',
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
