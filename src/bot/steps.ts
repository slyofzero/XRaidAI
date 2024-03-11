import {
  generateShillText,
  shillTextStep2,
  shillTextStep3,
} from "./commands/generateShillText";
import { prepareSubscription } from "./actions/prepareSubscription";
import { confirmPayment } from "./actions/confirmPayment";

interface Steps {
  [key: string]: (ctx: any) => Promise<any>;
}

export const steps: { [key: string]: Steps } = {
  shillText: {
    platform: shillTextStep2,
    name: shillTextStep3,
    description: generateShillText,
  },
  subscription: {
    subscribe: prepareSubscription,
    payment: confirmPayment,
  },
};
