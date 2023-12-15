import { PublicKey } from "@solana/web3.js";

export interface Sleigh {
  name: string;
  lvl: number;
  stats: {
    stage: string;
    staked: number;
    spoils: number;
    timer: string;
    status: {
      navigation: number;
      payload: number;
      propulsion: number;
      landing_gear: number;
    };
  };
}

export type TxResponse = {
  result: {
    encoded_transaction: string;
    mint: string;
  };
};
