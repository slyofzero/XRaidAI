import { CommandContext, Context } from "grammy";
import { generateMeme } from "./meme";
import { checkProjectMember } from "@/utils/bot";
import { errorHandler } from "@/utils/handlers";

export async function generateMemeCommand(ctx: CommandContext<Context>) {
  try {
    const isMember = await checkProjectMember(ctx);
    if (!isMember) return false;

    const { type } = ctx.chat;
    const { match } = ctx;

    if (!match) {
      await ctx.reply(
        "To use this command please pass a prompt too.\n\nExample -\n/generatememe a meme of a dog"
      );
    } else if (type === "channel" || type === "supergroup") {
      generateMeme(ctx, match);
      return;
    } else if (type === "group") {
      await ctx.reply(
        "To do /generate please make the bot an admin first and give it all permissions. This would allow the bot to read any new message in the group and reply to it if it needs to."
      );
    } else if (type === "private") {
      await ctx.reply("This is a channel or group only command.");
    }
  } catch (e) {
    errorHandler(e);
  }
}
