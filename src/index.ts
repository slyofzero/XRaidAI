import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, OPEN_AI_KEY } from "./utils/env";
import { OpenAI } from "openai";
import { syncProjectInfo } from "./vars/info";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

if (!OPEN_AI_KEY) {
  log("OPEN_AI_KEY is undefined");
  process.exit(1);
}

export const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
});

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([syncProjectInfo()]);
})();
