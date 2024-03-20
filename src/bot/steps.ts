import {
  generateShillText,
  shillTextStep0,
  shillTextStep2,
  shillTextStep3,
  shillTextStep4,
  shillTextStep5,
} from "./commands/shillText";
import { prepareSubscription } from "./actions/prepareSubscription";
import { confirmPayment } from "./actions/confirmPayment";
import { generateMeme, memeStep0, memeStep1 } from "./commands/meme";
import {
  confirmInfo,
  infoStep1,
  infoStep2,
  infoStep3,
} from "./commands/setInfo";

interface Steps {
  [key: string]: (ctx: any) => Promise<any>;
}

export const steps: { [key: string]: Steps } = {
  generate: {
    shillText: shillTextStep0,
    meme: memeStep0,
  },
  shillText: {
    mode: shillTextStep2,
    name: shillTextStep3,
    description: shillTextStep4,
    socials: shillTextStep5,
    focus: generateShillText,
  },
  meme: {
    description: memeStep1,
    style: generateMeme,
    // text: generateMeme,
  },
  subscription: {
    subscribe: prepareSubscription,
    payment: confirmPayment,
  },
  info: {
    tone: infoStep1,
    name: infoStep2,
    description: infoStep3,
    socials: confirmInfo,
  },
};
