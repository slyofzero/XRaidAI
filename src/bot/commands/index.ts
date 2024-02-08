import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { generateImage } from "./generateImage";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "generate", description: "To generate an image" },
  ]);

  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("generate", async (ctx) => generateImage(ctx));

  log("Bot commands up");
}
