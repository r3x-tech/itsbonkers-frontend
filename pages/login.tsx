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
import { useCallback, useEffect, useState } from "react";
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

  const calculateTimeLeft = useCallback(() => {
    const targetDate = new Date("2023-12-21 18:00:00");

    const now = new Date();
    const timeDiff = targetDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { days: "00", hours: "00", minutes: "00" };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      h="100vh"
      w="100vw"
      bgImage="url('/snowfall.gif')"
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        fontFamily="Montserrat"
        p="1rem"
        minWidth="22rem"
        h="100vh"
        w="100vw"
        backgroundColor="rgba(0, 0, 0, 0.25)" // Optional: Adds a dark overlay for better readability
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
        <Flex w="60rem" mt="10rem">
          {!isLoginInProgress && !connecting ? (
            <Stack h="100%" w="100%">
              <WalletMultiButton />
              {/* <Button
                bg={theme.colors.primary}
                w="100%"
                py="1.5rem"
                h="5rem"
                px="3rem"
                borderColor={theme.colors.primary}
                borderWidth="2px"
                borderRadius="30px"
                color={theme.colors.white}
                fontSize="1.5rem"
                letterSpacing="1px"
                fontWeight="700"
                isDisabled={true}
                fontFamily={theme.fonts.body}
                _hover={{
                  color: theme.colors.white,
                  borderColor: theme.colors.accentThree,
                  bg: theme.colors.accentThree,
                }}
                _disabled={{
                  color: theme.colors.white,
                  borderColor: theme.colors.primary,
                  bg: theme.colors.primary,
                }}
              >
                <Text
                  mr="2rem"
                  fontSize="2.5rem"
                  fontWeight="700"
                  color={theme.colors.tertiary}
                >
                  SEASON 1
                </Text>{" "}
                STARTING IN
                <Flex justifyContent="end" align="center" ml="2rem" gap={2}>
                  <Text
                    fontSize="3rem"
                    fontWeight="700"
                    color={theme.colors.tertiary}
                  >
                    {timeLeft.days}
                  </Text>
                  <Text
                    fontSize="1.5rem"
                    fontWeight="700"
                    color={theme.colors.white}
                    mx="0.5rem"
                  >
                    DAYS
                  </Text>
                  <Text
                    fontSize="3rem"
                    fontWeight="700"
                    color={theme.colors.tertiary}
                  >
                    {timeLeft.hours}
                  </Text>
                  <Text
                    fontSize="1.5rem"
                    fontWeight="700"
                    color={theme.colors.white}
                    mx="0.5rem"
                  >
                    HRS
                  </Text>
                  <Text
                    fontSize="3rem"
                    fontWeight="700"
                    color={theme.colors.tertiary}
                    fontFamily={theme.fonts.body}
                  >
                    {timeLeft.minutes}
                  </Text>
                  <Text
                    fontSize="1.5rem"
                    fontWeight="700"
                    color={theme.colors.white}
                    fontFamily={theme.fonts.body}
                    mx="0.5rem"
                  >
                    MIN
                  </Text>
                </Flex>
              </Button> */}
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
