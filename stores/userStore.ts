import { GameSettings, Sleigh } from "@/types/types";
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
  gameSettings: GameSettings | null;
  PROPULSION_MINT_ADDRESS: string | null;
  LANDING_GEAR_MINT_ADDRESS: string | null;
  NAVIGATION_MINT_ADDRESS: string | null;
  PRESENTS_BAG_MINT_ADDRESS: string | null;
  globalGameId: number | null;
  setLogin: (
    status: boolean,
    loginType: string,
    username: string,
    solana_wallet_address: string,
    wallet: Wallet | null,
    solanaConnection: Connection | null
  ) => void;
  setSleighs: (setSleighs: Sleigh[]) => void;
  setGameSettings: (gameSettings: GameSettings) => void;
  setGlobalGameId: (propulsionMintAddress: number) => void;
  setPropulsionMintAddress: (PROPULSION_MINT_ADDRESS: string) => void;
  setLandingGearMintAddress: (LANDING_GEAR_MINT_ADDRESS: string) => void;
  setNavigationMintAddress: (NAVIGATION_MINT_ADDRESS: string) => void;
  setPresentsBagMintAddress: (PRESENTS_BAG_MINT_ADDRESS: string) => void;
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
  gameSettings: null,
  globalGameId: null,
  PROPULSION_MINT_ADDRESS: null,
  LANDING_GEAR_MINT_ADDRESS: null,
  NAVIGATION_MINT_ADDRESS: null,
  PRESENTS_BAG_MINT_ADDRESS: null,
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
  setGameSettings: (gameSettings) =>
    set({
      gameSettings: gameSettings,
    }),
  setGlobalGameId: (globalGameId) =>
    set({
      globalGameId: globalGameId,
    }),
  setPropulsionMintAddress: (propulsionMintAddress) =>
    set({
      PROPULSION_MINT_ADDRESS: propulsionMintAddress,
    }),
  setLandingGearMintAddress: (landingGearMintAddress) =>
    set({
      LANDING_GEAR_MINT_ADDRESS: landingGearMintAddress,
    }),
  setNavigationMintAddress: (navigationMintAddress) =>
    set({
      NAVIGATION_MINT_ADDRESS: navigationMintAddress,
    }),
  setPresentsBagMintAddress: (presentsBagMintAddress) =>
    set({
      PRESENTS_BAG_MINT_ADDRESS: presentsBagMintAddress,
    }),
}));

export default userStore;
