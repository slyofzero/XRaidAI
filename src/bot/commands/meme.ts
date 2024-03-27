import { imagine } from "@/index";
import { errorHandler, log } from "@/utils/handlers";
import { memeData } from "@/vars/memeData";
import { userState } from "@/vars/userState";
import { CommandContext, Context, InputFile } from "grammy";
import { VariationStyle, Status } from "imaginesdk";
import { nanoid } from "nanoid";
import { chatActionInterval } from "@/utils/constants";
import { memeConversations } from "@/vars/conversations";

export async function memeStep0(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  ctx.deleteMessage().catch((e) => errorHandler(e));

  const text = `Please provide a description of what the meme should be based on, with the items it should have in what order. The more descriptive your meme is the better results at getting what you wanted.`;
  userState[userId] = "meme-description";

  ctx.reply(text);
}

export async function memeStep1(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  userState[userId] = "meme-style";

  ctx.reply(
    "What is style do you want your meme to be in? Examples can be realistic, modern, graphics, cartoon, and so on."
  );
}

export async function memeStep2(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  const text =
    "Pass the text you want on the meme in the next message. This text should be short and concise so as to fit nicely with the meme image";
  userState[userId] = "meme-text";

  ctx.reply(text);
}

export async function generateMeme(
  ctx: CommandContext<Context>,
  manualPrompt?: string
) {
  try {
    const userId = ctx.from?.id;
    const userMemeData = memeData[userId || ""];

    let prompt = "";

    if (manualPrompt) {
      prompt = manualPrompt;
    } else if (userId && userMemeData) {
      delete userState[userId];
      const { description, style } = userMemeData;
      prompt = `${description} ${style}`;
    } else {
      await ctx.reply("Please do /generate again");
      return;
    }

    const generatingMsg = await ctx.reply("Generating a meme...");
    const typingInterval = setInterval(() => {
      ctx.api.sendChatAction(ctx.chat.id, "typing");
    }, chatActionInterval);

    const response = await imagine.generations(prompt, {
      style: VariationStyle.IMAGINE_V5,
    });

    if (response.status() === Status.OK) {
      const image = response.data();

      if (image) {
        const imageFilePath = `./temp/${nanoid(10)}.png`;
        image.asFile(imageFilePath);
        const imageFile = new InputFile(imageFilePath);
        await ctx.replyWithPhoto(imageFile);

        if (userId) memeConversations[userId] = imageFilePath;
      }
    } else {
      return ctx.reply("There was an error in generating your meme");
    }

    ctx.deleteMessages([generatingMsg.message_id]);
    clearInterval(typingInterval);
    log(`Generated image for ${userId}`);

    if (!manualPrompt) {
      await ctx.reply(
        "If you want a variation of this image, you can type in another prompt. Although keep in mind that your variation description should be rather descriptive. Do not omit any details you want in the image."
      );
    }
  } catch (error) {
    errorHandler(error);
    ctx.reply("Please do /generate again");
  }
}
