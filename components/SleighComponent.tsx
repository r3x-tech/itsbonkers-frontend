import theme from "@/styles/theme";
import { Sleigh } from "@/types/types";
import {
  Image,
  Flex,
  Text,
  Box,
  Button,
  Spinner,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { RetireSleighModal } from "./RetireSleighModal";
import { useState } from "react";
import toast from "react-hot-toast";
import useSolana from "@/hooks/useSolana";
import { useWallet } from "@solana/wallet-adapter-react";
import { randomBytes } from "crypto";
import { deliveryTx, retireSleighTx } from "@/utils/solana";

interface SleighProps {
  sleigh: Sleigh | null;
}

export function SleighComponent({ sleigh }: SleighProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [retireInProgress, setRetireInProgress] = useState<boolean>(false);
  const [startingDeliveryInProgress, setStartingDeliveryInProgress] =
    useState<boolean>(false);

  const { connection } = useSolana();
  const {
    wallet,
    publicKey,
    signTransaction,
    signAllTransactions,
    connecting,
    disconnecting,
  } = useWallet();

  const onRetireWarningClose = () => {
    setRetireInProgress(false);
    onClose();
  };

  const retireSleigh = async () => {
    setRetireInProgress(true);

    try {
      if (!signTransaction || !connection || !publicKey) {
        throw Error("Staking failed");
      }

      const sleighId = BigInt(`0x${randomBytes(8).toString("hex")}`);

      // Call createSleighTx function and wait for the transaction to be ready
      const tx = await retireSleighTx(sleighId, connection, publicKey);
      if (!tx) {
        throw Error("Failed to create tx");
      }
      // const signedTx = await signTransaction(tx);
      // await connection.sendTransaction(tx);
      // console.log("Signed tx: ", signedTx);

      // Simulate a request with a 10-second delay
      await new Promise((resolve) => setTimeout(resolve, 10000));

      toast.success("Staked");
    } catch (e) {
      console.error("Error during staking: ", e);
      toast.error("Failed to stake");
    } finally {
      setRetireInProgress(false);
      onClose();
    }
  };

  const startDelivery = async () => {
    setStartingDeliveryInProgress(true);

    try {
      if (!signTransaction || !connection || !publicKey) {
        throw Error("Staking failed");
      }
      const sleighId = BigInt(`0x${randomBytes(8).toString("hex")}`);

      // Call createSleighTx function and wait for the transaction to be ready
      const tx = await deliveryTx(sleighId, connection, publicKey);
      if (!tx) {
        throw Error("Failed to create tx");
      }
      // const signedTx = await signTransaction(tx);
      // await connection.sendTransaction(tx);
      // console.log("Signed tx: ", signedTx);

      // Simulate a request with a 10-second delay
      await new Promise((resolve) => setTimeout(resolve, 10000));
      toast.success("Staked");
    } catch (e) {
      console.error("Error during staking: ", e);
      toast.error("Failed to stake");
    } finally {
      setStartingDeliveryInProgress(false);
      onClose();
    }
  };
  return (
    <Flex
      direction="column"
      px="3rem"
      py="2rem"
      h="100%"
      w="80%"
      overflowY="auto"
    >
      {sleigh ? (
        <>
          <Flex
            h="15%"
            w="100%"
            justifyContent="space-between"
            align="space-between"
          >
            <Flex>
              <Text
                fontSize="1.25rem"
                fontWeight="400"
                fontFamily={theme.fonts.body}
                color={theme.colors.white}
                mr="1rem"
              >
                STAGE:{" "}
              </Text>
              <Text
                fontSize="1.25rem"
                fontWeight="700"
                fontFamily={theme.fonts.body}
                color={theme.colors.white}
              >
                BUILD
              </Text>
            </Flex>
            <Flex>
              <Text
                fontSize="1.25rem"
                fontWeight="400"
                fontFamily={theme.fonts.body}
                color={theme.colors.white}
                mr="1rem"
              >
                STAKED:{" "}
              </Text>
              <Text
                fontSize="1.25rem"
                fontWeight="700"
                fontFamily={theme.fonts.body}
                color={theme.colors.white}
              >
                {/* {sleigh.staked} BONK */}
                10M BONK
              </Text>
            </Flex>
            <Flex>
              <Text
                fontSize="1.25rem"
                fontWeight="400"
                fontFamily={theme.fonts.body}
                color={theme.colors.white}
                mr="1rem"
              >
                SPOILS:{" "}
              </Text>
              <Text
                fontSize="1.25rem"
                fontWeight="700"
                fontFamily={theme.fonts.body}
                color={theme.colors.white}
              >
                {/* {sleigh.spoils} BONK */}
                10M BONK
              </Text>
            </Flex>
            <Flex
              flexDirection="column"
              w="20rem"
              overflowY="auto"
              justifyContent="space-between"
              align="flex-end"
            >
              <Flex>
                <Text
                  fontSize="1.25rem"
                  fontWeight="400"
                  fontFamily={theme.fonts.body}
                  color={theme.colors.white}
                  mr="1rem"
                >
                  NEXT DELIVERY IN:{" "}
                </Text>
                <Text
                  fontSize="1.25rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                  color={theme.colors.white}
                >
                  {/* {sleigh.nextDelivery} */}
                  30 MIN
                </Text>
              </Flex>
              <Button
                borderWidth="2px"
                borderColor={theme.colors.primary}
                bg={theme.colors.primary}
                borderRadius="30px"
                fontWeight="700"
                fontSize="1.25rem"
                fontFamily={theme.fonts.body}
                w="20rem"
                mb="1rem"
                h="3.5rem"
                color={theme.colors.white}
                isDisabled={retireInProgress}
                isLoading={retireInProgress}
                spinner={
                  <Flex flexDirection="row" align="center">
                    <Spinner color={theme.colors.white} size="sm" />
                  </Flex>
                }
                onClick={startDelivery}
                _hover={{
                  color: theme.colors.white,
                  borderColor: theme.colors.accentThree,
                  bg: theme.colors.accentThree,
                }}
              >
                <Text mr="0.5rem">DELIVER </Text>
                <Tooltip
                  label="PENDING DELIVIES"
                  aria-label="PENDING DELIVIES"
                  bg={theme.colors.black}
                >
                  <Text>(3)</Text>
                </Tooltip>
              </Button>
            </Flex>
          </Flex>
          <Flex
            direction="column"
            w="100%"
            h="85%"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
          >
            <Flex
              direction="column"
              w="70%"
              justifyContent="center"
              alignItems="start"
            >
              <Flex>
                <Text
                  fontSize="1.25rem"
                  fontWeight="400"
                  fontFamily={theme.fonts.body}
                  color={theme.colors.white}
                  mr="1rem"
                >
                  LVL:{" "}
                </Text>
                <Text
                  fontSize="1.25rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                  color={theme.colors.white}
                >
                  {sleigh.level}
                </Text>
              </Flex>
              <Text
                fontSize="3rem"
                fontWeight="400"
                fontFamily={theme.fonts.header}
                color={theme.colors.white}
              >
                {sleigh.owner}
              </Text>
            </Flex>
            <Flex>
              <Image src="/sleigh.svg" alt="Sleigh Image" w="50rem" />
            </Flex>
            <Flex width="100%" justifyContent="space-between" align="flex-end">
              <Box
                ml="8vw"
                bg={theme.colors.background}
                w="20rem"
                borderRadius="0.75rem"
                borderWidth="2px"
                borderColor={theme.colors.background}
                boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                cursor="pointer"
                p="1rem"
              >
                <Flex justifyContent="space-between" w="100%">
                  <Text
                    fontSize="1.25rem"
                    fontWeight="700"
                    fontFamily={theme.fonts.body}
                    color={theme.colors.white}
                    mr="0.5rem"
                  >
                    LANDING GEAR
                  </Text>
                  <Text
                    fontSize="1rem"
                    fontWeight="700"
                    fontFamily={theme.fonts.body}
                    color={theme.colors.white}
                  >
                    {sleigh.level}
                  </Text>
                </Flex>
                <Flex justifyContent="center" alignContent="center" mt="2rem">
                  <Button
                    borderWidth="2px"
                    borderColor={theme.colors.primary}
                    bg={theme.colors.primary}
                    borderRadius="30px"
                    fontWeight="700"
                    fontSize="1rem"
                    fontFamily={theme.fonts.body}
                    w="100%"
                    h="3rem"
                    color={theme.colors.white}
                    isDisabled={sleigh == null}
                    isLoading={sleigh == null}
                    spinner={
                      <Flex flexDirection="row" align="center">
                        <Spinner color={theme.colors.white} size="sm" />
                      </Flex>
                    }
                    onClick={() => {}}
                    _hover={{
                      color: theme.colors.white,
                      borderColor: theme.colors.accentThree,
                      bg: theme.colors.accentThree,
                    }}
                  >
                    REPAIR
                  </Button>
                </Flex>
              </Box>
              <RetireSleighModal
                isRetireModalOpen={isOpen}
                onOpenRetireSleighModal={onOpen}
                onCloseRetireSleighModal={onRetireWarningClose}
                retireSleigh={retireSleigh}
                retireInProgress={retireInProgress}
                sleighName={sleigh.owner}
              />
            </Flex>
          </Flex>
        </>
      ) : (
        <Flex
          direction="column"
          w="100%"
          h="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontSize="2.5rem"
            fontWeight="400"
            fontFamily={theme.fonts.header}
            color={theme.colors.white}
            pb="5rem"
          >
            SHUCKS, SELECT A SLEIGH WILL YA!
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
