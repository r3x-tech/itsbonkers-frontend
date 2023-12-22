import { BN } from "@coral-xyz/anchor";
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
  gameId: BN; // random id for the game
  totalStake: BN; // Used in Stage 1 to determine roll max
  stage1Start: BN; // Slot number when stage 1 starts
  stage1End: BN; // Slot Number when no more stake is allowed to be put in
  lastRolled: BN; // last time a roll was performed
  rollInterval: BN; // last_rolled + roll_interval is when next roll should take place
  coinMint: PublicKey; // the coin (Bonk on mainnet) which is used to do all transactions
  coinDecimals: BN; // number of decimals the coin has
  sleighsStaked: BN; // total sleighs staked
  sleighsBuilt: BN; // total number of sleighs built
  sleighsRetired: BN; // total number of sleighs retired. game is over when this equals built
  mintCostMultiplier: BN; // sleighs_built*mint_cost_multiplier = cost for next stake
  propulsionPartsMint: string; // The mint address for this resource instance for this game
  landingGearPartsMint: string; // The mint address for this resource instance for this game
  navigationPartsMint: string; // The mint address for this resource instance for this game
  presentsBagPartsMint: string; // The mint address for this resource instance for this game
  prizePool: BN;
}

export interface GameRolls {
  rolls: BN[];
}

export interface Sleigh {
  owner: PublicKey;
  sleighId: BN;
  level: BN;
  gameId: BN; // used to search for game accounts by server
  builtIndex: BN; // set to 0 if unconfirmed so far, first sleigh is index 1
  mintCost: BN; // mint cost paid to build the sleigh // 0 to start as it'll be unconfirmed
  stakeAmt: BN; // includes mint amt because at start mint amount is not deducted. when returning spoils, use (stake-mint) * 70% + spoils
  broken: boolean; // if broken, cannot produce any more resources, and can only be scuttled (or rez'd at 70% stake)
  stakedAfterRoll: BN; // the idx of the roll that this was built *after* so they can't claim previous rolls
  lastClaimedRoll: BN; // up to the last largest idx that was claimed
  lastDeliveryRoll: BN; // stage 2 rolls

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
