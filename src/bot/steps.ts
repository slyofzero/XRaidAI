import { CommandContext, Context } from "grammy";
import {
  generateShillText,
  shillTextStep2,
  shillTextStep3,
} from "./commands/generateShillText";

interface Steps {
  [key: string]: (ctx: CommandContext<Context>) => Promise<void>;
}

export const steps: { [key: string]: Steps } = {
  shillText: {
    platform: shillTextStep2,
    name: shillTextStep3,
    description: generateShillText,
  },
};
