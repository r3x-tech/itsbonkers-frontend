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
import { FaCopy } from "react-icons/fa";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export const Navbar: React.FC = () => {
  const { loggedIn, loginType, solana_wallet_address } = userStore();
  const router = useRouter();
  const { pathname } = useRouter();
  const theme = useTheme();
  const { publicKey, disconnect } = useWallet();
  const [isLogoutInProgress, setLogoutInProgress] = useState(false);

  const getTextColor = (route: string) => {
    if (pathname.includes(route)) {
      return theme.colors.lighterBlue;
    }
    return theme.colors.evenLighterBlue;
  };

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
    return `${name.substring(0, 2)}...${name.substring(name.length - 4)}`;
  };

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      bg={theme.colors.background}
      color={theme.colors.white}
      h="8vh"
      borderBottomWidth="2px"
      // borderTopWidth="2px"
    >
      <Flex
        borderRightWidth="2px"
        w="17%"
        h="100%"
        justifyContent="center"
        align="center"
        p="1rem"
      >
        <Text
          fontSize="1.5rem"
          fontWeight="600"
          letterSpacing="4px"
          fontFamily={theme.fonts.header}
        >
          its BONKers
        </Text>
      </Flex>

      <Flex
        w="70%"
        h="100%"
        justifyContent="start"
        align="center"
        py="1rem"
        px="2rem"
        gap="3rem"
      >
        <Text
          cursor="pointer"
          fontSize="1rem"
          fontWeight="600"
          fontFamily={theme.fonts.header}
          color={getTextColor("/explore")}
          onClick={() => router.push("/explore")}
        >
          EXPLORE
        </Text>
        <Text
          cursor="pointer"
          fontSize="1rem"
          fontWeight="600"
          fontFamily={theme.fonts.header}
          color={getTextColor("/play")}
          onClick={() => router.push("/play")}
        >
          PLAY
        </Text>

        <Text
          cursor="pointer"
          fontSize="1rem"
          fontWeight="600"
          fontFamily={theme.fonts.header}
          color={getTextColor("/create")}
          onClick={() => router.push("/create")}
        >
          CREATE
        </Text>

        {/* <Text
          cursor="pointer"
          fontSize="1rem"
          fontWeight="600"
          fontFamily={theme.fonts.header}
          color={getTextColor("/network")}
          onClick={() => {}}

        >
          THE NETWORK
        </Text> */}
      </Flex>

      <Flex
        w="13%"
        h="100%"
        justifyContent="flex-end"
        align="center"
        pr="0.75rem"
      >
        {loggedIn ? (
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button
                bg={theme.colors.background}
                py="0.5rem"
                h="2rem"
                px="2rem"
                cursor="pointer"
                borderColor={theme.colors.ligherBlue}
                borderWidth="2px"
                borderRadius="2px"
                color={theme.colors.ligherBlue}
                fontSize="0.75rem"
                letterSpacing="1px"
                fontWeight="600"
                _hover={{
                  color: theme.colors.background,
                  borderColor: theme.colors.white,
                  bg: theme.colors.white,
                }}
              >
                {formatUsername(solana_wallet_address)}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              bg={theme.colors.background}
              color={theme.colors.white}
              borderColor={theme.colors.white}
              borderRadius="2px"
              borderWidth="2px"
              minW="10rem"
              w="15rem"
              outline="none"
              zIndex={100}
              boxShadow="1px 1px 20px black"
            >
              <VStack spacing={4} p="1rem">
                <Flex direction="column">
                  <Flex align="center" justifyContent="flex-start" pb="1.25rem">
                    <Box>
                      <Tooltip
                        label="Account"
                        aria-label="Account"
                        bg={theme.colors.black}
                      >
                        <Image
                          src="/profilePic.png"
                          alt="User Profile Pic"
                          boxSize="3rem"
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
                      <Text color={theme.colors.white}>
                        {formatUsername(solana_wallet_address)}
                      </Text>
                    </Tooltip>

                    <Tooltip
                      label="Copy"
                      aria-label="Copy"
                      bg={theme.colors.black}
                    >
                      <Flex color={theme.colors.white}>
                        <FaCopy
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
                    variant="outline"
                    borderWidth="2px"
                    borderColor={theme.colors.white}
                    bg={theme.colors.background}
                    borderRadius="2px"
                    fontWeight="600"
                    fontSize="0.75rem"
                    w="100%"
                    mb="0.5rem"
                    h="2.5rem"
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
                      color: theme.colors.background,
                      borderColor: theme.colors.white,
                      bg: theme.colors.white,
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
              bg={theme.colors.background}
              py="0.5rem"
              h="2rem"
              px="2rem"
              cursor="pointer"
              borderColor={theme.colors.ligherBlue}
              borderWidth="2px"
              borderRadius="2px"
              color={theme.colors.ligherBlue}
              fontSize="0.75rem"
              letterSpacing="1px"
              fontWeight="600"
              _hover={{
                color: theme.colors.background,
                borderColor: theme.colors.white,
                bg: theme.colors.white,
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
