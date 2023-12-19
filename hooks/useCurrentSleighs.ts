import { useQuery } from "@tanstack/react-query";
import { getCurrentSleighs } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";

export const useCurrentSleighs = (
  walletAddress: PublicKey | null,
  connection: Connection
) => {
  return useQuery(
    ["currentSleighs", walletAddress?.toBase58()],
    () => getCurrentSleighs(walletAddress, connection),
    {
      enabled: !!walletAddress && !!connection,
    }
  );
};
