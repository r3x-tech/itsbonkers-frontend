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
import { useCallback, useEffect, useRef, useState } from "react";
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
import { IoIosArrowDown } from "react-icons/io";

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
  const signupRef = useRef<HTMLDivElement>(null);
  const learnMoreRef = useRef<HTMLDivElement>(null);

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
      direction="column"
      justifyContent="start"
      alignItems="center"
      h="400vh" // Four times the height of the viewport
      w="100vw" // Full width of the viewport
      bgImage="url('/snowscene4.gif')"
      backgroundSize="100% 100%" // Stretch to fill both width and height
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="space-between"
        fontFamily="Montserrat"
        p="1rem"
        minWidth="22rem"
        h="100vh"
        w="100vw"
      >
        <Flex
          h="5vh"
          mt="2rem"
          px="3rem"
          py="1rem"
          color={theme.colors.background}
          fontSize={["1.25rem", "1.5rem"]}
          letterSpacing="1px"
          fontWeight="700"
          fontFamily={theme.fonts.body}
          justifyContent="center"
          align="center"
          borderRadius="30px"
          borderColor={theme.colors.quaternary}
          bg={theme.colors.quaternary}
        >
          <Text
            mr={["1rem", "2rem"]}
            fontSize={["2.5rem", "2.5rem"]}
            fontWeight="700"
            color={theme.colors.white}
          >
            SEASON 1
          </Text>{" "}
          STARTING IN
          <Flex
            justifyContent="end"
            align="center"
            ml={["1rem", "2rem"]}
            gap={2}
          >
            <Text fontSize="3rem" fontWeight="700" color={theme.colors.white}>
              {timeLeft.days}
            </Text>
            <Text
              fontSize={["1.25rem", "1.5rem"]}
              fontWeight="700"
              color={theme.colors.background}
              mx={["0.25rem", "0.5rem"]}
            >
              DAYS
            </Text>
            <Text fontSize="3rem" fontWeight="700" color={theme.colors.white}>
              {timeLeft.hours}
            </Text>
            <Text
              fontSize={["1.25rem", "1.5rem"]}
              fontWeight="700"
              color={theme.colors.background}
              mx={["0.25rem", "0.5rem"]}
            >
              HRS
            </Text>
            <Text
              fontSize="3rem"
              fontWeight="700"
              color={theme.colors.white}
              fontFamily={theme.fonts.body}
            >
              {timeLeft.minutes}
            </Text>
            <Text
              fontSize={["1.25rem", "1.5rem"]}
              fontWeight="700"
              color={theme.colors.background}
              fontFamily={theme.fonts.body}
              mx={["0.25rem", "0.5rem"]}
            >
              MIN
            </Text>
          </Flex>
        </Flex>
        <Flex
          mt="8rem"
          p="5rem"
          borderRadius="3rem"
          flexDirection="column"
          justifyContent="center"
          align="center"
          bg={theme.colors.accentFive}
        >
          <Flex justifyContent="center">
            <Image
              src="/bonkerslargelogo.png"
              alt="User Profile Pic"
              w={["60vw", "40vw"]}
              cursor="pointer"
              onClick={() => {
                // router.push("/account");
              }}
            />
          </Flex>
          <Flex w={["60vw", "40vw"]} mt="5rem">
            {!isLoginInProgress && !connecting ? (
              <Stack h="100%" w="100%">
                <WalletMultiButton />
                <Button
                  borderWidth="2px"
                  borderColor={theme.colors.primary}
                  bg={theme.colors.primary}
                  borderRadius="30px"
                  fontWeight="700"
                  fontSize="1.5rem"
                  fontFamily={theme.fonts.body}
                  w="100%"
                  h="5rem"
                  color={theme.colors.white}
                  onClick={() =>
                    signupRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  _hover={{
                    color: theme.colors.background,
                    borderColor: theme.colors.quaternary,
                    bg: theme.colors.quaternary,
                  }}
                >
                  SIGN UP FOR SEASON 1
                </Button>
              </Stack>
            ) : (
              <Flex
                w="100%"
                flexDirection="column"
                align="center"
                justifyContent="center"
                color={theme.colors.background}
                mt="5rem"
              >
                <Spinner size="sm" />
                <Text mt={3} fontSize="0.75rem" fontWeight="500">
                  LOGGING IN
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          onClick={() =>
            learnMoreRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          cursor="pointer"
        >
          <Text
            color={theme.colors.accentFive}
            fontSize="2rem"
            fontWeight="700"
            fontFamily={theme.fonts.body}
          >
            LEARN MORE
          </Text>
          <IoIosArrowDown size="2rem" color={theme.colors.accentFive} />{" "}
        </Flex>
      </Flex>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        p="1rem"
        h="100vh"
        w="100vw"
        ref={learnMoreRef}
      >
        <Flex
          direction="column"
          alignItems="start"
          justifyContent="start"
          w="80%"
          py="5rem"
          mb="1rem"
          px="6rem"
          color={theme.colors.background}
          fontSize="1.5rem"
          letterSpacing="1px"
          fontWeight="700"
          fontFamily={theme.fonts.body}
          align="center"
          borderRadius="30px"
          borderColor={theme.colors.accentFive}
          bg={theme.colors.accentFive}
        >
          <Flex
            w="100%"
            flexDirection={["column", "row"]}
            alignItems="start"
            justifyContent="start"
          >
            <Text
              color={theme.colors.primary}
              letterSpacing={["1px", "3px"]}
              fontSize={["4rem", "5rem"]}
              fontWeight="700"
              fontFamily={theme.fonts.header}
              mr={["1rem", "2rem"]}
            >
              Welcome to
            </Text>{" "}
            <Flex>
              <Text
                color={theme.colors.primary}
                letterSpacing={["1px", "3px"]}
                fontSize={["4rem", "5rem"]}
                fontWeight="700"
                fontFamily={theme.fonts.header}
                mr={["1rem", "2rem"]}
              >
                It&apos;s
              </Text>
              <Text
                color={theme.colors.white}
                letterSpacing={["1px", "3px"]}
                fontSize={["4rem", "5rem"]}
                fontWeight="700"
                fontFamily={theme.fonts.header}
                mr={["0.25rem", "0.5rem"]}
              >
                BONK
              </Text>
              <Text
                color={theme.colors.primary}
                letterSpacing={["1px", "3px"]}
                fontSize={["4rem", "5rem"]}
                fontWeight="700"
                fontFamily={theme.fonts.header}
              >
                ers!!!
              </Text>
            </Flex>
          </Flex>

          <Text
            color={theme.colors.background}
            fontSize="2rem"
            fontWeight="700"
            fontFamily={theme.fonts.body}
          >
            A fully on chain game played over 2-4 days where players stake bonk
            to win sleighs, make deliveries and retire for a chance at the prize
            pool!
          </Text>
          <Flex flexDirection="column" justifyContent="start" align="start">
            <Text
              mt="5rem"
              color={theme.colors.primary}
              letterSpacing="3px"
              fontSize="2.5rem"
              fontWeight="700"
              fontFamily={theme.fonts.header}
            >
              INTRODUCTION
            </Text>
            <Text
              color={theme.colors.background}
              fontSize="2rem"
              fontWeight="700"
              fontFamily={theme.fonts.body}
            >
              It is the season of giving and there seems to be a crisis on the
              North Pole. With the holidays fast approaching Santa and his elves
              have crunched the numbers and they simply will not be able to
              handle presents this year! They need more help!
            </Text>
            <Text
              mt="5rem"
              color={theme.colors.background}
              fontSize="2rem"
              fontWeight="700"
              fontFamily={theme.fonts.body}
            >
              Luckily, the elves have said they can build sleighs for those
              wanting to help spread holiday cheer! But we will need to act
              quickly, as time is ticking.
            </Text>
          </Flex>
          <Flex
            flexDirection="row"
            justifyContent="start"
            align="start"
            mt="8rem"
            mb="1rem"
            w="100%"
            gap="5vw"
          >
            <Button
              borderWidth="2px"
              borderColor={theme.colors.primary}
              bg={theme.colors.primary}
              borderRadius="30px"
              fontWeight="700"
              fontSize="1.5rem"
              fontFamily={theme.fonts.body}
              w="100%"
              h="5rem"
              color={theme.colors.white}
              onClick={() => {
                window.open(
                  "https://spacemandev.notion.site/It-s-Bonkers-How-to-Play-6f70818c0b0c42039ca33f5985e25b64",
                  "_blank"
                );
              }}
              _hover={{
                color: theme.colors.background,
                borderColor: theme.colors.quaternary,
                bg: theme.colors.quaternary,
              }}
            >
              HOW TO PLAY?
            </Button>
            <Button
              borderWidth="2px"
              borderColor={theme.colors.primary}
              bg={theme.colors.primary}
              borderRadius="30px"
              fontWeight="700"
              fontSize="1.5rem"
              fontFamily={theme.fonts.body}
              w="100%"
              h="5rem"
              color={theme.colors.white}
              onClick={() =>
                window.open("https://twitter.com/itsbonkers_xyz", "_blank")
              }
              _hover={{
                color: theme.colors.background,
                borderColor: theme.colors.quaternary,
                bg: theme.colors.quaternary,
              }}
            >
              FOLLOW US ON TWITTER
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        fontFamily="Montserrat"
        p="1rem"
        minWidth="22rem"
        h="100vh"
        w="100vw"
        ref={signupRef}
      >
        <Flex
          direction="column"
          align="center"
          justifyContent="start"
          w={["60%", "80%"]}
          h={["60%", "80%"]}
          bgImage="url('/chat.svg')"
          backgroundSize="cover"
          backgroundRepeat="no-repeat"
          backgroundPosition="center"
        >
          <Flex
            mt="5rem"
            ml="3rem"
            direction="column"
            alignItems="start"
            justifyContent="start"
          >
            <Flex justifyContent="space-between" w="100%">
              <Flex w="100%" alignItems="start" justifyContent="start">
                <Text
                  color={theme.colors.white}
                  letterSpacing="3px"
                  fontSize="5rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.header}
                  mr="2rem"
                >
                  SEASON 1
                </Text>{" "}
                <Text
                  color={theme.colors.primary}
                  letterSpacing="3px"
                  fontSize="5rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.header}
                  mr="0.5rem"
                >
                  SIGNUP
                </Text>
              </Flex>
            </Flex>
            <Flex
              flexDirection="column"
              alignItems="start"
              justifyContent="start"
              mt="2rem"
              mb="4rem"
            >
              <Text
                color={theme.colors.background}
                fontSize="2rem"
                fontWeight="700"
                fontFamily={theme.fonts.body}
              >
                1. CONNECT YOUR WALLET
              </Text>
              <Button
                mt="2rem"
                borderWidth="2px"
                borderColor={theme.colors.primary}
                bg={theme.colors.primary}
                borderRadius="30px"
                fontWeight="700"
                fontSize="1.5rem"
                fontFamily={theme.fonts.body}
                w="30rem"
                h="5rem"
                color={theme.colors.white}
                onClick={() => {}}
                _hover={{
                  color: theme.colors.background,
                  borderColor: theme.colors.quaternary,
                  bg: theme.colors.quaternary,
                }}
              >
                CONNECT WALLET
              </Button>
            </Flex>
            <Flex
              w="100%"
              flexDirection="column"
              alignItems="start"
              justifyContent="start"
            >
              <Text
                color={theme.colors.background}
                fontSize="2rem"
                fontWeight="700"
                fontFamily={theme.fonts.body}
              >
                2. EMAIL ADDRESS FOR GAME NOTIFICATIONS
              </Text>
              <Flex>
                <Input
                  mt="2rem"
                  mr="2rem"
                  borderWidth="2px"
                  borderColor={theme.colors.background}
                  bg={theme.colors.background}
                  borderRadius="30px"
                  fontWeight="700"
                  fontSize="1.5rem"
                  fontFamily={theme.fonts.body}
                  w="40rem"
                  h="5rem"
                  p="2rem"
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                  color={theme.colors.white}
                  _placeholder={{ color: theme.colors.white }}
                />
                <Button
                  mt="2rem"
                  borderWidth="2px"
                  borderColor={theme.colors.primary}
                  bg={theme.colors.primary}
                  borderRadius="30px"
                  fontWeight="700"
                  fontSize="1.5rem"
                  fontFamily={theme.fonts.body}
                  w="25rem"
                  h="5rem"
                  color={theme.colors.white}
                  onClick={() => {}}
                  _hover={{
                    color: theme.colors.background,
                    borderColor: theme.colors.quaternary,
                    bg: theme.colors.quaternary,
                  }}
                >
                  VERIFY
                </Button>
              </Flex>
              <Flex w="100%" align="center">
                <Text
                  ml="1.25rem"
                  mt="1.25rem"
                  color={theme.colors.background}
                  fontSize="1.25rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                >
                  ~SIGNING UP WILL ALLOW YOU TO RECEIVE IT&apos;S BONKERS GAME
                  INFO VIA
                </Text>
                <Text
                  ml="0.75rem"
                  mt="1.25rem"
                  color={theme.colors.background}
                  onClick={() =>
                    window.open("https://reload.r3x.tech/", "_blank")
                  }
                  cursor="pointer"
                  fontSize="1.25rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                  textDecoration="underline"
                >
                  R3L04D
                </Text>{" "}
                <Text
                  ml="0.75rem"
                  mt="1.25rem"
                  color={theme.colors.background}
                  fontSize="1.25rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                >
                  TO YOUR EMAIL~
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default LoginPage;
