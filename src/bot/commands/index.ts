import { imagine, openai, teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { userState } from "@/vars/userState";
import { executeStep, splitIntoRandomChunks } from "@/utils/bot";
import { subscription } from "../subscription";
import { generate } from "./generate";
import { conversations, memeConversations } from "@/vars/conversations";
import { chatActionInterval } from "@/utils/constants";
import { setInfo } from "./setInfo";
import { Status, VariationStyle } from "imaginesdk";
import { InputFile } from "grammy";
import { variateChannelShillText } from "./shillText";
import { generateMemeCommand } from "./generateMeme";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    {
      command: "generate",
      description: "To start a new dialog to generate a shill text or a meme",
    },
    {
      command: "generatememe",
      description:
        "To generate a meme based on a prompt (only for channels and groups)",
    },
    { command: "subscribe", description: "To subscribe to the bot" },
    {
      command: "setinfo",
      description:
        "To set the info about your project for the bot. Using this info the bot can generate shill text in bulk.",
    },
  ]);

  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("generate", async (ctx) => generate(ctx));
  teleBot.command("generatememe", async (ctx) => generateMemeCommand(ctx));
  teleBot.command("subscribe", (ctx) => subscription(ctx));
  teleBot.command("setinfo", (ctx) => setInfo(ctx));

  teleBot.on(":text", async (ctx) => {
    const threadId = ctx.message?.message_thread_id;
    const chatId = ctx.chat.id;
    if (!chatId) return false;

    if (threadId) {
      // @ts-expect-error Weird type
      variateChannelShillText(ctx);
    }

    const [category, type] = userState[chatId]?.split("-") || [];

    const value =
      ctx.message?.text || ctx.channelPost?.text || ctx.update.message?.text;
    const userConversation = conversations[chatId];
    const generatedMeme = memeConversations[chatId];

    if (!value) return false;

    if (userConversation && userConversation.length) {
      userConversation.push({ role: "user", content: value });

      const typingInterval = setInterval(() => {
        ctx.api.sendChatAction(ctx.chat.id, "typing");
      }, chatActionInterval);
      const messageToEdit = (await ctx.reply("...")).message_id;

      const chatCompletion = await openai.chat.completions.create({
        messages: userConversation,
        model: "gpt-4-turbo-preview",
      });

      const botReply = chatCompletion.choices.at(0)?.message.content || "";
      const botReplyChunks = splitIntoRandomChunks(botReply);
      let replyText = "";

      for (const chunk of botReplyChunks) {
        replyText += ` ${chunk}`;
        try {
          await ctx.api.editMessageText(ctx.chat.id, messageToEdit, replyText);
          userConversation.push({ role: "assistant", content: botReply });
        } catch (error) {
          continue;
        }
      }

      clearInterval(typingInterval);
      log(`Chat ${chatId} did - ${value}`);
    } else if (generatedMeme) {
      const generatingMsg = (await ctx.reply("Generating variation..."))
        .message_id;

      const typingInterval = setInterval(() => {
        ctx.api.sendChatAction(ctx.chat.id, "typing");
      }, chatActionInterval);

      const response = await imagine.variations(value, generatedMeme, {
        style: VariationStyle.IMAGINE_V5,
      });

      if (response.status() === Status.OK) {
        const image = response.data();

        if (image) {
          image.asFile(generatedMeme);
          const imageFile = new InputFile(generatedMeme);
          await ctx.replyWithPhoto(imageFile);
        }
      } else {
        return ctx.reply("There was an error in generating your meme");
      }

      clearInterval(typingInterval);
      ctx.deleteMessages([generatingMsg]);
      log(`Generated variation for ${chatId} - ${value}`);
    } else {
      executeStep(category, type, value, chatId, ctx);
    }
  });

  log("Bot commands up");
}
