import 'dotenv/config';
import { processNewListings } from './app';
import { sendTelegramMessage } from './utils';

async function main(argv: string[]) {
  const liquidity = argv[2];

  const msg = await processNewListings({
    minLiquidity: parseInt(liquidity) || 10_000_000,
  });

  await sendTelegramMessage(msg);
}

main(process.argv).catch((err) => {
  console.error(err, `Uncaught error: ${err.message}`);
  process.exitCode = 1;
});

process
  .on('unhandledRejection', (why) => {
    console.error(why ?? {}, `Unhandled rejection: ${(why as Error)?.message}`);
  })
  .on('SIGTERM', () => {
    console.error('SIGTERM signal received: closing HTTP server');
  })
  .on('uncaughtException', (err) => {
    console.error(err, `Uncaught Exception: ${err.message}`);
    process.exitCode = 1;
  });
