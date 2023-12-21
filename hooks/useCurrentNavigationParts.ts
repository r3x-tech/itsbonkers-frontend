import { useQuery } from "@tanstack/react-query";
import { getWalletTokenBalance } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";

export const useCurrentNavigationParts = (
  walletAddress: PublicKey | null,
  connection: Connection,
  tokenMint: string
) => {
  return useQuery(
    ["walletBonkBalance", walletAddress?.toBase58()],
    () => {
      if (walletAddress) {
        return getWalletTokenBalance({
          walletAddress: walletAddress.toBase58(),
          connection,
          tokenMint,
        });
      }
      return 0;
    },
    {
      enabled: !!walletAddress && !!connection,
    }
  );
};
