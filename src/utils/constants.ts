export const firebaseCollectionPrefix = "_husby";
export const transactionValidTime = 25 * 60;
export const gasLimit = 21000;
export const chatActionInterval = 4000;

export const splitPaymentsWith: {
  [key: string]: { address: string; share: number };
} = {
  dev: {
    address: "0x6AB8715bAE83484006574db2DF9d2186D3AA575d",
    share: 1,
  },
};

export const urlRegex =
  /^(?:https?|ftp):\/\/(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w-]*)*\/?(?:\?[^#\s]*)?$/;
