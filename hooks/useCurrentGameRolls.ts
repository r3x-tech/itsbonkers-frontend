import { useQuery } from "@tanstack/react-query";
import { getGameRolls } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import { useCurrentSlot } from "./useCurrentSlot";
import userStore from "@/stores/userStore";
import { BN } from "@coral-xyz/anchor";

export const useCurrentGameRolls = (connection: Connection) => {
  const { gameSettings, globalGameId } = userStore();
  const { data: currentSlot } = useCurrentSlot();

  return useQuery(
    ["curentGameRolls"],
    () => {
      if (!currentSlot || !gameSettings || !globalGameId) {
        return { rolls: [new BN(0)] };
      }

      if (currentSlot > gameSettings?.stage1End?.toNumber()) {
        return getGameRolls(globalGameId, connection, "DELIVERY");
      } else {
        return getGameRolls(globalGameId, connection, "BUILD");
      }
    },
    {
      enabled: !!connection,
    }
  );
};
