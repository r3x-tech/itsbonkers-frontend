import { useQuery } from "@tanstack/react-query";
import { fetchCurrentSlot } from "@/utils/solana";
import { Connection, PublicKey } from "@solana/web3.js";
import useSolana from "./useSolana";

export const useCurrentSlot = () => {
  const { connection } = useSolana();

  return useQuery(["slot"], () => {
    if (connection) {
      return fetchCurrentSlot(connection);
    }
    return 0;
  });
};
