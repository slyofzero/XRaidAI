import { steps } from "@/bot/steps";
import { memeData } from "@/vars/memeData";
import { shillTextData } from "@/vars/shillText";
import { CommandContext, Context } from "grammy";
import { XRAID_PROJECT_ID } from "./env";
import { log } from "./handlers";
import { teleBot } from "..";

// eslint-disable-next-line
export function cleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#");

  return text;
}

// eslint-disable-next-line
export function hardCleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/_/g, "\\_")
    .replace(/\|/g, "\\|")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/`/g, "\\`")
    .replace(/\+/g, "\\+")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#")
    .replace(/\*/g, "\\*");

  return text;
}

export function executeStep(
  category: string,
  type: string,
  value: string,
  userId: string | number,
  // eslint-disable-next-line
  ctx: any
) {
  if (category && type) {
    if (category === "shillText") {
      const userShillTextData = shillTextData[userId];

      if (!userShillTextData) {
        shillTextData[userId] = { [type]: value };
      } else {
        // @ts-expect-error too lazy to fix this
        shillTextData[userId][type] = value;
      }
    } else if (category === "meme") {
      const userMemeData = memeData[userId];

      if (!userMemeData) {
        memeData[userId] = { [type]: value };
      } else {
        // @ts-expect-error too lazy to fix this
        memeData[userId][type] = value;
      }
    }

    const stepFunction = steps[category][type];

    if (stepFunction) {
      stepFunction(ctx);
    } else {
      ctx.reply("No step function defined");
    }
  }
}

export function splitIntoRandomChunks(text: string) {
  const words = text.split(" ");
  const chunks = [];
  let currentIndex = 0;

  while (currentIndex < words.length) {
    // Randomly choose a chunk size between 3 and 9
    const chunkSize = Math.floor(Math.random() * 10) + 5;
    const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(" ");
    chunks.push(chunk);
    currentIndex += chunkSize;
  }

  return chunks;
}

export async function checkProjectMember(ctx: CommandContext<Context>) {
  try {
    if (!XRAID_PROJECT_ID) {
      return log("XRAID_PROJECT_ID is undefined");
    }

    const { type } = ctx.chat;
    const userId = ctx.chat.id;

    if (type === "private") {
      const { status } = await teleBot.api.getChatMember(
        XRAID_PROJECT_ID,
        userId
      );

      const notMember =
        status === "kicked" || status === "left" || status === "restricted";

      if (notMember) {
        throw Error("Not a member");
      }
    }
    return true;
  } catch (err) {
    ctx.reply(
      "To use this bot please join our XRaid Community group.\n\nPortal - https://t.me/XraidAiProject"
    );
    return false;
  }
}
