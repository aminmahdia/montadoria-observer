export function registerCommands(bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(
      `سلام ${ctx.from?.first_name ?? "دوست من"}! 👋\n\nبه MONTADORIA خوش آمدی.`
    )
  })

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "🤖 MONTADORIA",
        "",
        "دستورات فعلی:",
        "/start — شروع ربات",
        "/help — راهنما",
        "/ping — بررسی وضعیت ربات",
        "/id — نمایش شناسه",
      ].join("\n")
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
}
