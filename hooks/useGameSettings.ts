import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getGameSettings } from "@/utils/solana";
import { Connection } from "@solana/web3.js";
import { GameSettings } from "@/types/types";
import userStore from "@/stores/userStore";

export const useGameSettings = (
  connection: Connection
): UseQueryResult<GameSettings> => {
  const { globalGameId } = userStore();

  return useQuery(
    ["gameSettings"],
    async () => {
      if (!globalGameId) {
        throw new Error("Global game ID is not set");
      }
      return getGameSettings(globalGameId, connection);
    },
    {
      enabled: !!connection && !!globalGameId,
    }
  );
};
