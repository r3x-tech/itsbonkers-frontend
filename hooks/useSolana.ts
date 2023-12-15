import * as web3 from "@solana/web3.js";

const useSolana = () => {
  const connection = new web3.Connection(process.env.NEXT_PUBLIC_RPC_URL!);

  return { connection };
};

export default useSolana;
