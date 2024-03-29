import { conversations, memeConversations } from "@/vars/conversations";
import { CommandContext, Context, InlineKeyboard } from "grammy";
import { generateChannelShillText } from "./shillText";
import fs from "fs/promises";
import { errorHandler } from "@/utils/handlers";
import { checkProjectMember } from "@/utils/bot";
import { addDocument } from "@/firebase";
import { storedProjectIds } from "@/vars/projectIds";

export async function generate(ctx: CommandContext<Context>) {
  try {
    const isMember = await checkProjectMember(ctx);

    if (!isMember) return false;

    const { id: userId, type } = ctx.chat;
    const { match } = ctx;

    if (!userId) {
      await ctx.reply("Please do /generate again");
      return;
    } else if (type === "channel" || type === "supergroup") {
      if (!match) {
        await ctx.reply(
          "To use this command please pass a prompt that tells the bot what to focus on.\n\nExample -\n/generate text should have an enthusiastic tone and go over the tokenomics"
        );
      } else {
        if (!storedProjectIds.includes(userId)) {
          addDocument({
            data: { chatId: userId },
            collectionName: "project_ids",
          });
        }

        await generateChannelShillText(ctx);
      }

      return;
    } else if (type === "group") {
      return await ctx.reply(
        "To do /generate please make the bot an admin first and give it all permissions. This would allow the bot to read any new message in the group and reply to it if it needs to."
      );
    }

    delete conversations[userId];
    const generatedMeme = memeConversations[userId];
    fs.unlink(generatedMeme)
      .then(() => `Removed image ${generatedMeme}`)
      .catch((e) => errorHandler(e));

    const keyboard = new InlineKeyboard()
      .text("Shill text", "generate-shillText")
      .text("Meme (Image)", "generate-meme");

    const text = `Select what you want to generate using the bot.
  
A shill text can be really helpful when promoting your project across multiple platforms. The bot has two modes to generate shill text in, a utility mode which focuses more on the token description you provide, and a meme mode focuses more on making the text catchy to the eye. The bot can generate text for different platforms fitting the tone and character limits for each.
  
A meme can be helpful when trying to spread a certain sentiment about your project. The bot using generative AI to create an original meme based on the description you provide.`;

    await ctx.reply(text, {
      reply_markup: keyboard,
    });
  } catch (error) {
    errorHandler(error);
  }
}
