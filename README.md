# Mission 5 Auction CLI and API

Mission 5, Phase 1 (tasks 4 to 6).

TradeMe users said product pages show too much information. This project tests a simpler approach: auction items are stored in a NoSQL database (MongoDB), and an API returns only the fields a buyer needs.

The project has two parts:

- **CLI tool** (`cli.js`): seeds, lists and deletes auction data from the terminal.
- **Search API** (`server.js`): returns all auction items, or finds items that match a keyword.

## Quick start

You need [Node.js](https://nodejs.org) and [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed. MongoDB Compass is optional.

Run these commands in PowerShell:

```powershell
git clone https://github.com/saritajoryder62-design/Mission-05.git
cd Mission-05
npm install
npm run seed
node cli.js list
npm start
```

What each step does:

1. `git clone` downloads the project. `cd Mission-05` moves into the folder.
2. `npm install` downloads the packages into a `node_modules` folder.
3. `npm run seed` clears the `auctions` collection, then loads the 7 starter items from `seed-data.json` into the `mission_5` database.
4. `node cli.js list` shows the items, so you can see that the seed worked.
5. `npm start` runs the API at `http://localhost:3000`.

You do not need a `.env` file. The project connects to MongoDB on your own computer (`mongodb://127.0.0.1:27017/mission_5`).

### Check that it works

After `npm run seed`, you should see:

```text
ℹ Connected to mission_5 database
⚠ Cleared 7 existing auction record(s).
✔ Inserted 7 auction record(s) into mission_5.
Connection closed.
```

On a first run the database is empty, so the `Cleared` line shows 0.

After `npm start`, open this link in a browser:

```text
http://localhost:3000/api/auctions/search?q=milk
```

You should get 2 results. To stop the API, press `Ctrl + C` in the terminal.

To look at the data in MongoDB Compass, connect to `mongodb://127.0.0.1:27017`, then open `mission_5` > `auctions`.

## CLI commands

| Command | What it does |
| --- | --- |
| `node cli.js list` | Show up to 20 auctions as coloured cards |
| `node cli.js list -n 5` | Show only 5 auctions |
| `node cli.js seed --reset` | Delete all auctions, then load `seed-data.json` (same as `npm run seed`) |
| `node cli.js seed` | Add `seed-data.json` without deleting first. This makes duplicates |
| `node cli.js clear --number 3` | Delete auction #3 from the list |
| `node cli.js clear <id>` | Delete one auction by its `_id` |
| `node cli.js delete <id>` | Same as `clear <id>` |
| `node cli.js clear --id <id>` | Same as `clear <id>` |
| `node cli.js clear` | Delete **every** auction. It does not ask first |
| `node cli.js --help` | Show all commands |

### Delete an item

1. Run `node cli.js list` to see each item's number and `_id`.
2. Run `node cli.js clear --number 3` to delete item #3.
3. Run `node cli.js list` again. The numbers move up after each delete.

### Start again with fresh data

If you deleted too much, or the list has duplicates, run:

```powershell
npm run seed
```

This puts back the 7 starter items.

## API

Start the API with `npm start`. Use `npm run dev` instead to restart the server each time you save a file.

| Method | URL | What it returns |
| --- | --- | --- |
| GET | `http://localhost:3000/` | A message that shows the server is running |
| GET | `http://localhost:3000/api/auctions` | All auction items |
| GET | `http://localhost:3000/api/auctions/search?q=milk` | Items with the keyword in the title or description |

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

## Problems and fixes

### `ECONNREFUSED 127.0.0.1:27017`, or a command hangs for 30 seconds

MongoDB is not running. Check it in PowerShell:

```powershell
Get-Service -Name "*Mongo*"
```

If the status is `Stopped`, start it from an administrator PowerShell window:

```powershell
Start-Service -Name MongoDB
```

### `node cli.js list` shows no items

The database is empty. Run `npm run seed`.

### The list shows each item twice

You ran `node cli.js seed` without `--reset`. Run `npm run seed` to clear the data and load it once.

### `Cannot find package 'mongoose'` (or `commander`, `chalk`, `express`)

The packages are not installed. Run `npm install` in the project folder.

### `EADDRINUSE: address already in use :::3000`

Something else uses port 3000. This is often the API already running in another terminal. Stop the other one with `Ctrl + C`, or use a different port:

```powershell
$env:PORT = 4000; npm start
```

### The connection fails when you use `localhost`

Connect with `127.0.0.1`, not `localhost`. Node can turn `localhost` into an IPv6 address, and then the connection to MongoDB fails.

## Use a different database (optional)

The project uses your local MongoDB by default. To use another one, such as MongoDB Atlas, set `MONGO_URI` before you run a command:

```powershell
$env:MONGO_URI = "mongodb+srv://<user>:<password>@<cluster>/mission_5"
npm run seed
```

The setting lasts only until you close that PowerShell window. Never commit a connection string that contains a password.

## Project files

| File | What it does |
| --- | --- |
| `cli.js` | Defines the `seed`, `list` and `clear` commands |
| `server.js` | Starts the Express API and connects to the database |
| `routes/auctions.js` | The `/api/auctions` and `/api/auctions/search` routes |
| `models/Auction.js` | The schema: title, description, start_price, reserve_price |
| `db.js` | Connects to MongoDB: uses `MONGO_URI` if set, otherwise the local `mission_5` database |
| `seed-data.json` | The 7 starter auction items |
| `apishape.js` | Describes the shape of an auction record the API returns |

## Tech used

| Tool | What it does |
| --- | --- |
| MongoDB | The database, running locally |
| MongoDB Compass | A visual app to browse the data |
| Mongoose | Lets JavaScript talk to MongoDB using a schema |
| Commander | Turns `cli.js` into terminal commands |
| Chalk | Colours the terminal output |
| Express | Runs the API |

## Author

Sarita-Jo Ryder
