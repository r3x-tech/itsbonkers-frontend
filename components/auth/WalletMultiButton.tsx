import React from "react";
import type {
  CSSProperties,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
} from "react";
import BaseWalletMultiButton from "./BaseWalletMultiButton";

export type ButtonProps = PropsWithChildren<{
  className?: string;
  disabled?: boolean;
  endIcon?: ReactElement;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  startIcon?: ReactElement;
  style?: CSSProperties;
  tabIndex?: number;
}>;

const LABELS = {
  "change-wallet": "CHANGE WALLET",
  connecting: "CONNECTING ...",
  "copy-address": "COPY ADDRESS",
  copied: "COPIED",
  disconnect: "DISCONNECT",
  "has-wallet": "LOGIN W/ SOLANA",
  "no-wallet": "LOGIN W/ SOLANA",
} as const;

export function WalletMultiButton(props: ButtonProps) {
  return <BaseWalletMultiButton {...props} labels={LABELS} />;
}
