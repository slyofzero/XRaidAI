import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, IMAGE_API_KEY, OPEN_AI_KEY } from "./utils/env";
import { OpenAI } from "openai";
import { syncProjectInfo } from "./vars/info";
import { client } from "imaginesdk";
import { syncProjectIds } from "./vars/projectIds";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

if (!OPEN_AI_KEY || !IMAGE_API_KEY) {
  log("OPEN_AI_KEY or IMAGE_API_KEY is undefined");
  process.exit(1);
}

export const openai = new OpenAI({
  apiKey: OPEN_AI_KEY,
});

export const imagine: any = client(IMAGE_API_KEY);

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();
  await Promise.all([syncProjectInfo(), syncProjectIds()]);
})();
