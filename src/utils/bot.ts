import { steps } from "@/bot/steps";
import { shillTextData } from "@/vars/shillText";

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
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#");

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
    }

    const stepFunction = steps[category][type];

    if (stepFunction) {
      stepFunction(ctx);
    } else {
      ctx.reply("No step function defined");
    }
  }
}
