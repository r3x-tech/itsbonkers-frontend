import { Sleigh } from "@/types/types";
import { Wallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { create } from "zustand";

type Store = {
  loggedIn: boolean;
  loginType: string;
  username: string;
  solana_wallet_address: string;
  wallet: Wallet | null;
  solanaConnection: Connection | null;
  userProfilePic: string;
  sleighs: Sleigh[];
  setLogin: (
    status: boolean,
    loginType: string,
    username: string,
    solana_wallet_address: string,
    wallet: Wallet | null,
    solanaConnection: Connection | null
  ) => void;
  setSleighs: (setSleighs: Sleigh[]) => void;
};

export const userStore = create<Store>((set) => ({
  loggedIn: false,
  loginType: "",
  username: "",
  solana_wallet_address: "",
  wallet: null,
  solanaConnection: null,
  userProfilePic:
    "https://gold-increasing-bonobo-965.mypinata.cloud/ipfs/QmWq2gkfWJuyQJb5jad3u34jdrS7XMD4fNFYbWE1pec4ff?_gl=1*19d17fu*_ga*MjA3NjQ1NTYyNC4xNjk0NTMzODE1*_ga_5RMPXG14TE*MTY5NTEzNzA1OS40LjAuMTY5NTEzNzA1OS42MC4wLjA.",
  sleighs: [],
  setLogin: (
    status,
    loginType,
    username,
    solana_wallet_address,
    wallet,
    solanaConnection
  ) =>
    set({
      loggedIn: status,
      loginType: loginType,
      username: username,
      solana_wallet_address: solana_wallet_address,
      wallet: wallet,
      solanaConnection: solanaConnection,
    }),
  setSleighs: (sleighs) =>
    set({
      sleighs: sleighs,
    }),
}));

export default userStore;
