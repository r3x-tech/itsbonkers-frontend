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
import { GameSettings, Sleigh } from "@/types/types";
import { useWallet } from "@solana/wallet-adapter-react";
import useSolana from "@/hooks/useSolana";
import toast from "react-hot-toast";
import { repairSleighTx } from "@/utils";

interface RepairSleighModalProps {
  repairSleighInProgress: boolean;
  setRepairSleighInProgress: (value: boolean) => void;
  currentStage: string;
  currentSleigh: Sleigh;
  partToRepair: string;
  hp: number;
}

export const RepairSleighModal: React.FC<RepairSleighModalProps> = ({
  repairSleighInProgress,
  setRepairSleighInProgress,
  currentStage,
  currentSleigh,
  partToRepair,
  hp,
}) => {
  const [repairAmount, setRepairAmount] = useState(0);
  const [minRepairAmount, setMinRepairAmount] = useState(0);
  const maxR = 255 - hp;
  const [maxRepairAmount, setMaxRepairAmount] = useState(maxR);

  const handleRepairSliderChange = (value: any) => {
    setRepairAmount(value);
  };

  const handleRepairInputChange = (
    valueAsString: string,
    valueAsNumber: number
  ) => {
    setRepairAmount(valueAsNumber);
  };

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

  const repairSleigh = async (
    propulsion: number,
    landingGear: number,
    navigation: number,
    presentsBag: number
  ) => {
    setRepairSleighInProgress(true);

    try {
      if (!signTransaction || !connection || !publicKey || !currentSleigh) {
        throw Error("Repair sleigh failed");
      }

      const tx = await repairSleighTx(
        BigInt(currentSleigh.sleighId),
        {
          propulsion,
          landingGear,
          navigation,
          presentsBag,
        },
        connection,
        publicKey
      );
      if (!tx) {
        throw Error("Failed to create tx");
      }
      const signedTx = await signTransaction(tx);
      await connection.sendTransaction(tx);
      console.log("Signed tx: ", signedTx);

      // Simulate a request with a 10-second delay
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      toast.success("Sleigh repaired");
      onClose();
    } catch (e) {
      console.error("Error during staking: ", e);
      toast.error("Failed to repair");
    } finally {
      setRepairSleighInProgress(false);
    }
  };

  return (
    <>
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
        isDisabled={
          currentSleigh.broken ||
          hp == 255 ||
          repairSleighInProgress ||
          currentStage == "BUILD"
        }
        isLoading={repairSleighInProgress}
        spinner={
          <Flex flexDirection="row" align="center">
            <Spinner color={theme.colors.white} size="sm" />
          </Flex>
        }
        onClick={onOpen}
        _hover={{
          color: theme.colors.white,
          borderColor: theme.colors.accentThree,
          bg: theme.colors.accentThree,
        }}
      >
        REPAIR
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
            REPAIR SLEIGH {partToRepair}
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
              <Flex justifyContent="start" alignItems="center" w="100%">
                <Text fontWeight="bold" mb="3rem">
                  <Box
                    as="span"
                    color={theme.colors.white}
                    fontWeight="700"
                    fontSize="1.25rem"
                  >
                    CURRENT {partToRepair} HP:
                  </Box>{" "}
                  <Box
                    as="span"
                    color={
                      hp < 60
                        ? theme.colors.primary
                        : hp < 120
                        ? theme.colors.quaternary
                        : hp < 200
                        ? theme.colors.tertiary
                        : theme.green[700]
                    }
                    fontWeight="700"
                    fontSize="1.5rem"
                  >
                    {hp} HP
                  </Box>
                </Text>
              </Flex>

              <Text
                textAlign="start"
                w="100%"
                mb="1rem"
                color={theme.colors.white}
                fontWeight="700"
                fontSize="1.25rem"
              >
                AMOUNT TO REPAIR:
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
                  defaultValue={minRepairAmount}
                  min={minRepairAmount}
                  max={maxRepairAmount}
                  value={repairAmount}
                  onChange={handleRepairSliderChange}
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
                  defaultValue={minRepairAmount}
                  min={minRepairAmount}
                  max={maxRepairAmount}
                  value={repairAmount}
                  onChange={handleRepairInputChange}
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
                  HP
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
                isDisabled={repairSleighInProgress}
                isLoading={repairSleighInProgress}
                spinner={
                  <Flex flexDirection="row" align="center">
                    <Spinner color={theme.colors.white} size="sm" />
                  </Flex>
                }
                onClick={() => {
                  let propulsion = 0,
                    landingGear = 0,
                    navigation = 0,
                    presentsBag = 0;

                  switch (partToRepair) {
                    case "PROPULSION":
                      propulsion = repairAmount;
                      break;
                    case "LANDING GEAR":
                      landingGear = repairAmount;
                      break;
                    case "NAVIGATION":
                      navigation = repairAmount;
                      break;
                    case "PRESENTS BAG":
                      presentsBag = repairAmount;
                      break;
                    default:
                      break; // or handle an unexpected case
                  }

                  repairSleigh(
                    propulsion,
                    landingGear,
                    navigation,
                    presentsBag
                  );
                }}
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
                  YOU ARE ABOUT TO USE
                </Box>{" "}
                <Box as="span" color={theme.colors.tertiary}>
                  {repairAmount} {partToRepair} RESOURCES
                </Box>{" "}
                <Box as="span" color={theme.colors.white}>
                  TO REPAIR YOUR SLEIGH&apos;S
                </Box>{" "}
                <Box as="span" color={theme.colors.tertiary}>
                  {partToRepair}
                </Box>
                <Box as="span" color={theme.colors.white}>
                  .
                </Box>
              </Text>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
