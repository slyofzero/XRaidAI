import { openai } from "@/index";
import { log } from "@/utils/handlers";
import { memeData } from "@/vars/memeData";
import { userState } from "@/vars/userState";
import { CommandContext, Context } from "grammy";

export async function memeStep0(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;

  if (!userId) {
    ctx.reply("Please do /generate again");
    return;
  }

  ctx.deleteMessage();

  const text = `Please provide a description of what the meme should be based on with the items it should have in what order. The more descriptive your meme is the better results at getting what you wanted.`;
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

export async function generateMeme(ctx: CommandContext<Context>) {
  const userId = ctx.from?.id;
  const userMemeData = memeData[userId || ""];

  if (!userId || !userMemeData) {
    ctx.reply("Please do /generate again");
    return;
  }

  delete userState[userId];
  const { description, style, text } = userMemeData;

  const prompt = `${description} in ${style} style with some bold text at the top or bottom of it saying ${text}`;

  const generatingMsg = await ctx.reply("Generating a meme...");
  const image = await openai.images.generate({ model: "dall-e-3", prompt });
  const imageUrl = image.data.at(0)?.url;

  if (imageUrl) {
    ctx.replyWithPhoto(imageUrl);
  } else {
    ctx.reply("Your meme couldn't be generated, please do /generate again");
    log(`Error in generating an image - ${JSON.stringify(image)}`);
  }

  ctx.deleteMessages([generatingMsg.message_id]);
}
