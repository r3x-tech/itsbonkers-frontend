import React, { useState } from "react";
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
import { useWallet } from "@solana/wallet-adapter-react";
import useSolana from "@/hooks/useSolana";
import { createSleighTx } from "@/utils";
import { randomBytes } from "crypto";
import toast from "react-hot-toast";

interface StakeSleighModalProps {
  minStakeAmount: number;
  maxStakeAmount: number;
  stakingInProgress: boolean;
  setStakingInProgress: (value: boolean) => void;
}

export const StakeSleighModal: React.FC<StakeSleighModalProps> = ({
  minStakeAmount,
  maxStakeAmount,
  stakingInProgress,
  setStakingInProgress,
}) => {
  const [stakeAmount, setStakeAmount] = useState(250);

  const { connection } = useSolana();
  const {
    wallet,
    publicKey,
    signTransaction,
    signAllTransactions,
    connecting,
    disconnecting,
  } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSliderChange = (value: any) => {
    setStakeAmount(value);
  };

  const handleInputChange = (valueAsString: string, valueAsNumber: number) => {
    setStakeAmount(valueAsNumber);
  };

  const stakeSleigh = async () => {
    setStakingInProgress(true);
    try {
      if (!signTransaction || !connection || !publicKey) {
        throw Error("Staking failed");
      }

      const sleighId = BigInt(`0x${randomBytes(8).toString("hex")}`);
      const stakeAmt = stakeAmount * 100000;

      // Call createSleighTx function and wait for the transaction to be ready
      const tx = await createSleighTx(
        sleighId,
        stakeAmt,
        connection,
        publicKey
      );
      if (!tx) {
        throw Error("Failed to create tx");
      }
      const signedTx = await signTransaction(tx);
      console.log(
        "stakeSleigh Signed tx: ",
        Buffer.from(signedTx!.serialize()).toString("base64")
      );

      await connection.sendRawTransaction(signedTx.serialize());

      toast.success("Staked sleigh");
      onClose();
    } catch (e) {
      console.error("Error during staking: ", e);
      toast.error("Failed to stake sleigh");
    } finally {
      setStakingInProgress(false);
    }
  };

  const onSleighWarningClose = () => {
    setStakingInProgress(false);
    onClose();
  };

  return (
    <>
      <Button
        borderWidth="2px"
        borderColor={theme.colors.tertiary}
        bg={theme.colors.tertiary}
        borderRadius="30px"
        fontWeight="600"
        fontSize="1.25rem"
        fontFamily={theme.fonts.body}
        w="100%"
        mb="1rem"
        h="3rem"
        color={theme.colors.background}
        isDisabled={stakingInProgress}
        isLoading={stakingInProgress}
        spinner={
          <Flex flexDirection="row" align="center">
            <Spinner color={theme.colors.white} size="sm" />
          </Flex>
        }
        onClick={onOpen}
        _hover={{
          color: theme.colors.background,
          borderColor: theme.colors.quaternary,
          bg: theme.colors.quaternary,
        }}
      >
        BID 4 SLEIGH +
      </Button>
      <Modal isOpen={isOpen} onClose={onSleighWarningClose} isCentered>
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
            BID 4 SLEIGH
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
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Text
                textAlign="start"
                w="100%"
                mb="1rem"
                color={theme.colors.white}
                fontWeight="700"
                fontSize="1.25rem"
              >
                AMOUNT TO BID:
              </Text>
              <Flex
                w="100%"
                justifyContent="space-between"
                alignItems="center"
                flexDirection="row"
              >
                <Slider
                  w="70%"
                  id="slider"
                  defaultValue={minStakeAmount}
                  min={minStakeAmount}
                  max={maxStakeAmount}
                  value={stakeAmount}
                  onChange={handleSliderChange}
                >
                  <SliderTrack
                    bg={theme.colors.background}
                    h="0.5rem"
                    borderRadius="5px"
                  >
                    <SliderFilledTrack
                      color={theme.colors.tertiary}
                      bg={theme.colors.tertiary}
                    />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color="tomato" />
                  </SliderThumb>
                </Slider>
                <NumberInput
                  ml="2rem"
                  defaultValue={minStakeAmount}
                  min={minStakeAmount}
                  max={maxStakeAmount}
                  value={stakeAmount}
                  onChange={handleInputChange}
                >
                  <NumberInputField
                    h="4rem"
                    pl="1.5rem"
                    color={theme.colors.tertiary}
                    borderColor={theme.colors.background}
                    borderWidth="2px"
                    borderRadius="30px"
                    bg={theme.colors.background}
                    fontSize="1.25rem"
                    fontWeight="700"
                  />
                </NumberInput>
                <Text
                  ml="1rem"
                  fontSize="1.25rem"
                  fontWeight="700"
                  color={theme.colors.white}
                >
                  BONK
                </Text>
              </Flex>
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
                isDisabled={stakingInProgress}
                isLoading={stakingInProgress}
                spinner={
                  <Flex flexDirection="row" align="center">
                    <Spinner color={theme.colors.white} size="sm" />
                  </Flex>
                }
                onClick={stakeSleigh}
                _hover={{
                  color: theme.colors.white,
                  borderColor: theme.colors.accentThree,
                  bg: theme.colors.accentThree,
                }}
              >
                CONFIRM & CONTINUE
              </Button>
              <Text fontWeight="bold" my="1rem" mx="1.5rem">
                <Box as="span" color={theme.colors.primary} fontSize="1.5rem">
                  WARNING!
                </Box>{" "}
                <Box as="span" color={theme.colors.white}>
                  YOU ARE ABOUT TO STAKE
                </Box>{" "}
                <Box as="span" color={theme.colors.tertiary}>
                  {stakeAmount} BONK{" "}
                </Box>
                <Box as="span" color={theme.colors.white}>
                  THIS ACTION IS IRREVERSIBLE & SHOULD YOU CHOOSE TO REMOVE YOUR
                  STAKE YOU WILL LOSE THE STAKED AMOUNT OF BONK. SHOULD YOU
                  RE-STAKE AFTER UN-STAKING YOU WILL RECEIVE 70% OF YOUR
                  ORIGINAL STAKE BACK.{" "}
                </Box>{" "}
              </Text>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
