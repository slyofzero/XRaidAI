import { CommandContext, Context, InputFile } from "grammy";

export async function startBot(ctx: CommandContext<Context>) {
  const text = `What Can This Bot Do?
The TulipAiBot

TulipAI Standard Picture Generator Bot, Generats High quality Custom Images according to the User's Needs.

https://t.me/TulipAiPortal`;

  const video = new InputFile("./tulip.mp4");

  ctx.replyWithVideo(video, { caption: text });
}
