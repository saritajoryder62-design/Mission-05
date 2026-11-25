import fs from 'fs'; // reads files from disk (seed-data.json)
import path from 'path'; // builds file paths that work on any computer
import { fileURLToPath } from 'url'; // turns this file's URL into a normal path
import mongoose from 'mongoose'; // talks to MongoDB
import chalk from 'chalk'; // adds colour to terminal text
import { Command } from 'commander'; // turns "node cli.js seed" into a command
import { connectDB } from './db.js'; // our function that opens the database connection
import Auction from './models/Auction.js'; // our Auction model (the schema rules)

// __dirname doesn't exist in ES modules – recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The main CLI program. Every command below is added to it.
const program = new Command();


// Colour helpers so styles stay consistent across commands
const log = {
  success: (msg) => console.log(chalk.green.bold('✔ ') + chalk.green(msg)),
  error: (msg) => console.error(chalk.red.bold('✖ ') + chalk.red(msg)),
  warn: (msg) => console.log(chalk.yellow.bold('⚠ ') + chalk.yellow(msg)),
  info: (msg) => console.log(chalk.cyan('ℹ ') + chalk.cyan(msg)),
};

// Reads the seed file and returns its items as an array
function loadSeedData(filePath) {
  // Find the file next to cli.js, wherever the command is run from
  const resolvedPath = path.resolve(__dirname, filePath);
  // Read the file as plain text
  const raw = fs.readFileSync(resolvedPath, 'utf8');
  // Turn the text into real JavaScript objects
  const parsed = JSON.parse(raw);

  // The file must be a list [ {...}, {...} ], not a single object
  if (!Array.isArray(parsed)) {
    throw new Error('seed-data.json must contain a JSON array of objects.');
  }

  return parsed;
}

// Opens the database, runs one command's task, then always closes the database.
// Every command uses this, so connect and close code is written only once.
async function runWithDB(taskFn) {
  try {
    await connectDB();
    log.info('Connected to mission_5 database');
    // Run the command's own work (seed, list or clear)
    await taskFn();
  } catch (err) {
    // Anything that goes wrong lands here, so the CLI shows a message instead of crashing
    log.error(`Command error: ${err.message}`);
    // Exit code 1 tells the terminal the command failed
    process.exitCode = 1;
  } finally {
    // finally runs whether the task worked or failed, so the connection never stays open
    await mongoose.connection.close();
    console.log(chalk.gray('Connection closed.'));
  }
}

