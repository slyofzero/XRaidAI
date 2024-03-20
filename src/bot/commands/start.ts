import { checkProjectMember } from "@/utils/bot";
import { CommandContext, Context } from "grammy";

export async function startBot(ctx: CommandContext<Context>) {
  const isMember = await checkProjectMember(ctx);
  if (!isMember) return false;

  const text = `🎉 *Welcome to XRaid AI!* 🎉

I'm your go-to bot for generating the coolest shill texts and memes using AI. Ready to take your content game to the next level? You're in the right place!

/generate - To generate shill texts
/setinfo - To set information about your project which would help in generating shill texts in bulk (only for channel and groups)

Add the bot as an admin in your channel or group and you're good to go!`;

  ctx.reply(text, { parse_mode: "Markdown" });
}
