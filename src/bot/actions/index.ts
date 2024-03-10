import { teleBot } from "@/index";
import { log } from "@/utils/handlers";
import { executeStep } from "@/utils/bot";

export function initiateCallbackQueries() {
  log("Bot callback queries up");

  teleBot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const [category, type, value] = data.split("-");
    const userId = ctx.from.id;

    executeStep(category, type, value, userId, ctx);
  });
}
