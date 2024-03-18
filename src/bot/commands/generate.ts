import { CommandContext, Context, InlineKeyboard } from "grammy";

export async function generate(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

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
