import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getGameSettings } from "@/utils/solana";
import { Connection } from "@solana/web3.js";
import { GameSettings } from "@/types/types";
import userStore from "@/stores/userStore";
import { GAME_ID } from "@/constants";

export const useGameSettings = (
  connection: Connection
): UseQueryResult<GameSettings> => {
  // const { globalGameId } = userStore();
  const globalGameId = GAME_ID;
  return useQuery(
    ["gameSettings"],
    async () => {
      if (!globalGameId) {
        throw new Error("Global game ID is not set");
      }
      return getGameSettings(GAME_ID, connection);
    },
    {
      enabled: !!connection && !!globalGameId,
    }
  );
};
