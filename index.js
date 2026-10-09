import { Bot } from "grammy";
import db from "./database.js";
import { registerCommands } from "./src/commands.js";
import { registerObserver } from "./src/observer.js";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("خطا: متغیر TELEGRAM_BOT_TOKEN تنظیم نشده است.");
  process.exit(1);
}

const bot = new Bot(token);

bot.catch((error) => {
  console.error("خطای ربات:", error.error ?? error);
});

registerCommands(bot, db);
registerObserver(bot, db);

console.log("MONTADORIA Observer Bot در حال راه‌اندازی است...");

bot.start({
  onStart: (botInfo) => {
    console.log(`ربات فعال شد: @${botInfo.username}`);
  },
}).catch((error) => {
  console.error("خطا در اجرای ربات:", error);
  process.exit(1);
});

process.once("SIGINT", () => {
  bot.stop();
  db.close();
});

process.once("SIGTERM", () => {
  bot.stop();
  db.close();
});
