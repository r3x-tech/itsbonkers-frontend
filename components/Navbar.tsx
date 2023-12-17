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
  const { loggedIn, loginType, solana_wallet_address, userProfilePic } =
    userStore();
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
    return `0x${name.substring(0, 1)}...${name.substring(name.length - 5)}`;
  };

  return (
    <Flex
      justifyContent="space-between"
      alignItems="end"
      bg={theme.colors.background}
      color={theme.colors.white}
      h="8vh"
      px="5rem"
    >
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
            bg={theme.colors.background}
            color={theme.colors.white}
            borderColor={theme.colors.white}
            borderRadius="1rem"
            borderWidth="2px"
            outline="none"
            zIndex={100}
            // boxShadow="4px 4px 10px black"
          >
            <VStack spacing={4} py="1.5rem" px="2rem">
              <Flex direction="column">
                <Flex
                  align="center"
                  justifyContent="flex-start"
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
                  borderRadius="30px"
                  fontWeight="600"
                  fontSize="1rem"
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
  );
};
