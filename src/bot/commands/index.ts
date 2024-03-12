import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { userState } from "@/vars/userState";
import { executeStep } from "@/utils/bot";
import { subscription } from "../subscription";
import { generate } from "./generate";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "generate", description: "To generate a shill text or a meme" },
    { command: "subscribe", description: "To subscribe to the bot" },
  ]);

  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("generate", async (ctx) => generate(ctx));
  teleBot.command("subscribe", (ctx) => subscription(ctx));

  teleBot.on(":text", (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return false;

    const [category, type] = userState[userId].split("-");
    const value = ctx.message?.text;

    if (value) {
      executeStep(category, type, value, userId, ctx);
    }
  });

  log("Bot commands up");
}
