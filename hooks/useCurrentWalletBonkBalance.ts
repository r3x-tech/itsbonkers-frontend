import { useQuery } from "@tanstack/react-query";
import { getBonkBalance } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import userStore from "@/stores/userStore";

export const useCurrentWalletBonkBalance = (
  walletAddress: PublicKey | null,
  connection: Connection
) => {
  const { TOKEN_MINT_ADDRESS } = userStore();

  return useQuery(
    ["walletBonkBalance", walletAddress?.toBase58()],
    () => {
      if (!TOKEN_MINT_ADDRESS) {
        return 0;
      }
      if (walletAddress) {
        return getBonkBalance({
          walletAddress: walletAddress.toBase58(),
          connection,
          bonkMintAddress: TOKEN_MINT_ADDRESS,
        });
      }
      return 0;
    },
    {
      enabled: !!walletAddress && !!connection,
    }
  );
};
