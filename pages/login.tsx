import {
  Button,
  Flex,
  Stack,
  Text,
  Spinner,
  Input,
  Heading,
  Image,
  Box,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import theme from "@/styles/theme";
import userStore from "@/stores/userStore";
import toast from "react-hot-toast";
import { WalletMultiButton } from "@/components/auth/WalletMultiButton";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import { Keypair, PublicKey } from "@solana/web3.js";
// import useSleighs from "@/hooks/useSleighs";
import useSolana from "@/hooks/useSolana";
// import {
//   LANDING_GEAR_MINT_ADDRESS,
//   NAVIGATION_MINT_ADDRESS,
//   PRESENTS_BAG_MINT_ADDRESS,
//   PROPULSION_MINT_ADDRESS,
// } from "@/constants";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { sendAllTxParallel } from "@/utils/solana";
import { IoIosArrowDown } from "react-icons/io";
import { useGameSettings } from "@/hooks/useGameSettings";
import { TOKEN_MINT_ADDRESS } from "@/constants";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const [ran, setRan] = useState(false);
  const [gameIdInput, setGameIdInput] = useState("");

  const handleGameIdInputChange = (event: any) => {
    setGameIdInput(event.target.value);
  };

  const { connection } = useSolana();
  const {
    wallet,
    publicKey,
    signTransaction,
    signAllTransactions,
    connecting,
    disconnecting,
  } = useWallet();
  const { data: gameSettings, refetch: refetchGameSettings } =
    useGameSettings(connection);

  const {
    loggedIn,
    globalGameId,
    setGlobalGameId,
    TOKEN_MINT_ADDRESS,
    LANDING_GEAR_MINT_ADDRESS,
    NAVIGATION_MINT_ADDRESS,
    PRESENTS_BAG_MINT_ADDRESS,
    PROPULSION_MINT_ADDRESS,
    setPropulsionMintAddress,
    setLandingGearMintAddress,
    setNavigationMintAddress,
    setPresentsBagMintAddress,
    setTokenMintAddress,
  } = userStore();
  const signupRef = useRef<HTMLDivElement>(null);
  const learnMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (
        connection &&
        publicKey &&
        !loggedIn &&
        wallet &&
        globalGameId &&
        !connecting &&
        !disconnecting
      ) {
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
      } else if (
        connection &&
        publicKey &&
        !loggedIn &&
        wallet &&
        !globalGameId &&
        !connecting &&
        !disconnecting
      ) {
        toast.error("Game ID not set");
      }
    };

    fetchData();
  }, [
    connecting,
    connection,
    disconnecting,
    globalGameId,
    loggedIn,
    publicKey,
    wallet,
  ]);

  useEffect(() => {
    if (!gameSettings) {
      refetchGameSettings();
    }
  }, [gameSettings, refetchGameSettings]);

  useEffect(() => {
    if (
      gameSettings &&
      gameSettings.coinMint.toString() !== TOKEN_MINT_ADDRESS
    ) {
      setTokenMintAddress(gameSettings.coinMint.toString());
    }
  }, [TOKEN_MINT_ADDRESS, gameSettings, setTokenMintAddress]);

  useEffect(() => {
    if (
      gameSettings &&
      (gameSettings.propulsionPartsMint !== PROPULSION_MINT_ADDRESS ||
        gameSettings.landingGearPartsMint !== LANDING_GEAR_MINT_ADDRESS ||
        gameSettings.navigationPartsMint !== NAVIGATION_MINT_ADDRESS ||
        gameSettings.presentsBagPartsMint !== PRESENTS_BAG_MINT_ADDRESS)
    ) {
      setPropulsionMintAddress(gameSettings.propulsionPartsMint);
      setLandingGearMintAddress(gameSettings.landingGearPartsMint);
      setNavigationMintAddress(gameSettings.navigationPartsMint);
      setPresentsBagMintAddress(gameSettings.presentsBagPartsMint);
    }
  }, [
    gameSettings,
    PROPULSION_MINT_ADDRESS,
    LANDING_GEAR_MINT_ADDRESS,
    NAVIGATION_MINT_ADDRESS,
    PRESENTS_BAG_MINT_ADDRESS,
    setPropulsionMintAddress,
    setLandingGearMintAddress,
    setNavigationMintAddress,
    setPresentsBagMintAddress,
  ]);

  useEffect(() => {
    const fetchandCreateAtas = async (currentPublicKey: PublicKey) => {
      if (
        !PROPULSION_MINT_ADDRESS ||
        !LANDING_GEAR_MINT_ADDRESS! ||
        !NAVIGATION_MINT_ADDRESS! ||
        !PRESENTS_BAG_MINT_ADDRESS
      ) {
        toast.error("Parts not found");
        return;
      }
      console.log(
        "PROPULSION_MINT_ADDRESS: ",
        PROPULSION_MINT_ADDRESS,
        "LANDING_GEAR_MINT_ADDRESS: ",
        LANDING_GEAR_MINT_ADDRESS,
        "NAVIGATION_MINT_ADDRESS: ",
        NAVIGATION_MINT_ADDRESS,
        "PRESENTS_BAG_MINT_ADDRESS: ",
        PRESENTS_BAG_MINT_ADDRESS,
        "globalGameId: ",
        globalGameId
      );

      const propulsionMintAddress = new PublicKey(PROPULSION_MINT_ADDRESS!);
      const landingGearMintAddress = new PublicKey(LANDING_GEAR_MINT_ADDRESS!);
      const navigationMintAddress = new PublicKey(NAVIGATION_MINT_ADDRESS!);
      const presentsBagMintAddress = new PublicKey(PRESENTS_BAG_MINT_ADDRESS!);

      let ixs = [];
      console.log("pk: ", currentPublicKey.toString());

      //propulsion ata
      const sleighPropulsionPartsAta = getAssociatedTokenAddressSync(
        propulsionMintAddress,
        currentPublicKey
      );
      const sleighPropulsionPartsAtaBalance = await connection.getBalance(
        sleighPropulsionPartsAta
      );
      console.log(
        "sleighPropulsionPartsAta: ",
        sleighPropulsionPartsAta.toString()
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

      //landing gear ata
      const sleighLandingGearPartsAta = getAssociatedTokenAddressSync(
        landingGearMintAddress,
        currentPublicKey
      );
      const sleighLandingGearPartsAtaBalance = await connection.getBalance(
        sleighLandingGearPartsAta
      );

      console.log(
        "sleighLandingGearPartsAta: ",
        sleighLandingGearPartsAta.toString()
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

      //navigation ata
      const sleighNavigationPartsAta = getAssociatedTokenAddressSync(
        navigationMintAddress,
        currentPublicKey
      );
      const sleighNavigationPartsAtaBalance = await connection.getBalance(
        sleighNavigationPartsAta
      );

      console.log(
        "sleighNavigationPartsAta: ",
        sleighNavigationPartsAta.toString()
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

      //presents bag ata
      const sleighPresentsBagPartsAta = getAssociatedTokenAddressSync(
        presentsBagMintAddress,
        currentPublicKey
      );
      const sleighPresentsBagPartsAtaBalance = await connection.getBalance(
        sleighPresentsBagPartsAta
      );

      console.log(
        "sleighPresentsBagPartsAta: ",
        sleighPresentsBagPartsAta.toString()
      );
      if (sleighPresentsBagPartsAtaBalance == 0) {
        const ix = createAssociatedTokenAccountInstruction(
          currentPublicKey,
          sleighPresentsBagPartsAta,
          currentPublicKey,
          presentsBagMintAddress
        );
        ixs.push(ix);
      }

      if (ixs.length > 0) {
        console.log("ixs: ", ixs, "length: ", length);

        await sendAllTxParallel(
          connection,
          ixs,
          currentPublicKey,
          signAllTransactions
        ).catch(() => {
          toast.error("Failed to create ata");
        });
      }
      setRan(true);
      setLoginInProgress(false);
      router.push("/home");
    };

    if (
      loggedIn &&
      connection &&
      publicKey != null &&
      !isLoginInProgress &&
      !ran &&
      globalGameId &&
      PROPULSION_MINT_ADDRESS &&
      LANDING_GEAR_MINT_ADDRESS &&
      NAVIGATION_MINT_ADDRESS &&
      PRESENTS_BAG_MINT_ADDRESS
    ) {
      fetchandCreateAtas(publicKey);
    }
  }, [
    LANDING_GEAR_MINT_ADDRESS,
    NAVIGATION_MINT_ADDRESS,
    PRESENTS_BAG_MINT_ADDRESS,
    PROPULSION_MINT_ADDRESS,
    connection,
    globalGameId,
    isLoginInProgress,
    loggedIn,
    publicKey,
    ran,
    router,
    signAllTransactions,
  ]);

  const calculateTimeLeft = useCallback(() => {
    const targetDate = new Date("2023-12-26 12:00:00");

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
      // backgroundPosition="center"
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
          px={["1.5rem", "3rem"]}
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
            fontSize={["2.25rem", "2.5rem"]}
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
            <Text
              fontSize="2.25rem"
              fontWeight="700"
              color={theme.colors.white}
            >
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
            <Text
              fontSize="2.25rem"
              fontWeight="700"
              color={theme.colors.white}
            >
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
              fontSize="2.25rem"
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
          {/* <Flex
            w="30vw"
            flexDirection="column"
            alignItems="start"
            justifyContent="start"
            mt="-2rem"
            mb="3rem"
          >
            <Flex w={["100%", "100%"]}>
              <Input
                value={gameIdInput}
                onChange={handleGameIdInputChange}
                mr="2rem"
                borderWidth="2px"
                borderColor={theme.colors.secondary}
                bg={theme.colors.secondary}
                borderRadius="30px"
                fontWeight="700"
                fontSize={["1.25rem", "1.5rem"]}
                fontFamily={theme.fonts.body}
                h={["2rem", "4rem"]}
                py={["1.5rem", "2rem"]}
                px={["2rem", "2.5rem"]}
                placeholder="ENTER A GAME ID"
                color={theme.colors.white}
                _placeholder={{ color: theme.colors.darkerGray }}
              />
              <Button
                borderWidth="2px"
                borderColor={theme.colors.primary}
                bg={theme.colors.primary}
                borderRadius="30px"
                fontWeight="700"
                fontSize="1.5rem"
                fontFamily={theme.fonts.body}
                w="20rem"
                h={["2rem", "4rem"]}
                py={["1.5rem", "2rem"]}
                color={theme.colors.white}
                onClick={() => {
                  setGlobalGameId(parseInt(gameIdInput));
                  console.log("GAME ID is: ", gameIdInput);
                  toast.success("Game id set");
                }}
                _hover={{
                  color: theme.colors.background,
                  borderColor: theme.colors.quaternary,
                  bg: theme.colors.quaternary,
                }}
              >
                SET
              </Button>
            </Flex>
          </Flex> */}
          <Flex justifyContent="center">
            <Image
              src="/bonkerslargelogo.png"
              alt="User Profile Pic"
              w={["60vw", "40vw"]}
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
                  mt="1.5rem"
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
                  RECEIVE GAME NOTIFICATIONS
                </Button>
              </Stack>
            ) : (
              <Flex
                w="100%"
                flexDirection="column"
                align="center"
                justifyContent="center"
                color={theme.colors.background}
                mt="3rem"
                mb="2rem"
              >
                <Spinner size="lg" />
                <Text
                  mt={3}
                  fontSize="2rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                >
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
            flexDirection={["column", "row"]}
            justifyContent="start"
            align="start"
            mt="8rem"
            mb="1rem"
            w="100%"
            gap="5vw"
          >
            {/* <Text
              mt="5rem"
              color={theme.colors.primary}
              letterSpacing="3px"
              fontSize="2.5rem"
              fontWeight="700"
              fontFamily={theme.fonts.header}
            >
              WANT TO LEARN MORE?
            </Text> */}
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
        mt="5rem"
        h="100vh"
        w="100vw"
        ref={signupRef}
      >
        <Flex
          direction="column"
          align="center"
          justifyContent="center"
          // ml="10rem"
          mt={["20rem", "0rem"]}
          w={["100%", "100%"]}
          h={["30%", "100%"]}
        >
          <Flex
            w={["100%", "100%"]}
            h={["200%", "90%"]}
            direction="column"
            align="center"
            justifyContent={["center", "start"]}
            bgImage="url('/chat4.svg')"
            backgroundSize={["200% 200%", "100% 100%"]}
            backgroundRepeat="no-repeat"
            backgroundPosition="center"
          >
            <Flex
              py={["0rem", "3rem"]}
              my={["0rem", "5rem"]}
              direction="column"
              alignItems={["center", " center"]}
              justifyContent={["center", "center"]}
              // bg="green"
              w={["80%", "60%"]}
            >
              <Flex
                justifyContent="space-between"
                alignItems="start"
                w="100%"
                flexDirection={["column", "row"]}
              >
                <Text
                  color={theme.colors.primary}
                  letterSpacing={["1px", "3px"]}
                  fontSize={["2rem", "4rem"]}
                  fontWeight="700"
                  fontFamily={theme.fonts.header}
                >
                  SIGNUP FOR GAME NOTIFICATIONS
                </Text>
              </Flex>
              <Flex
                flexDirection="column"
                alignItems="start"
                justifyContent="start"
                mt="1.5rem"
                mb="2.5rem"
                w={["100%", "100%"]}
              >
                <Text
                  color={theme.colors.background}
                  fontSize={["1.25rem", "1.75rem"]}
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                >
                  1. WHAT SOLANA WALLET ADDRESS ARE YOU PLAYING WITH?
                </Text>
                <Flex w={["100%", "100%"]}>
                  <Input
                    mt="1rem"
                    borderWidth="2px"
                    borderColor={theme.colors.background}
                    bg={theme.colors.background}
                    borderRadius="30px"
                    fontWeight="700"
                    fontSize={["1.25rem", "1.5rem"]}
                    fontFamily={theme.fonts.body}
                    h={["2rem", "5rem"]}
                    py={["1.5rem", "2rem"]}
                    px={["2rem", "2.5rem"]}
                    placeholder="ENTER YOUR SOLANA WALLET ADDRESS"
                    color={theme.colors.white}
                    _placeholder={{ color: theme.colors.darkerGray }}
                  />
                </Flex>

                {/* <Button
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
                </Button> */}
              </Flex>
              <Flex
                w="100%"
                flexDirection="column"
                alignItems="start"
                justifyContent="start"
              >
                <Text
                  color={theme.colors.background}
                  fontSize={["1.25rem", "1.75rem"]}
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                >
                  2. EMAIL ADDRESS FOR RECEIVING GAME NOTIFICATIONS
                </Text>
                <Flex w={["100%", "100%"]}>
                  <Input
                    mt="1rem"
                    // mr="2rem"
                    borderWidth="2px"
                    borderColor={theme.colors.background}
                    bg={theme.colors.background}
                    borderRadius="30px"
                    fontWeight="700"
                    fontSize={["1.25rem", "1.5rem"]}
                    fontFamily={theme.fonts.body}
                    h={["2rem", "5rem"]}
                    py={["1.5rem", "2rem"]}
                    px={["2rem", "2.5rem"]}
                    placeholder="ENTER YOUR EMAIL ADDRESS"
                    color={theme.colors.white}
                    _placeholder={{ color: theme.colors.darkerGray }}
                  />
                  {/* <Button
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
                  </Button> */}
                </Flex>
              </Flex>
              <Flex
                w="100%"
                flexDirection="column"
                align="end"
                justifyContent="start"
              >
                <Button
                  mt={["1.5rem", "3.5rem"]}
                  borderWidth="2px"
                  borderColor={theme.colors.primary}
                  bg={theme.colors.primary}
                  borderRadius="30px"
                  fontWeight="700"
                  fontSize={["1.25rem", "1.5rem"]}
                  fontFamily={theme.fonts.body}
                  h={["2rem", "5rem"]}
                  py={["1.5rem", "2rem"]}
                  px={["2rem", "2.5rem"]}
                  w="100%"
                  color={theme.colors.white}
                  onClick={() => {}}
                  _hover={{
                    color: theme.colors.background,
                    borderColor: theme.colors.quaternary,
                    bg: theme.colors.quaternary,
                  }}
                >
                  SIGNUP
                </Button>
                <Box w="100%" textAlign="center" mt="2rem">
                  <Text
                    as="span"
                    ml="0.75rem"
                    mt="1rem"
                    color={theme.colors.background}
                    py={["1.5rem", "2rem"]}
                    fontSize={["1rem", "1.1rem"]}
                    fontWeight="700"
                    fontFamily={theme.fonts.body}
                  >
                    ~SIGNING UP WILL ALLOW YOU TO RECEIVE GAME INFO VIA
                  </Text>
                  <Text
                    as="span"
                    ml="0.75rem"
                    mt="1rem"
                    color={theme.colors.background}
                    onClick={() =>
                      window.open("https://reload.r3x.tech/", "_blank")
                    }
                    cursor="pointer"
                    fontSize={["1rem", "1.1rem"]}
                    fontWeight="700"
                    fontFamily={theme.fonts.body}
                    textDecoration="underline"
                  >
                    R3L04D
                  </Text>{" "}
                  <Text
                    as="span"
                    ml="0.75rem"
                    mt="1rem"
                    color={theme.colors.background}
                    fontSize={["1rem", "1.1rem"]}
                    fontWeight="700"
                    fontFamily={theme.fonts.body}
                  >
                    DIRECTLY TO YOUR EMAIL~
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default LoginPage;
