import { Telegraf } from 'telegraf';

interface TelegramReponse {
  data: Record<string, any>;
  [key: string]: any;
}

export async function sendTelegramMessage(msg: string) {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  try {
    bot.command('start', (ctx) => {
      bot.telegram.sendMessage(
        ctx.chat.id,
        `Hello there! welcome to my telegram bot. \nI respond to /newlistings. Please try it', `,
        {}
      );
    });

    bot.command('newlistings', (ctx) => {
      bot.telegram.sendMessage(ctx.chat.id, msg);
    });

    bot.launch();
  } catch (error) {
    console.log('Error sending Telegram message:', error);
  }
}
