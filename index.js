import { Bot } from "grammy"
import { registerCommands } from "./src/commands.js"

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing.")
  process.exit(1)
}

const bot = new Bot(token)

registerCommands(bot)

bot.catch((err) => {
  console.error("Bot error:", err.error ?? err)
})

console.log("MONTADORIA bot is starting...")

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot started as @${botInfo.username}`)
  },
})
