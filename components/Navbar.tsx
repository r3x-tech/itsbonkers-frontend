import {
  Flex,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
  Button,
  useTheme,
  Image,
  Box,
  Tooltip,
  Heading,
  Spinner,
} from "@chakra-ui/react";
// import { useConnection } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
// import { useEffect } from "react";
import userStore from "@/stores/userStore";
import toast from "react-hot-toast";
// import { useState } from "react";
import { FaCopy, FaBell } from "react-icons/fa";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useCurrentGameRolls } from "@/hooks/useCurrentGameRolls";
import useSolana from "@/hooks/useSolana";
import { useCurrentSlot } from "@/hooks/useCurrentSlot";
import { NUMBER_FORMATTER } from "@/constants";
import { useGameSettings } from "@/hooks/useGameSettings";
import { BN } from "@coral-xyz/anchor";

export const Navbar: React.FC = () => {
  const { loggedIn, loginType, solana_wallet_address, userProfilePic } =
    userStore();
  const router = useRouter();
  const { pathname } = useRouter();
  const theme = useTheme();
  const { publicKey, disconnect } = useWallet();
  const [isLogoutInProgress, setLogoutInProgress] = useState(false);
  const { connection } = useSolana();
  const { data: currentSlot, refetch: refetchCurrentSlot } = useCurrentSlot();
  const { data: gameSettings, refetch: refetchGameSettings } =
    useGameSettings(connection);

  const {
    data: currentGameRolls,
    isLoading: isLoadingCurrentGameRolls,
    refetch: refetchCurrentGameRolls,
  } = useCurrentGameRolls(connection);

  useEffect(() => {
    refetchCurrentGameRolls();
    const interval = setInterval(() => {
      console.log("Refetching game rolls!");
      refetchCurrentGameRolls();
      refetchGameSettings();
    }, ((gameSettings?.rollInterval.toNumber() || 200) / 2) * 2000);
    return () => clearInterval(interval);
  }, [
    currentGameRolls,
    gameSettings,
    refetchCurrentGameRolls,
    refetchGameSettings,
  ]);

  const { globalGameId, setGlobalGameId } = userStore();

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(solana_wallet_address);
      toast.success("Copied Address");
    } catch (err) {
      console.error("Failed to copy address: ", err);
      toast.error("Failed to copy address");
    }
  };

  const formatUsername = (name: string) => {
    if (name.length <= 6 || name == "") {
      return name;
    }
    return `${name.substring(0, 4)}...${name.substring(name.length - 5)}`;
  };

  return (
    <Flex
      justifyContent="space-between"
      alignItems="end"
      bg={theme.colors.background}
      color={theme.colors.white}
      w="100%"
      h="8vh"
      px="5rem"
    >
      <Flex w="10%">
        <Image
          src="/bonkerslogo.png"
          alt="User Profile Pic"
          h="4rem"
          w="10rem"
          cursor="pointer"
          onClick={() => {
            // router.push("/account");
          }}
        />
      </Flex>
      <Flex w="90%" gap="3rem" justifyContent="center">
        <Flex>
          <Text
            fontSize="1.25rem"
            fontWeight="400"
            fontFamily={theme.fonts.body}
            color={theme.colors.white}
            mr="1rem"
          >
            Game Id:{" "}
          </Text>
          <Flex>
            <Text
              fontSize="1.25rem"
              fontWeight="700"
              fontFamily={theme.fonts.body}
              color={theme.colors.white}
            >
              {/* {GAME_ID || 0} */}
              {loggedIn ? globalGameId : "N/A"}
            </Text>
          </Flex>
        </Flex>

        <Flex>
          <Text
            fontSize="1.25rem"
            fontWeight="400"
            fontFamily={theme.fonts.body}
            color={theme.colors.white}
            mr="1rem"
          >
            Current Game Rolls:{" "}
          </Text>

          <Flex>
            <Text
              fontSize="1.25rem"
              fontWeight="700"
              fontFamily={theme.fonts.body}
              color={theme.colors.white}
            >
              {loggedIn ? currentGameRolls?.rolls.length : "N/A"}
            </Text>
          </Flex>
        </Flex>
        <Flex>
          <Text
            fontSize="1.25rem"
            fontWeight="400"
            fontFamily={theme.fonts.body}
            color={theme.colors.white}
            mr="1rem"
          >
            Prize Pool:{" "}
          </Text>
          <Flex>
            <Text
              fontSize="1.25rem"
              fontWeight="700"
              fontFamily={theme.fonts.body}
              color={theme.colors.white}
              mr="0.5rem"
            >
              {loggedIn
                ? NUMBER_FORMATTER.format(
                    Number(gameSettings?.prizePool) / 1_00000
                  )
                : "N/A"}{" "}
              BONK
            </Text>
          </Flex>
        </Flex>
        <Flex>
          <Text
            fontSize="1.25rem"
            fontWeight="400"
            fontFamily={theme.fonts.body}
            color={theme.colors.white}
            mr="1rem"
          >
            Average Stake:{" "}
          </Text>
          <Flex>
            <Text
              fontSize="1.25rem"
              fontWeight="700"
              fontFamily={theme.fonts.body}
              color={theme.colors.white}
              mr="0.5rem"
            >
              {/* {loggedIn &&
              gameSettings &&
              gameSettings.totalStake &&
              gameSettings.sleighsStaked
                ? NUMBER_FORMATTER.format(
                    Number(
                      gameSettings.totalStake
                        .div(gameSettings.sleighsStaked)
                        .div(new BN(1_00000))
                    )
                  )
                : "N/A"}{" "} */}
              {loggedIn &&
              gameSettings &&
              gameSettings.totalStake &&
              gameSettings.sleighsStaked &&
              !gameSettings.totalStake.isZero &&
              !gameSettings.sleighsStaked.isZero
                ? NUMBER_FORMATTER.format(
                    Number(
                      gameSettings.totalStake
                        .div(gameSettings.sleighsStaked)
                        .div(new BN(1_00000))
                    )
                  )
                : loggedIn &&
                  gameSettings &&
                  gameSettings.totalStake &&
                  gameSettings.sleighsStaked
                ? 0
                : "N/A"}{" "}
              BONK
            </Text>
          </Flex>
        </Flex>
        <Flex>
          <Text
            fontSize="1.25rem"
            fontWeight="400"
            fontFamily={theme.fonts.body}
            color={theme.colors.white}
            mr="1rem"
          >
            Sleighs Staked:{" "}
          </Text>
          <Flex>
            <Text
              fontSize="1.25rem"
              fontWeight="700"
              fontFamily={theme.fonts.body}
              color={theme.colors.white}
              mr="0.5rem"
            >
              {gameSettings && loggedIn
                ? Number(gameSettings?.sleighsStaked)
                : "N/A"}{" "}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex>
        {loggedIn ? (
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button
                bg={theme.colors.primary}
                py="1.5rem"
                h="2rem"
                px="4rem"
                cursor="pointer"
                borderColor={theme.colors.primary}
                borderWidth="2px"
                borderRadius="3rem"
                color={theme.colors.white}
                fontSize="1.25rem"
                letterSpacing="1px"
                fontWeight="600"
                _hover={{
                  color: theme.colors.white,
                  borderColor: theme.colors.accentThree,
                  bg: theme.colors.accentThree,
                }}
              >
                {formatUsername(solana_wallet_address)}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              bg={theme.colors.secondary}
              color={theme.colors.white}
              borderColor={theme.colors.tertiary}
              borderRadius="2rem"
              borderWidth="2px"
              outline="none"
              w={["20rem", "25rem"]}
              zIndex={100}
              boxShadow="10px 10px 50px rgba(0, 0, 0, 1)"
            >
              <VStack spacing={4} py="1.5rem" px="2rem" w="100%">
                <Flex direction="column" w="100%">
                  <Flex
                    align="center"
                    justifyContent="space-between"
                    pb="1.25rem"
                    w="100%"
                  >
                    <Box>
                      <Tooltip
                        label="Account"
                        aria-label="Account"
                        bg={theme.colors.black}
                      >
                        <Image
                          src={userProfilePic}
                          alt="User Profile Pic"
                          boxSize="5rem"
                          ml="-0.25rem"
                          mr="1rem"
                          cursor="pointer"
                          onClick={() => {
                            // router.push("/account");
                          }}
                        />
                      </Tooltip>
                    </Box>
                    <Tooltip
                      label="Address"
                      aria-label="Address"
                      bg={theme.colors.black}
                    >
                      <Text color={theme.colors.white} fontSize="1.25rem">
                        {formatUsername(solana_wallet_address)}
                      </Text>
                    </Tooltip>

                    <Tooltip
                      label="Copy"
                      aria-label="Copy"
                      bg={theme.colors.black}
                    >
                      <Flex color={theme.colors.tertiary}>
                        <FaCopy
                          size="1.5rem"
                          style={{
                            marginLeft: "10px",
                            cursor: "pointer",
                            color: theme,
                          }}
                          onClick={handleCopyClick}
                        />
                      </Flex>
                    </Tooltip>
                  </Flex>
                  <Button
                    borderWidth="2px"
                    borderColor={theme.colors.tertiary}
                    bg={theme.colors.tertiary}
                    borderRadius="30px"
                    fontWeight="700"
                    fontSize="1.25rem"
                    fontFamily={theme.fonts.body}
                    w="100%"
                    h="3.5rem"
                    my="0.75rem"
                    color={theme.colors.background}
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
                    ABOUT
                  </Button>
                  <Button
                    borderWidth="2px"
                    borderColor={theme.colors.tertiary}
                    bg={theme.colors.tertiary}
                    borderRadius="30px"
                    fontWeight="700"
                    fontSize="1.25rem"
                    fontFamily={theme.fonts.body}
                    w="100%"
                    h="3.5rem"
                    my="1rem"
                    color={theme.colors.background}
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
                    variant="outline"
                    borderWidth="2px"
                    color={theme.colors.white}
                    borderColor={theme.colors.primary}
                    bg={theme.colors.secondary}
                    borderRadius="30px"
                    fontWeight="700"
                    fontSize="1.25rem"
                    w="100%"
                    h="3.5rem"
                    my="1rem"
                    isDisabled={isLogoutInProgress}
                    isLoading={isLogoutInProgress}
                    spinner={
                      <Flex flexDirection="row" align="center">
                        <Spinner color={theme.colors.white} size="sm" />
                      </Flex>
                    }
                    onClick={async () => {
                      setLogoutInProgress(true);
                      try {
                        if (loggedIn && loginType == "SOLANA" && publicKey) {
                          await disconnect();
                          new Promise((resolve) => setTimeout(resolve, 1500));
                        }
                        userStore.setState({
                          loggedIn: false,
                          loginType: "",
                          username: "",
                          solana_wallet_address: "",
                        });
                        router.push("/");
                        toast.success("Logged out");
                      } catch (e) {
                        toast.error("Failed to logout");
                      }
                      setLogoutInProgress(false);
                    }}
                    _hover={{
                      color: theme.colors.white,
                      borderColor: theme.colors.primary,
                      bg: theme.colors.primary,
                    }}
                  >
                    LOGOUT
                  </Button>
                </Flex>
              </VStack>
            </PopoverContent>
          </Popover>
        ) : (
          <>
            <Button
              onClick={() => router.push("/login")}
              bg={theme.colors.primary}
              w="20rem"
              py="1.5rem"
              h="2rem"
              px="3rem"
              cursor="pointer"
              borderColor={theme.colors.primary}
              borderWidth="2px"
              borderRadius="30px"
              color={theme.colors.white}
              fontSize="1.25rem"
              letterSpacing="1px"
              fontWeight="700"
              _hover={{
                color: theme.colors.white,
                borderColor: theme.colors.accentThree,
                bg: theme.colors.accentThree,
              }}
            >
              LOGIN
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
};
