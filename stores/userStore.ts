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
    "https://shdw-drive.genesysgo.net/5jHWA7UVajMawLH2wVCZdp3U4u42XsF8rSa1DcEQui72/profilePicWhite.svg",
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
