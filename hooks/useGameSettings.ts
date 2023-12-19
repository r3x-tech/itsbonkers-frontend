import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getGameSettings } from "@/utils/solana";
import { Connection } from "@solana/web3.js";
import { GameSettings } from "@/types/types";

export const useGameSettings = (
  connection: Connection
): UseQueryResult<GameSettings | undefined, unknown> => {
  return useQuery(["gameSettings"], () => getGameSettings(connection), {
    enabled: !!connection,
  });
};
