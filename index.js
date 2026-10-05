import { Bot } from "grammy"

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing.")
  process.exit(1)
}

const bot = new Bot(token)

bot.command("start", async (ctx) => {
  await ctx.reply(
    `سلام ${ctx.from?.first_name ?? "دوست من"}! 👋\n\nبه ربات MONTADORIA خوش آمدی.`
  )
})

bot.command("ping", async (ctx) => {
  await ctx.reply("🏓 pong")
})

bot.command("id", async (ctx) => {
  await ctx.reply(
    `Chat ID: ${ctx.chat.id}\nUser ID: ${ctx.from?.id ?? "unknown"}`
  )
})

bot.catch((err) => {
  console.error("Bot error:", err.error ?? err)
})

console.log("MONTADORIA bot is starting...")

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot started as @${botInfo.username}`)
  },
})
