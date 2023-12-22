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
import { BN } from "@coral-xyz/anchor";
import userStore from "@/stores/userStore";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_MINT_ADDRESS } from "@/constants";

interface RetireSleighModallProps {
  retireInProgress: boolean;
  setRetireInProgress: (value: boolean) => void;
  currentSleigh: Sleigh;
  currentStage: string;
  refetchCurrentSleighs: () => void;
}

export const RetireSleighModal: React.FC<RetireSleighModallProps> = ({
  retireInProgress,
  setRetireInProgress,
  currentSleigh,
  currentStage,
  refetchCurrentSleighs,
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
  const { globalGameId, TOKEN_MINT_ADDRESS } = userStore();

  const retireSleigh = async () => {
    setRetireInProgress(true);

    try {
      if (
        !signTransaction ||
        !connection ||
        !publicKey ||
        !currentSleigh ||
        !globalGameId ||
        !TOKEN_MINT_ADDRESS
      ) {
        throw Error("Staking failed");
      }
      const tx = await retireSleighTx(
        globalGameId,
        BigInt(currentSleigh.sleighId.toNumber()),
        connection,
        publicKey,
        new PublicKey(TOKEN_MINT_ADDRESS)
      );
      if (!tx) {
        throw Error("Failed to create tx");
      }
      const signedTx = await signTransaction(tx);
      console.log(
        "retireSleigh Signed tx: ",
        Buffer.from(signedTx!.serialize()).toString("base64")
      );

      await connection.sendRawTransaction(signedTx.serialize());

      toast.success("Retired sleigh");
      onRetireWarningClose();
    } catch (e) {
      console.error("Error during retire: ", e);
      toast.error("Failed to retire");
    }
  };

  const onRetireWarningClose = () => {
    refetchCurrentSleighs();
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
      <Modal isOpen={isOpen} onClose={onRetireWarningClose} isCentered>
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
                {currentSleigh.sleighId.toString()}
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
                  {currentSleigh.sleighId.toString()}
                </Box>
                <Box as="span" color={theme.colors.white}>
                  . THIS ACTION IS IRREVERSIBLE. SHOULD YOU CHOOSE TO RETIRE
                  YOUR SLEIGH YOU WILL YOU WILL RECEIVE YOUR STAKE AMOUNT MINUS
                  ANY FEES.{" "}
                </Box>{" "}
              </Text>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
