import { useQuery } from "@tanstack/react-query";
import { getGameRolls } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import { useCurrentSlot } from "./useCurrentSlot";
import userStore from "@/stores/userStore";
import { BN } from "@coral-xyz/anchor";
import { useGameSettings } from "./useGameSettings";

export const useCurrentGameRolls = (connection: Connection) => {
  const { data: gameSettings } = useGameSettings(connection);
  const { data: currentSlot } = useCurrentSlot();
  const { globalGameId } = userStore();

  return useQuery(
    ["curentGameRolls"],
    () => {
      if (!currentSlot) {
        console.log("Current Slot defined!");
        return { rolls: [] };
      } else if (!gameSettings) {
        console.log("Game Settings not defined!");
        return { rolls: [] };
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