// Prints one auction in the terminal, used by the list command
function printAuction(doc, index) {
  // A grey divider line between items
  console.log(chalk.gray('─'.repeat(50)));
  // index starts at 0, so add 1 to show #1, #2, #3 ...
  console.log(`${chalk.white.bold(`#${index + 1}`)} ${chalk.blue.bold(doc.title)}`);
  console.log(`   ${chalk.white(doc.description)}`);
  console.log(
    `   ${chalk.gray('Start:')} ${chalk.green('$' + doc.start_price)}   ` +
      `${chalk.gray('Reserve:')} ${chalk.magenta('$' + doc.reserve_price)}`
  );
  console.log(`   ${chalk.gray('_id: ' + doc._id)}`);
}

// Name, description and version shown by "node cli.js --help" and "--version"
program
  .name('mission5-cli')
  .description(chalk.cyan('CLI tool for managing auction data in the mission_5 MongoDB database'))
  .version('1.0.0');

// Seed documents from seed-data.json into auctions
program
  .command('seed')
  .description('Insert auction records from seed-data.json into mission_5')
  .option('-f, --file <path>', 'Path to seed JSON file', 'seed-data.json')
  .option('--reset', 'Clear existing auction records before seeding', false)
  // What runs when you type "node cli.js seed"
  .action(async (options) => {
    await runWithDB(async () => {
      // Read the items from the seed file
      const records = loadSeedData(options.file);

      // With --reset, delete every old auction first so there are no duplicates
      if (options.reset) {
        // {} means "match every document"
        const deleted = await Auction.deleteMany({});
        log.warn(`Cleared ${deleted.deletedCount} existing auction record(s).`);
      }

      // Stop if the file has no items
      if (records.length === 0) {
        log.warn('No records found in seed file.');
        return;
      }

      // Save all items at once. The schema checks every item first.
      const inserted = await Auction.insertMany(records);
      log.success(`Inserted ${chalk.bold(inserted.length)} auction record(s) into mission_5.`);
    });
  });

// List stored auction documents
program
  .command('list')
  .description('List auction documents stored in mission_5')
  .option('-n, --limit <number>', 'Limit number of results', '20')
  // What runs when you type "node cli.js list"
  .action(async (options) => {
    await runWithDB(async () => {
      // Turn the --limit text into a number. Bad input falls back to 20, and the lowest is 1.
      const limit = Math.max(1, parseInt(options.limit, 10) || 20);
      // Sort by _id (oldest first) so the # numbers stay the same each time
      // .lean() returns plain objects, which are faster when we only read them
      const docs = await Auction.find().sort({ _id: 1 }).limit(limit).lean();

      // Nothing in the database yet
      if (docs.length === 0) {
        log.warn('No auctions found. Run "node cli.js seed" first.');
        return;
      }

      // Header showing how many items were found
      console.log(chalk.bgBlue.white.bold(` ${docs.length} auction(s) `));
      // Print each item. forEach passes (doc, index) to printAuction.
      docs.forEach(printAuction);
      console.log(chalk.gray('─'.repeat(50)));
    });
  });

// Delete all auction documents, one by _id, or one by its list number
// Works as: clear <id>, clear --id <id>, delete <id>, clear --number 3, clear
program
  .command('clear [id]')
  .alias('delete')
  .description('Delete auction documents from the collection')
  .option('--id <id>', 'Delete a single auction document by MongoDB _id')
  .option('-n, --number <number>', 'Delete a single auction by its # in the list command')
  .action(async (idArgument, options) => {
    // The id can be typed on its own or after --id
    const id = idArgument || options.id;

    await runWithDB(async () => {
      // Option 1: delete by list number, e.g. "clear --number 3"
      if (options.number) {
        // Turn the typed text into a number
        const number = parseInt(options.number, 10);

        // Same order as the list command, so #3 here is #3 there
        const docs = await Auction.find().sort({ _id: 1 });

        // Reject anything that is not a number, or is outside the list
        if (isNaN(number) || number < 1 || number > docs.length) {
          log.error(`Pick a number from 1 to ${docs.length}. Run "node cli.js list" to see them.`);
          process.exitCode = 1;
          return;
        }

        // The list starts at #1, but arrays start at 0
        const doc = docs[number - 1];
        await Auction.findByIdAndDelete(doc._id);
        log.success(`Deleted #${number} ${doc.title}`);
        return;
      }

      // Option 2: delete by _id, e.g. "clear 6b03dd57819e8837a29c1929"
      if (id) {
        // A MongoDB _id is always 24 characters (0-9 and a-f)
        if (id.length !== 24 || !mongoose.isValidObjectId(id)) {
          log.error(`"${id}" is not a valid _id. It must be 24 characters, e.g. 6b03dd57819e8837a29c1929`);
          process.exitCode = 1;
          return;
        }

        // Returns the deleted item, or null if no item had that _id
        const result = await Auction.findByIdAndDelete(id);
        if (result) {
          log.success(`Deleted ${result.title} (${id})`);
        } else {
          log.warn(`No auction document found with _id ${id}`);
        }
        return;
      }

      // Option 3: no number and no _id, so delete every auction
      const result = await Auction.deleteMany({});
      log.warn(`Deleted ${result.deletedCount} auction document(s).`);
    });
  });

// Read what was typed in the terminal (process.argv) and run the matching command
program.parseAsync(process.argv);