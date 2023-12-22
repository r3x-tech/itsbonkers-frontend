import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getGameSettings } from "@/utils/solana";
import { Connection } from "@solana/web3.js";
import { GameSettings } from "@/types/types";
import userStore from "@/stores/userStore";

export const useGameSettings = (
  connection: Connection
): UseQueryResult<GameSettings | undefined, unknown> => {
  const { globalGameId } = userStore();

  return useQuery(
    ["gameSettings"],
    () => {
      if (!globalGameId) {
        return [];
      }
      getGameSettings(globalGameId, connection);
    },
    {
      enabled: !!connection,
    }
  );
};
