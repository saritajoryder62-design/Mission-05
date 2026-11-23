# Mission 5 Auction CLI and API

Mission 5, Phase 1 (tasks 4 to 6).

TradeMe users said product pages show too much information. This project tests a simpler approach: auction items are stored in a NoSQL database (MongoDB), and an API returns only the fields a buyer needs.

The project has two parts:

- **CLI tool** (`cli.js`): seeds, lists and deletes auction data from the terminal.
- **Search API** (`server.js`): returns all auction items, or finds items that match a keyword.

## Tech used

| Tool | What it does |
| --- | --- |
| MongoDB | The database, running locally |
| MongoDB Compass | A visual app to browse the data |
| Mongoose | Lets JavaScript talk to MongoDB using a schema |
| Commander | Turns `cli.js` into terminal commands |
| Chalk | Colours the terminal output |
| Express | Runs the API |

## Before you start

You need:

- Node.js
- MongoDB Community Server running on `127.0.0.1:27017`
- MongoDB Compass (optional, to look at the data)

On Windows, check that MongoDB is running:

```powershell
Get-Service -Name "*Mongo*"
```

The status should be `Running`.

## Setup

Clone the repository, install the packages, then seed the database:

```powershell
git clone https://github.com/saritajoryder62-design/Mission-05.git
cd Mission-05
npm install
npm run seed
```

`npm install` downloads the packages listed in `package.json` into a `node_modules` folder.

`npm run seed` clears the `auctions` collection and loads the 7 starter items from `seed-data.json` into the `mission_5` database. You should see:

```text
✔ Inserted 7 auction record(s) into mission_5.
```

To check the data, open MongoDB Compass, connect to `mongodb://127.0.0.1:27017`, and open `mission_5` > `auctions`. You can also run `node cli.js list` in the terminal.

Then start the API with `npm start` and open `http://localhost:3000/api/auctions/search?q=milk` in a browser.

## CLI commands

```powershell
node cli.js seed --reset     # clear the collection, then load seed-data.json
node cli.js seed             # add seed-data.json without clearing (creates duplicates)
node cli.js list             # show up to 20 auctions as coloured cards
node cli.js list -n 5        # show only 5 auctions
node cli.js clear --id <id>  # delete one auction by its _id
node cli.js clear            # delete every auction
node cli.js --help           # show all commands
```

Use `list` to find an item's `_id` before you delete it.

## Run the API

```powershell
npm start
```

The API runs at `http://localhost:3000`. Use `npm run dev` instead to restart the server when a file changes.

### Endpoints

| Method | URL | What it returns |
| --- | --- | --- |
| GET | `/` | A message to confirm the server is running |
| GET | `/api/auctions` | All auction items |
| GET | `/api/auctions/search?q=milk` | Items where the title or description contains the keyword |

Each item has only four fields: `title`, `description`, `start_price` and `reserve_price` (plus its `_id`).

The search ignores upper and lower case, so `milk`, `Milk` and `MILK` give the same results.

### Example

Request:

```text
GET http://localhost:3000/api/auctions/search?q=milk
```

Response:

```json
{
  "query": "milk",
  "count": 2,
  "results": [
    {
      "_id": "...",
      "title": "Stainless Steel Milk Bucket & Lid 20L",
      "description": "Clean food-grade stainless bucket with sealing lid for shed or calf-rearing duties",
      "start_price": 30,
      "reserve_price": 55
    },
    {
      "_id": "...",
      "title": "Vintage Milk Can",
      "description": "40L stainless steel milk can, good condition",
      "start_price": 50,
      "reserve_price": 120
    }
  ]
}
```

### Errors

| Request | Status | Response |
| --- | --- | --- |
| `/api/auctions/search` (no keyword) | 400 | `{ "error": "Add a search term, e.g. ?q=gate" }` |
| `/api/auctions/search?q=x` (1 letter) | 400 | `{ "error": "Search term must be at least 2 characters" }` |
| Any unknown URL | 404 | `{ "error": "Route not found: GET /..." }` |

## Project files

| File | What it does |
| --- | --- |
| `cli.js` | Defines the `seed`, `list` and `clear` commands |
| `server.js` | Starts the Express API and connects to the database |
| `routes/auctions.js` | The `/api/auctions` and `/api/auctions/search` routes |
| `models/Auction.js` | The schema: title, description, start_price, reserve_price |
| `db.js` | The connection to the local `mission_5` database |
| `seed-data.json` | The starter auction items |
| `apishape.js` | Describes the shape of an auction record the API returns |

## Tip

Connect with `127.0.0.1`, not `localhost`. Node can resolve `localhost` to an IPv6 address, and the connection to MongoDB then fails.

## Author

Sarita-Jo Ryder
