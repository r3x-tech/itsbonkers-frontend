import { useQuery } from "@tanstack/react-query";
import { getWalletTokenBalance } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";

export const useCurrentLandingGearParts = (
  walletAddress: PublicKey | null,
  connection: Connection,
  tokenMint: string
) => {
  return useQuery<bigint>(
    ["walletLandingGearBalance", walletAddress],
    async () => {
      if (walletAddress && connection && tokenMint) {
        try {
          const amount = await getWalletTokenBalance({
            walletAddress,
            connection,
            tokenMint,
          });
          console.log(
            "useCurrentLandingGearParts balance: ",
            BigInt(amount).toString()
          );
          return BigInt(amount);
        } catch (error) {
          console.error("Error fetching landing gear parts balance:", error);
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
