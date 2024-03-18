import { openai } from "@/index";
import { fetchAndExtract, getChannelDescription } from "@/utils/api";
import { urlRegex } from "@/utils/constants";
import { errorHandler, log } from "@/utils/handlers";
import { shillTextData } from "@/vars/shillText";
import { userState } from "@/vars/userState";
import { CommandContext, Context, InlineKeyboard } from "grammy";

export async function shillTextStep0(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  const keyboard = new InlineKeyboard()
    .text("Utility", "shillText-mode-utility")
    .text("Meme", "shillText-mode-meme");

  ctx.deleteMessage().catch((e) => errorHandler(e));

  const text = `The bot has two modes to generate shill text in, a utility mode and a meme mode. 
    
Utility mode focuses more on the token description you provide, while the meme mode focuses more on making the text catchy to the eye.`;

  ctx.reply(text, {
    reply_markup: keyboard,
  });
}

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
  ctx.deleteMessage().catch((e) => errorHandler(e));

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
  ctx.deleteMessage().catch((e) => errorHandler(e));

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
    "Describe your project in the next message. This description would be used to generate your shill text so make sure that the description is in a similar tone to how you'd want the shill text to be in. Include relevant information regarding your project for it to be more utilitarian."
  );
}

export async function shillTextStep4(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  userState[userId] = "shillText-socials";

  ctx.reply(
    '(Optional Step)\n\nDoes your project have any website or telegram channel? If so please pass the link to it in the next message. The bot would scan through the website or channel to pick out relevant information that can be used in the shill text.\n\nIf your project doesn\'t have any socials, just type "None" in the next message.'
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
  const { platform, name, description, mode, socials } = userShillTextData;

  let socialsData = "";
  let socialType: "telegram" | "website" = "website";

  if (urlRegex.test(socials || "")) {
    if (socials?.startsWith("https://t.me")) {
      const channelUsername = socials.replace("https://t.me/", "");
      socialsData = await getChannelDescription(channelUsername);
      socialType = "telegram";
    } else if (socials) {
      socialsData = await fetchAndExtract(socials);
    }
  }

  const instructions =
    mode === "utility"
      ? "Focus more on the description of the token and its tokenomics rather than making it a generic shill text."
      : "Use lots of emojis, hashtags, and modern slangs to fit a meme like tone.";

  let prompt = `Generate a shill text in first person for a project with name - "${name}". The text is for ${platform} so should fit the style and word limit. AVOID MARKDOWN. Use and modify the description below to generate it. ${instructions}. Description - ${description}.`;

  if (socialsData) {
    prompt += ` The project's ${socialType} has the following description in it - ${socialsData}. Use it too but only the relevant bits and also include the socials link ${socials} in the text. In the shill text don't mention that you got additional data from the ${socialType}.`;
  }

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
