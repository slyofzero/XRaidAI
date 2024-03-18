import { CommandContext, Context } from "grammy";

export async function startBot(ctx: CommandContext<Context>) {
  const text = `🎉 *Welcome to XRaid AI!* 🎉

I'm your go-to bot for generating the coolest shill texts and memes using AI. Ready to take your content game to the next level? You're in the right place!

Just type /generate to get started, steps after that are rather self explanatory. Let's make some noise and spread the hype with XRaid AI!`;
  ctx.reply(text, { parse_mode: "Markdown" });
}
