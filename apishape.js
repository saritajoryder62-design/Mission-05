// Describes the shape of an auction record returned by the API
export const auctionShape = {
  _id: 'string',
  title: 'string',
  description: 'string',
  start_price: 'number',
  reserve_price: 'number',
  createdAt: 'date',
  updatedAt: 'date',
};