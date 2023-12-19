import { PublicKey } from "@solana/web3.js";

export interface OldSleigh {
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

export interface GameSettings {
  gameId: number; // random id for the game
  highestCurrentStake: number; // Used in Stage 1 to determine roll max
  stage1Start: number; // Slot number when stage 1 starts
  stage1End: number; // Slot Number when no more stake is allowed to be put in
  lastRolled: number; // last time a roll was performed
  rollInterval: number; // last_rolled + roll_interval is when next roll should take place
  coinMint: string; // the coin (Bonk on mainnet) which is used to do all transactions
  coinDecimals: number; // number of decimals the coin has
  sleighsBuilt: number; // total number of sleighs built
  sleighsRetired: number; // total number of sleighs retired. game is over when this equals built
  mintCostMultiplier: number; // sleighs_built*mint_cost_multiplier = cost for next stake
  propulsionPartsMint: string; // The mint address for this resource instance for this game
  landingGearPartsMint: string; // The mint address for this resource instance for this game
  navigationPartsMint: string; // The mint address for this resource instance for this game
  presentsBagPartsMint: string; // The mint address for this resource instance for this game
  prizePool: number;
}

export interface GameRolls {
  rolls: number[];
}

export interface Sleigh {
  owner: string;
  sleighId: string;
  level: number;
  gameId: number; // used to search for game accounts by server
  builtIndex: number; // set to 0 if unconfirmed so far, first sleigh is index 1
  mintCost: number; // mint cost paid to build the sleigh // 0 to start as it'll be unconfirmed
  stakeAmt: number; // includes mint amt because at start mint amount is not deducted. when returning spoils, use (stake-mint) * 70% + spoils
  broken: boolean; // if broken, cannot produce any more resources, and can only be scuttled (or rez'd at 70% stake)
  stakedAfterRoll: number; // the idx of the roll that this was built *after* so they can't claim previous rolls
  lastCheckedRoll: number; // up to the last largest idx that was claimed
  lastDeliveryRoll: number; // stage 2 rolls

  // Parts
  propulsionHp: number;
  landingGearHp: number;
  navigationHp: number;
  presentsBagHp: number;
}

export type TxResponse = {
  result: {
    encoded_transaction: string;
    mint: string;
  };
};
