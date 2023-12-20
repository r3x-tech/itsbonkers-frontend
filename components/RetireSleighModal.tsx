import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Text,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  NumberInput,
  NumberInputField,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import theme from "@/styles/theme";
import useSolana from "@/hooks/useSolana";
import { useWallet } from "@solana/wallet-adapter-react";
import { randomBytes } from "crypto";
import { retireSleighTx } from "@/utils";
import toast from "react-hot-toast";
import { Sleigh } from "@/types/types";

interface RetireSleighModallProps {
  retireInProgress: boolean;
  setRetireInProgress: (value: boolean) => void;
  currentSleigh: Sleigh;
  currentStage: string;
}

export const RetireSleighModal: React.FC<RetireSleighModallProps> = ({
  retireInProgress,
  setRetireInProgress,
  currentSleigh,
  currentStage,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connection } = useSolana();
  const {
    wallet,
    publicKey,
    signTransaction,
    signAllTransactions,
    connecting,
    disconnecting,
  } = useWallet();

  const retireSleigh = async () => {
    setRetireInProgress(true);

    try {
      if (!signTransaction || !connection || !publicKey || !currentSleigh) {
        throw Error("Staking failed");
      }

      const sleighId = BigInt(`0x${randomBytes(8).toString("hex")}`);

      const tx = await retireSleighTx(sleighId, connection, publicKey);
      if (!tx) {
        throw Error("Failed to create tx");
      }
      const signedTx = await signTransaction(tx);
      console.log("Signed tx: ", signedTx);

      await connection.sendRawTransaction(signedTx.serialize());

      // Simulate a request with a 10-second delay
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      toast.success("Retired sleigh");
      onClose();
    } catch (e) {
      console.error("Error during retire: ", e);
      toast.error("Failed to retire");
    } finally {
      setRetireInProgress(false);
    }
  };

  const onRetireWarningClose = () => {
    setRetireInProgress(false);
    onClose();
  };

  return (
    <Flex align="flex-end">
      <Button
        borderWidth="2px"
        borderColor={theme.colors.primary}
        bg={theme.colors.secondary}
        borderRadius="30px"
        fontWeight="700"
        fontSize="1.25rem"
        fontFamily={theme.fonts.body}
        w="25rem"
        h="3.5rem"
        color={theme.colors.white}
        isDisabled={retireInProgress || currentStage == "BUILD"}
        isLoading={retireInProgress}
        spinner={
          <Flex flexDirection="row" align="center">
            <Spinner color={theme.colors.white} size="sm" />
          </Flex>
        }
        onClick={onOpen}
        _hover={{
          color: theme.colors.white,
          borderColor: theme.colors.primary,
          bg: theme.colors.primary,
        }}
      >
        RETIRE SLEIGH
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          bg={theme.colors.secondary}
          minWidth="40rem"
          p="1rem"
          borderRadius="2rem"
        >
          <ModalHeader
            color={theme.colors.white}
            fontWeight="700"
            fontSize="2rem"
            fontFamily={theme.fonts.header}
          >
            RETIRE SLEIGH
          </ModalHeader>
          <ModalCloseButton
            m="2rem"
            fontSize="1.25rem"
            color={theme.colors.white}
          />
          <ModalBody
            my="2rem"
            w="100%"
            flexDirection="row"
            justifyContent="center"
            alignContent="center"
          >
            <Flex
              w="100%"
              flexDirection="row"
              justifyContent="center"
              alignItems="end"
            >
              <Text
                textAlign="start"
                color={theme.colors.white}
                fontWeight="700"
                fontSize="1.75rem"
              >
                SLEIGH NAME:
              </Text>
              <Text
                textAlign="start"
                ml="1rem"
                color={theme.colors.tertiary}
                fontWeight="700"
                fontSize="2rem"
              >
                {currentSleigh.sleighId}
              </Text>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex flexDirection="column" w="100%">
              <Button
                borderWidth="2px"
                borderColor={theme.colors.primary}
                bg={theme.colors.primary}
                borderRadius="30px"
                fontWeight="600"
                fontSize="1.25rem"
                fontFamily={theme.fonts.body}
                w="100%"
                my="1rem"
                h="3rem"
                color={theme.colors.white}
                isDisabled={retireInProgress}
                isLoading={retireInProgress}
                spinner={
                  <Flex flexDirection="row" align="center">
                    <Spinner color={theme.colors.white} size="sm" />
                  </Flex>
                }
                onClick={retireSleigh}
                _hover={{
                  color: theme.colors.white,
                  borderColor: theme.colors.accentThree,
                  bg: theme.colors.accentThree,
                }}
              >
                CONFIRM & RETIRE
              </Button>
              <Text fontWeight="bold" my="1rem" mx="1.5rem">
                <Box as="span" color={theme.colors.primary} fontSize="1.5rem">
                  WARNING!
                </Box>{" "}
                <Box as="span" color={theme.colors.white}>
                  YOU ARE ABOUT TO RETIRE SLEIGH
                </Box>{" "}
                <Box as="span" color={theme.colors.tertiary}>
                  {currentSleigh.sleighId}
                </Box>
                <Box as="span" color={theme.colors.white}>
                  . THIS ACTION IS IRREVERSIBLE & SHOULD YOU CHOOSE TO RETIRE
                  YOUR SLEIGH YOU WILL LOSE THE STAKED AMOUNT OF BONK. SHOULD
                  YOU RE-STAKE AFTER RETIRING YOUR SLEIGH YOU WILL RECEIVE 70%
                  OF YOUR ORIGINAL STAKE BACK.{" "}
                </Box>{" "}
              </Text>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
