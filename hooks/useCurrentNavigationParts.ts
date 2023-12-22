import { useQuery } from "@tanstack/react-query";
import { getWalletTokenBalance } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";

export const useCurrentNavigationParts = (
  walletAddress: PublicKey | null,
  connection: Connection,
  tokenMint: string
) => {
  return useQuery<bigint>(
    ["walletNavigationBalance", walletAddress?.toBase58()],
    async () => {
      if (walletAddress) {
        try {
          const amount = await getWalletTokenBalance({
            walletAddress,
            connection,
            tokenMint,
          });
          console.log(
            "walletNavigationBalance balance: ",
            BigInt(amount).toString()
          );
          return BigInt(amount);
        } catch (error) {
          console.error("Error fetching navigation parts balance:", error);
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
