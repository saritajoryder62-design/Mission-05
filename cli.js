import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import chalk from 'chalk';
import { Command } from 'commander';
import { connectDB } from './db.js';
import Auction from './models/Auction.js';

// __dirname doesn't exist in ES modules – recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();


// Colour helpers so styles stay consistent across commands
const log = {
  success: (msg) => console.log(chalk.green.bold('✔ ') + chalk.green(msg)),
  error: (msg) => console.error(chalk.red.bold('✖ ') + chalk.red(msg)),
  warn: (msg) => console.log(chalk.yellow.bold('⚠ ') + chalk.yellow(msg)),
  info: (msg) => console.log(chalk.cyan('ℹ ') + chalk.cyan(msg)),
};

function loadSeedData(filePath) {
  const resolvedPath = path.resolve(__dirname, filePath);
  const raw = fs.readFileSync(resolvedPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('seed-data.json must contain a JSON array of objects.');
  }

  return parsed;
}

async function runWithDB(taskFn) {
  try {
    await connectDB();
    log.info('Connected to mission_5 database');
    await taskFn();
  } catch (err) {
    log.error(`Command error: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log(chalk.gray('Connection closed.'));
  }
}

function printAuction(doc, index) {
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`${chalk.white.bold(`#${index + 1}`)} ${chalk.blue.bold(doc.title)}`);
  console.log(`   ${chalk.white(doc.description)}`);
  console.log(
    `   ${chalk.gray('Start:')} ${chalk.green('$' + doc.start_price)}   ` +
      `${chalk.gray('Reserve:')} ${chalk.magenta('$' + doc.reserve_price)}`
  );
  console.log(`   ${chalk.gray('_id: ' + doc._id)}`);
}

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
  .action(async (options) => {
    await runWithDB(async () => {
      const records = loadSeedData(options.file);

      if (options.reset) {
        const deleted = await Auction.deleteMany({});
        log.warn(`Cleared ${deleted.deletedCount} existing auction record(s).`);
      }

      if (records.length === 0) {
        log.warn('No records found in seed file.');
        return;
      }

      const inserted = await Auction.insertMany(records);
      log.success(`Inserted ${chalk.bold(inserted.length)} auction record(s) into mission_5.`);
    });
  });

// List stored auction documents
program
  .command('list')
  .description('List auction documents stored in mission_5')
  .option('-n, --limit <number>', 'Limit number of results', '20')
  .action(async (options) => {
    await runWithDB(async () => {
      const limit = Math.max(1, parseInt(options.limit, 10) || 20);
      const docs = await Auction.find().limit(limit).lean();

      if (docs.length === 0) {
        log.warn('No auctions found. Run "node cli.js seed" first.');
        return;
      }

      console.log(chalk.bgBlue.white.bold(` ${docs.length} auction(s) `));
      docs.forEach(printAuction);
      console.log(chalk.gray('─'.repeat(50)));
    });
  });

// Delete all auction documents or one matching --id
program
  .command('clear')
  .description('Delete auction documents from the collection')
  .option('--id <id>', 'Delete a single auction document by MongoDB _id')
  .action(async (options) => {
    await runWithDB(async () => {
      if (options.id) {
        const result = await Auction.findByIdAndDelete(options.id);
        if (result) {
          log.success(`Deleted auction document ${options.id}`);
        } else {
          log.warn(`No auction document found with _id ${options.id}`);
        }
        return;
      }

      const result = await Auction.deleteMany({});
      log.warn(`Deleted ${result.deletedCount} auction document(s).`);
    });
  });

program.parseAsync(process.argv);