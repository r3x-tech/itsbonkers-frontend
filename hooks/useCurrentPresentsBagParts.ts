import { useQuery } from "@tanstack/react-query";
import { getWalletTokenBalance } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";

export const useCurrentPresentsBagParts = (
  walletAddress: PublicKey | null,
  connection: Connection,
  tokenMint: string
) => {
  return useQuery<bigint>(
    ["walletPresentsBagBalance", walletAddress],
    async () => {
      if (walletAddress && connection && tokenMint) {
        try {
          const amount = await getWalletTokenBalance({
            walletAddress,
            connection,
            tokenMint,
          });
          console.log(
            "walletPresentsBagBalance balance: ",
            BigInt(amount).toString()
          );
          return BigInt(amount);
        } catch (error) {
          console.error("Error fetching presents bag parts balance:", error);
          return BigInt(0);
        }
      }
      return BigInt(0);
    },
    {
      enabled: !!walletAddress && !!connection,
    }
  );
};
