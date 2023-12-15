import React, {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import theme from "@/styles/theme";

export type ButtonProps = PropsWithChildren<{
  className?: string;
  disabled?: boolean;
  endIcon?: ReactElement;
  onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  startIcon?: ReactElement;
  style?: CSSProperties;
  tabIndex?: number;
}>;

type Props = ButtonProps & {
  labels: {
    "change-wallet": string;
    connecting: string;
    "copy-address": string;
    copied: string;
    disconnect: string;
    "has-wallet": string;
    "no-wallet": string;
  };
};

const baseButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderColor: `${theme.colors.primary}`,
  borderWidth: "2px",
  borderRadius: "30px",
  color: `${theme.colors.white}`,
  width: "100%",
  padding: "1rem",
  fontSize: "1.5rem",
  fontWeight: 700,
  cursor: "pointer",
  backgroundColor: `${theme.colors.primary}`,
  fontFamily: `${theme.fonts.body}`,
};

const hoverButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: `${theme.colors.accentThree}`,
  borderColor: `${theme.colors.accentThree}`,
  borderWidth: "2px",
  borderRadius: "30px",
  color: `${theme.colors.white}`,
};

export default function BaseWalletMultiButton({
  children,
  labels,
  ...props
}: Props) {
  const [hover, setHover] = useState(false);
  const { setVisible: setModalVisible } = useWalletModal();
  const { buttonState, onConnect, onDisconnect, publicKey } =
    useWalletMultiButton({
      onSelectWallet() {
        setModalVisible(true);
      },
    });

  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLUListElement>(null);

  const content = useMemo(() => {
    const getLabel = (state: string) => {
      return labels[state as keyof typeof labels] || "";
    };

    if (children) {
      return children;
    } else if (publicKey) {
      const base58 = publicKey.toBase58();
      return base58.slice(0, 4) + ".." + base58.slice(-4);
    } else {
      return getLabel(buttonState);
    }
  }, [buttonState, children, labels, publicKey]);

  const mouseDownListener = (event: globalThis.MouseEvent) => {
    const node = ref.current;
    if (!node || node.contains(event.target as Node)) return;
    setMenuOpen(false);
  };

  const touchStartListener = (event: TouchEvent) => {
    const node = ref.current;
    if (!node || node.contains(event.target as Node)) return;
    setMenuOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", mouseDownListener);
    document.addEventListener("touchstart", touchStartListener);

    return () => {
      document.removeEventListener("mousedown", mouseDownListener);
      document.removeEventListener("touchstart", touchStartListener);
    };
  }, []);

  return (
    <div className="wallet-adapter-dropdown">
      <div
        {...props}
        style={hover ? hoverButtonStyle : baseButtonStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          switch (buttonState) {
            case "no-wallet":
              setModalVisible(true);
              break;
            case "has-wallet":
              if (onConnect) {
                onConnect();
              }
              break;
            case "connected":
              setMenuOpen(!menuOpen);
              break;
            case "connecting":
              // You can add additional logic here if needed
              break;
            // ... add any additional cases if required
          }
        }}
      >
        {content}
      </div>
      {menuOpen && (
        <ul
          aria-label="dropdown-list"
          className={`wallet-adapter-dropdown-list`}
          ref={ref}
          role="menu"
        >
          {publicKey && (
            <li
              className="wallet-adapter-dropdown-list-item"
              onClick={async () => {
                await navigator.clipboard.writeText(publicKey.toBase58());
                setCopied(true);
                setTimeout(() => setCopied(false), 400);
              }}
              role="menuitem"
            >
              {copied ? labels["copied"] : labels["copy-address"]}
            </li>
          )}
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={() => {
              setModalVisible(true);
              setMenuOpen(false);
            }}
            role="menuitem"
          >
            {labels["change-wallet"]}
          </li>
          {onDisconnect && (
            <li
              className="wallet-adapter-dropdown-list-item"
              onClick={() => {
                onDisconnect();
                setMenuOpen(false);
              }}
              role="menuitem"
            >
              {labels["disconnect"]}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
