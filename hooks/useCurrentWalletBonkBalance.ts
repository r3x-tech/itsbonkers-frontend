import { useQuery } from "@tanstack/react-query";
import { getBonkBalance } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";

export const useCurrentWalletBonkBalance = (
  walletAddress: PublicKey | null,
  connection: Connection
) => {
  return useQuery(
    ["walletBonkBalance", walletAddress?.toBase58()],
    () => {
      if (walletAddress) {
        return getBonkBalance({
          walletAddress: walletAddress.toBase58(),
          connection,
        });
      }
      return 0;
    },
    {
      enabled: !!walletAddress && !!connection,
    }
  );
};
