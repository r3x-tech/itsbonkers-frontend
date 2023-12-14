// import { Button } from "@chakra-ui/react";
import type {
  CSSProperties,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
} from "react";
import { BaseWalletConnectButton } from "@solana/wallet-adapter-react-ui";
// import theme from "@/styles/theme";

const LABELS = {
  connecting: "Connecting ...",
  connected: "Connected",
  "has-wallet": "SOLANA",
  "no-wallet": "SOLANA",
} as const;

export type ButtonProps = PropsWithChildren<{
  className?: string;
  disabled?: boolean;
  endIcon?: ReactElement;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  startIcon?: ReactElement;
  style?: CSSProperties;
  tabIndex?: number;
}>;

export function WalletConnectButton(props: ButtonProps) {
  return (
    // <Button
    //   variant="outline"
    //   borderColor={theme.colors.white}
    //   border="2px solid white"
    //   borderRadius="2px"
    //   color={theme.colors.white}
    //   width="100%"
    //   fontSize="0.75rem"
    //   fontWeight="700"
    //   _hover={{
    //     color: theme.colors.black,
    //     backgroundColor: theme.colors.white,
    //     borderColor: theme.colors.white,
    //   }}
    //   onClick={props.onClick}
    // >
    <BaseWalletConnectButton {...props} labels={LABELS} />
    // </Button>
  );
}
