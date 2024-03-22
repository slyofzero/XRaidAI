import { openai } from "@/index";
import { fetchAndExtract, getChannelDescription } from "@/utils/api";
import { hardCleanUpBotMessage, splitIntoRandomChunks } from "@/utils/bot";
import { chatActionInterval, urlRegex } from "@/utils/constants";
import { BOT_USERNAME } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { getNowTimestamp } from "@/utils/time";
import { botGroupReplies } from "@/vars/botGroupReplies";
import { conversations } from "@/vars/conversations";
import { storedProjectInfos } from "@/vars/info";
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
  ctx.reply("Any custom expression you want the shill text to have?");
}

export async function shillTextStep4(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  userState[userId] = "shillText-socials";

  ctx.reply(
    'Does your project have any website or telegram channel? If so please pass the link to it in the next message. The bot would scan through the website or channel to pick out relevant information that can be used in the shill text.\n\nIf your project doesn\'t have any socials, just type "None" in the next message.'
  );
}

export async function shillTextStep5(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  userState[userId] = "shillText-focus";

  ctx.reply(
    "Is there anything specific about the project that you'd like the shill text to focus on?"
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
  const { name, description, mode, socials, focus } = userShillTextData;

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

  let prompt = `Generate 5 shill texts in first person from the perspective of the shiller/user and not the project, with at most 255 characters for a project with name - "${name}". ${instructions}. Expression - ${description}. Focus of the text should be - ${focus}`;

  const conversationUserPrompt = prompt;

  if (socialsData) {
    prompt += ` The project's ${socialType} has the following description, use and modify the description below to generate it. ${socialsData}. Use it too but only the relevant bits and also include the socials link ${socials} in the text but just type the links in the text itself, don't use markdown for them. In the shill text don't mention that you got additional data from the ${socialType}. Also include relevant hashtags.`;
  }

  const generationMsg = await ctx.reply("Generating shill text\\.\\.\\.", {
    parse_mode: "MarkdownV2",
  });
  const typingInterval = setInterval(() => {
    ctx.api.sendChatAction(ctx.chat.id, "typing");
  }, chatActionInterval);

  conversations[userId] = [{ role: "user", content: conversationUserPrompt }];
  const userConversation = conversations[userId];

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4-0125-preview",
  });

  for (const choice of chatCompletion.choices) {
    const shillText = `${hardCleanUpBotMessage(
      choice.message.content
    )}\n\n[Add XRAID to groups](https://t.me/${BOT_USERNAME}) \\| @XraidAiProject`;

    const botReplyChunks = splitIntoRandomChunks(shillText);
    let replyText = "";

    for (const chunk of botReplyChunks) {
      replyText += ` ${chunk}`;
      try {
        await ctx.api.editMessageText(
          ctx.chat.id,
          generationMsg.message_id,
          replyText,
          { parse_mode: "MarkdownV2" }
        );
        userConversation.push({ role: "assistant", content: replyText });
      } catch (error) {
        continue;
      }
    }
  }

  clearInterval(typingInterval);
  log(`Generated shill text on ${name} for ${userId}`);
}

export async function generateChannelShillText(
  ctx: CommandContext<Context>,
  prevText?: string
) {
  const userId = ctx.chat.id;
  const projectInfo = storedProjectInfos
    .filter(({ chatId }) => chatId === userId)
    .at(0);

  if (!projectInfo) {
    ctx.reply(
      "Please do /setinfo and set some information about your project. This information would be used each time you do /generate so is a one time task."
    );
    return;
  }

  delete userState[userId];
  const { name, description, tone, socials } = projectInfo;

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

  let prompt = "";

  if (!prevText) {
    prompt = `Generate 8 shill texts in first person from the perspective of the shiller/user and not the project with at most 255 characters for a project with name - "${name}", in the tone - ${tone}. Description - ${description}. Focus more on the relevant information and include relevant hashtags.`;
  } else {
    const userRequest = ctx.message?.text;
    prompt = `Previously you generated the below text - ${prevText}. Using this previous text for the following request - ${userRequest}.At most 255 characters per shill text. The shill texts should only be in first person from the perspective of the shiller/user and not the project.`;
  }

  if (socialsData) {
    prompt += ` The project's ${socialType} has the following description, use and modify the description below to generate it. ${socialsData}. Use it too but only the relevant bits and also include the socials link ${socials} in the text but just type the links in the text itself, don't use markdown for them. In the shill text don't mention that you got additional data from the ${socialType}.`;
  }

  const generationMsg = await ctx.reply(
    "Generating shill text, please wait a few moments..."
  );
  const typingInterval = setInterval(() => {
    ctx.api.sendChatAction(ctx.chat.id, "typing");
  }, chatActionInterval);

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4-turbo-preview",
  });

  for (const choice of chatCompletion.choices) {
    const shillText = `${choice.message.content}\n\nGenerated by @${BOT_USERNAME}`;
    await ctx.api.editMessageText(
      ctx.chat.id,
      generationMsg.message_id,
      shillText
    );

    if (!botGroupReplies[userId]) {
      botGroupReplies[userId] = {};
    }

    botGroupReplies[userId][generationMsg.message_id] = {
      startTime: getNowTimestamp(),
      text: shillText,
    };
  }

  clearInterval(typingInterval);
  log(`Generated shill text on ${name} for ${userId}`);
}

export async function variateChannelShillText(ctx: CommandContext<Context>) {
  const threadId =
    ctx.message?.message_thread_id ||
    ctx.channelPost?.reply_to_message?.message_id;
  const chatId = ctx.chat.id;
  if (!chatId || !threadId) return false;

  const prevText = botGroupReplies[chatId]?.[threadId];
  if (prevText) {
    generateChannelShillText(ctx, prevText.text);
  }
}
