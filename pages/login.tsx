import {
  Button,
  Flex,
  Stack,
  Text,
  Spinner,
  Input,
  Heading,
  Image,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import theme from "@/styles/theme";
import userStore from "@/stores/userStore";
import toast from "react-hot-toast";
import { WalletMultiButton } from "@/components/auth/WalletMultiButton";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import { Keypair, PublicKey } from "@solana/web3.js";
import useSleighs from "@/hooks/useSleighs";
import useSolana from "@/hooks/useSolana";
import {
  LANDING_GEAR_MINT_ADDRESS,
  NAVIGATION_MINT_ADDRESS,
  PRESENTS_BAG_MINT_ADDRESS,
  PROPULSION_MINT_ADDRESS,
} from "@/constants";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { sendAllTxParallel } from "@/utils/solana";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const { refetch: refetchSleighs } = useSleighs();

  const { connection } = useSolana();
  const {
    wallet,
    publicKey,
    signTransaction,
    signAllTransactions,
    connecting,
    disconnecting,
  } = useWallet();

  const { username, loggedIn } = userStore();

  useEffect(() => {
    const fetchandCreateAtas = async (currentPublicKey: PublicKey) => {
      const propulsionMintAddress = new PublicKey(PROPULSION_MINT_ADDRESS);
      const landingGearMintAddress = new PublicKey(LANDING_GEAR_MINT_ADDRESS);
      const navigationMintAddress = new PublicKey(NAVIGATION_MINT_ADDRESS);
      const presentsBagMintAddress = new PublicKey(PRESENTS_BAG_MINT_ADDRESS);

      let ixs = [];

      const sleighPropulsionPartsAta = getAssociatedTokenAddressSync(
        propulsionMintAddress,
        currentPublicKey
      );

      const sleighPropulsionPartsAtaBalance = await connection.getBalance(
        sleighPropulsionPartsAta
      );
      if (sleighPropulsionPartsAtaBalance == 0) {
        const ix = createAssociatedTokenAccountInstruction(
          currentPublicKey,
          sleighPropulsionPartsAta,
          currentPublicKey,
          propulsionMintAddress
        );
        ixs.push(ix);
      }

      const sleighLandingGearPartsAta = getAssociatedTokenAddressSync(
        landingGearMintAddress,
        currentPublicKey
      );
      const sleighLandingGearPartsAtaBalance = await connection.getBalance(
        sleighLandingGearPartsAta
      );
      if (sleighLandingGearPartsAtaBalance == 0) {
        const ix = createAssociatedTokenAccountInstruction(
          currentPublicKey,
          sleighLandingGearPartsAta,
          currentPublicKey,
          landingGearMintAddress
        );
        ixs.push(ix);
      }

      const sleighNavigationPartsAta = getAssociatedTokenAddressSync(
        navigationMintAddress,
        currentPublicKey
      );
      const sleighNavigationPartsAtaBalance = await connection.getBalance(
        sleighPropulsionPartsAta
      );
      if (sleighNavigationPartsAtaBalance == 0) {
        const ix = createAssociatedTokenAccountInstruction(
          currentPublicKey,
          sleighNavigationPartsAta,
          currentPublicKey,
          navigationMintAddress
        );
        ixs.push(ix);
      }

      const sleighPresentsBagPartsAta = getAssociatedTokenAddressSync(
        presentsBagMintAddress,
        currentPublicKey
      );
      const sleighPresentsBagPartsAtaBalance = await connection.getBalance(
        sleighPresentsBagPartsAta
      );
      if (sleighPresentsBagPartsAtaBalance == 0) {
        const ix = createAssociatedTokenAccountInstruction(
          currentPublicKey,
          sleighPresentsBagPartsAta,
          currentPublicKey,
          navigationMintAddress
        );
        ixs.push(ix);
      }

      if (ixs.length > 0) {
        await sendAllTxParallel(
          connection,
          ixs,
          currentPublicKey,
          signAllTransactions
        );
        router.push("/home");
      }
    };

    if (loggedIn && connection && publicKey != null) {
      // fetchandCreateAtas(publicKey);
      router.push("/home");
    }
  }, [connection, loggedIn, publicKey, router, signAllTransactions]);

  useEffect(() => {
    const fetchData = async () => {
      if (connection && publicKey && !loggedIn && wallet) {
        setLoginInProgress(true);
        let keypair = Keypair.generate();

        let KEY: any = keypair;
        KEY.payer = keypair;

        userStore.setState({
          loggedIn: true,
          loginType: "SOLANA",
          username: publicKey.toString(),
          solana_wallet_address: publicKey.toString(),
          wallet: wallet,
          solanaConnection: connection,
        });

        setLoginInProgress(false);
      }
    };

    fetchData();
  }, [connection, loggedIn, publicKey, wallet]);

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      h="100vh"
      w="100vw"
      bg={theme.colors.background}
    >
      <Flex
        direction="column"
        alignItems="center"
        fontFamily="Montserrat"
        p="1rem"
        minWidth="22rem"
      >
        <Flex justifyContent="center">
          <Image
            src="/bonkerslargelogo.png"
            alt="User Profile Pic"
            w="50rem"
            cursor="pointer"
            onClick={() => {
              // router.push("/account");
            }}
          />
        </Flex>
        <Flex w="100%" mt="10rem">
          {!isLoginInProgress && !connecting ? (
            <Stack h="100%" w="100%">
              <WalletMultiButton />
            </Stack>
          ) : (
            <Flex
              w="100%"
              flexDirection="column"
              align="center"
              justifyContent="center"
              color={theme.colors.white}
              my="4.58rem"
            >
              <Spinner size="sm" />
              <Text mt={3} fontSize="0.75rem" fontWeight="500">
                LOGGING IN
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default LoginPage;
