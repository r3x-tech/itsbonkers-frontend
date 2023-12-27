export let GAME_ID = parseInt(process.env.NEXT_PUBLIC_GAME_ID!);
export const TOKEN_MINT_ADDRESS =
  "Gx1V34ivZZ1Fq7Rm9ZmogBdDgYZieYKjJU1icSupFuCT";

export const PROPULSION_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_PROPULSION_MINT_ADDRESS;
export const LANDING_GEAR_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_LANDING_GEAR_MINT_ADDRESS;
export const NAVIGATION_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_NAVIGATION_MINT_ADDRESS;
export const PRESENTS_BAG_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_PRESENTS_BAG_MINT_ADDRESS;

export const SPL_TOKENS: {
  [token: string]: { mint: string; decimals: number };
} = {
  bonk: {
    mint: "Gx1V34ivZZ1Fq7Rm9ZmogBdDgYZieYKjJU1icSupFuCT",
    decimals: 5,
  },
};

export const SLEIGH_NAMES = require("@/public/sleigh_names.json");

export const NUMBER_FORMATTER = Intl.NumberFormat("en", {
  notation: "compact",
});
