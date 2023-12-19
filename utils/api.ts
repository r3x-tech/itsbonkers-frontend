import { sampleSleighs } from "@/stores/sampleData";
import userStore from "@/stores/userStore";
import { Sleigh } from "@/types/types";

export const getGameState = async () => {
  const { loggedIn } = userStore.getState();

  if (!loggedIn) {
    console.error("User not logged in.");
  }

  if (sampleSleighs) {
    return sampleSleighs;
  } else {
    return [];
  }
};

export const fetchSleighs = async () => {
  const { loggedIn } = userStore.getState();

  if (!loggedIn) {
    console.error("User not logged in.");
  }

  if (sampleSleighs) {
    return sampleSleighs; // This mimics an asynchronous fetch from '@/stores/sampleData'
  } else {
    return [];
  }
};

// const gameSettingsPDA = PublicKey.findProgramAddressSync(
//   [
//     Buffer.from("settings"),
//     Uint8Array.from(
//       serializeUint64(BigInt(GAME_ID.toString()), {
//         endianess: ByteifyEndianess.BIG_ENDIAN,
//       })
//     ),
//   ],
//   new PublicKey(BONKERS_PROGRAM_PROGRAMID)
// )[0];

// const connection.FetchSlot

// - fetch slot
// - if > stage1_end in stage2
// - check time now vs roll_interval (time respresented in slots) about 0.5 sec per slot
// - prize_pool

// - spoils
//   if (stage1) fetch every 30min. static in stg2
//   let spoils = (game_settings.sleighs_built - sleigh.built_index)
//   fetch gameaccount
//   fetch sleighaccount

// - staked amount = stake_amt sleigh account

// propulsion_hp max out at 255

// max repair amount
// let propulsion_repair_cost = propulsion_repair as u64 * sleigh.last_delivery_roll * 2;

// current_mint cost is min stake amount

// sleighs_built*mint_cost_multiplier = cost for next stake in gamesettings
