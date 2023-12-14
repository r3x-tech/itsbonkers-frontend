import { PublicKey } from "@solana/web3.js";

export interface Sleigh {
  name: string;
  stats: string[];
}

export type TxResponse = {
  result: {
    encoded_transaction: string;
    mint: string;
  };
};
