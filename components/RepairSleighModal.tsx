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
import userStore from "@/stores/userStore";
import { PublicKey } from "@solana/web3.js";

interface RepairSleighModalProps {
  repairSleighInProgress: boolean;
  setRepairSleighInProgress: (value: boolean) => void;
  currentStage: string;
  currentSleigh: Sleigh;
  partToRepair: string;
  hp: number;
  refetchCurrentSleighs: () => void;
}

export const RepairSleighModal: React.FC<RepairSleighModalProps> = ({
  repairSleighInProgress,
  setRepairSleighInProgress,
  currentStage,
  currentSleigh,
  partToRepair,
  hp,
  refetchCurrentSleighs,
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
  const {
    globalGameId,
    LANDING_GEAR_MINT_ADDRESS,
    NAVIGATION_MINT_ADDRESS,
    PRESENTS_BAG_MINT_ADDRESS,
    PROPULSION_MINT_ADDRESS,
  } = userStore();

  const repairSleigh = async (
    propulsion: number,
    landingGear: number,
    navigation: number,
    presentsBag: number
  ) => {
    setRepairSleighInProgress(true);

    try {
      if (
        !signTransaction ||
        !connection ||
        !publicKey ||
        !currentSleigh ||
        !globalGameId ||
        !LANDING_GEAR_MINT_ADDRESS ||
        !NAVIGATION_MINT_ADDRESS ||
        !PRESENTS_BAG_MINT_ADDRESS ||
        !PROPULSION_MINT_ADDRESS
      ) {
        throw Error("Repair sleigh failed");
      }

      const tx = await repairSleighTx(
        globalGameId,
        BigInt(currentSleigh.sleighId.toNumber()),
        {
          propulsion,
          landingGear,
          navigation,
          presentsBag,
        },
        connection,
        publicKey,
        new PublicKey(LANDING_GEAR_MINT_ADDRESS),
        new PublicKey(NAVIGATION_MINT_ADDRESS),
        new PublicKey(PRESENTS_BAG_MINT_ADDRESS),
        new PublicKey(PROPULSION_MINT_ADDRESS)
      );
      if (!tx) {
        throw Error("Failed to create tx");
      }

      const signedTx = await signTransaction(tx);
      console.log(
        "repairSleigh Signed tx: ",
        Buffer.from(signedTx!.serialize()).toString("base64")
      );
      await connection.sendRawTransaction(signedTx.serialize());

      toast.success("Sleigh repaired");
      onRepairSleighClose();
    } catch (e) {
      console.error("Error during repair: ", e);
      toast.error("Failed to repair");
    }
  };

  const onRepairSleighClose = () => {
    refetchCurrentSleighs();
    setRepairSleighInProgress(false);
    onClose();
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
      <Modal isOpen={isOpen} onClose={onRepairSleighClose} isCentered>
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
