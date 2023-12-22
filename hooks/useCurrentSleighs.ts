import { useQuery } from "@tanstack/react-query";
import { getCurrentSleighs } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import userStore from "@/stores/userStore";

export const useCurrentSleighs = (
  walletAddress: PublicKey | null,
  connection: Connection
) => {
  const { globalGameId } = userStore();

  return useQuery(
    ["currentSleighs", walletAddress?.toBase58()],
    () => {
      if (!globalGameId) {
        return [];
      }
      getCurrentSleighs(globalGameId, walletAddress, connection);
    },
    {
      enabled: !!walletAddress && !!connection,
    }
  );
};
