import { openai } from "@/index";
import { log } from "@/utils/handlers";
import { shillTextData } from "@/vars/shillText";
import { userState } from "@/vars/userState";
import { CommandContext, Context, InlineKeyboard } from "grammy";

export async function shillTextStep1(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  const keyboard = new InlineKeyboard()
    .text("Reddit", "shillText-platform-reddit")
    .row()
    .text("X (Twitter)", "shillText-platform-twitter")
    .row()
    .text("Telegram", "shillText-platform-telegram");

  userState[userId] = "shill-step-2";

  ctx.reply("Select the platform you want to generate the text for", {
    reply_markup: keyboard,
  });
}

export async function shillTextStep2(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please click on a platform again");
    return;
  }

  userState[userId] = "shillText-name";
  ctx.deleteMessage();

  ctx.reply("What is the name of your project?");
}

export async function shillTextStep3(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  userState[userId] = "shillText-description";

  ctx.reply(
    "Describe your project in the next message. This description would be used to generate your shill text."
  );
}

export async function generateShillText(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;
  const userShillTextData = shillTextData[userId || ""];

  if (!userId || !userShillTextData) {
    ctx.reply("Please do /generate again");
    return;
  }

  delete userState[userId];
  const { platform, name, description } = userShillTextData;

  const prompt = `Generate a shill text for a project with name - "${name}". The text is for ${platform} so should fit the style and word limit. Use and modify the description below to generate it. Description - ${description}`;

  const generationMsg = await ctx.reply("Generating shill text...");

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  for (const choice of chatCompletion.choices) {
    const shillText = choice.message.content;
    if (shillText) ctx.reply(shillText);
    else {
      ctx.reply("Error in generating shill text");
      log(`Error in generating shill text - ${JSON.stringify(chatCompletion)}`);
    }

    ctx.deleteMessages([generationMsg.message_id]);
  }
}
