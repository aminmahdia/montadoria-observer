import db from "./database.js"

export function registerCommands(bot) {
  bot.command("start", async (ctx) => {
    const telegramId = ctx.from.id
    const username = ctx.from.username ?? null
    const displayName =
      [ctx.from.first_name, ctx.from.last_name]
        .filter(Boolean)
        .join(" ") || "Unknown"

    const now = new Date().toISOString()

    const existingUser = db
      .prepare("SELECT id FROM users WHERE telegram_id = ?")
      .get(telegramId)

    if (!existingUser) {
      db.prepare(`
        INSERT INTO users (
          telegram_id,
          username,
          display_name,
          money,
          bank,
          xp,
          level,
          role,
          job,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, 0, 0, 0, 1, 'user', NULL, ?, ?)
      `).run(
        telegramId,
        username,
        displayName,
        now,
        now
      )

      await ctx.reply(
        `سلام ${displayName}! 👋\n\n` +
        `به MONTADORIA خوش آمدی.\n\n` +
        `حساب تو با موفقیت ساخته شد.`
      )
    } else {
      db.prepare(`
        UPDATE users
        SET username = ?, display_name = ?, updated_at = ?
        WHERE telegram_id = ?
      `).run(
        username,
        displayName,
        now,
        telegramId
      )

      await ctx.reply(
        `سلام ${displayName}! 👋\n\n` +
        `به MONTADORIA خوش آمدی.`
      )
    }
  })

  bot.command("profile", async (ctx) => {
    const user = db
      .prepare(`
        SELECT
          telegram_id,
          username,
          display_name,
          money,
          bank,
          xp,
          level,
          role,
          job
        FROM users
        WHERE telegram_id = ?
      `)
      .get(ctx.from.id)

    if (!user) {
      await ctx.reply("ابتدا /start را بزنید.")
      return
    }

    await ctx.reply(
      [
        "👤 PROFILE",
        "",
        `Name: ${user.display_name}`,
        `Username: ${user.username ? "@" + user.username : "ندارد"}`,
        `🆔 ID: ${user.telegram_id}`,
        "",
        `💰 Money: $${user.money}`,
        `🏦 Bank: $${user.bank}`,
        `⭐ Level: ${user.level}`,
        `✨ XP: ${user.xp}`,
        `💼 Job: ${user.job ?? "Unemployed"}`,
        `🎭 Role: ${user.role}`,
      ].join("\n")
    )
  })

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "🤖 MONTADORIA",
        "",
        "دستورات فعلی:",
        "/start — شروع ربات",
        "/profile — پروفایل",
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
