import { ethers } from "ethers";
import { errorHandler, log } from "./handlers";
import { gasLimit, splitPaymentsWith } from "./constants";
import { provider, web3 } from "@/rpc";

export function generateAccount() {
  const wallet = ethers.Wallet.createRandom();

  const data = {
    publicKey: wallet.address,
    secretKey: wallet.privateKey,
  };
  return data;
}

export async function sendTransaction(
  secretKey: string,
  amount: number,
  to?: string
) {
  try {
    const wallet = new ethers.Wallet(secretKey, provider);
    const valueAfterGas = amount - gasLimit;
    const gasPrice = await web3.eth.getGasPrice();

    const tx = await wallet.sendTransaction({
      to: to,
      value: valueAfterGas,
      gasLimit: gasLimit * Number(gasPrice),
    });

    return tx;
  } catch (error) {
    log(`No transaction for ${amount} to ${to}`);
    errorHandler(error);
  }
}

export async function splitPayment(
  secretKey: string,
  totalPaymentAmount: bigint
) {
  for (const revShare in splitPaymentsWith) {
    const { address, share } = splitPaymentsWith[revShare];
    const amountToShare = Number(totalPaymentAmount) * share;

    sendTransaction(secretKey, amountToShare, address).then((tx) =>
      log(`Fees of ${amountToShare} lamports sent, ${tx?.hash}`)
    );
  }
}
