import { openai } from "@/index";
import { hardCleanUpBotMessage } from "@/utils/bot";
import { log } from "@/utils/handlers";
import { CommandContext, Context } from "grammy";

export async function generateImage(ctx: CommandContext<Context>) {
  try {
    const { match } = ctx;

    if (!match)
      return ctx.reply(
        "Please provide a prompt like -\n/generate a white horse in a meadow"
      );
    await ctx.reply("Generating image...");

    const chatCompletion = await openai.images.generate({
      prompt: match,
    });

    for (const { url } of chatCompletion.data) {
      if (url) {
        log(`Generated for ${match}`);
        ctx.replyWithPhoto(url, {
          caption: `Generated image for \\- \`${hardCleanUpBotMessage(
            match
          )}\``,
          parse_mode: "MarkdownV2",
        });
      }
    }
  } catch (error) {
    ctx.reply("Open AI credit low, please add more");
  }
}
