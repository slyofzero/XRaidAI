import { conversations } from "@/vars/conversations";
import { CommandContext, Context, InlineKeyboard } from "grammy";
import { generateChannelShillText } from "./shillText";

export async function generate(ctx: CommandContext<Context>) {
  const { id: userId, type } = ctx.chat;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  } else if (type === "channel" || type === "supergroup") {
    return generateChannelShillText(ctx);
  } else if (type === "group") {
    return ctx.reply(
      "To do /generate please make the bot an admin first and give it all permissions. This would allow the bot to read any new message in the group and reply to it if it needs to."
    );
  }

  delete conversations[userId];
  const keyboard = new InlineKeyboard()
    .text("Shill text", "generate-shillText")
    .text("Meme (Image)", "generate-meme");

  const text = `Select what you want to generate using the bot.
  
A shill text can be really helpful when promoting your project across multiple platforms. The bot has two modes to generate shill text in, a utility mode which focuses more on the token description you provide, and a meme mode focuses more on making the text catchy to the eye. The bot can generate text for different platforms fitting the tone and character limits for each.
  
A meme can be helpful when trying to spread a certain sentiment about your project. The bot using generative AI to create an original meme based on the description you provide.`;

  ctx.reply(text, {
    reply_markup: keyboard,
  });
}
