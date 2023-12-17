import { Navbar } from "@/components/Navbar";
import { SleighCardComponent } from "@/components/SleighCardComponent";
import { SleighComponent } from "@/components/SleighComponent";
import { StakeSleighModal } from "@/components/StakeSleighModal";
import useSolana from "@/hooks/useSolana";
import { sampleSleighs } from "@/stores/sampleData";
import userStore from "@/stores/userStore";
import theme from "@/styles/theme";
import { Sleigh } from "@/types/types";
import { createSleighTx } from "@/utils";
import {
  Box,
  Image,
  Flex,
  Grid,
  Input,
  Text,
  Button,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { randomBytes } from "crypto";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

function HomePage() {
  const { loggedIn } = userStore();
  const router = useRouter();
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

  const [selectedSleigh, setSelectedSleigh] = useState<Sleigh | null>(null);
  const [stakingInProgress, setStakingInProgress] = useState<boolean>(false);

  const handleSelectSleigh = (sleigh: Sleigh) => {
    setSelectedSleigh(sleigh);
  };

  const [stakeAmount, setStakeAmount] = useState(250);
  const [minStakeAmount, setMinStakeAmount] = useState(250);
  const [maxStakeAmount, setMaxStakeAmount] = useState(100000000000);

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
      const stakeAmt = 100000;

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
      setStakingInProgress(false);
      onClose();
    }
  };

  const onSleighWarningClose = () => {
    setStakingInProgress(false);
    onClose();
  };

  return (
    <Box minHeight="100vh" minWidth="100vw" bg={theme.colors.background}>
      <Navbar />
      <Flex
        h="92vh"
        w="100vw"
        bg={theme.colors.background}
        justifyContent="center"
        alignItems="center"
      >
        {loggedIn ? (
          <Flex
            h="85vh"
            w="93vw"
            borderRadius="2rem"
            bg={theme.colors.secondary}
            color={theme.colors.white}
            fontFamily="Montserrat"
            justifyContent="center"
            align="center"
          >
            <Flex
              direction="column"
              h="100%"
              w="20%"
              borderRightWidth="4px"
              borderColor={theme.colors.background}
            >
              <Flex
                direction="column"
                justifyContent="start"
                h="20%"
                py="2rem"
                px="3rem"
                borderBottomWidth="4px"
                borderColor={theme.colors.background}
              >
                <Text
                  fontSize="1.25rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                  cursor="pointer"
                >
                  RESOURCES
                </Text>
                <Flex justifyContent="space-between" mt="1.25rem" w="100%">
                  <Box
                    bg={theme.colors.background}
                    boxSize="4.5rem"
                    borderRadius="0.75rem"
                    boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                  ></Box>
                  <Box
                    bg={theme.colors.background}
                    boxSize="4.5rem"
                    borderRadius="0.75rem"
                    boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                  ></Box>
                  <Box
                    bg={theme.colors.background}
                    boxSize="4.5rem"
                    borderRadius="0.75rem"
                    boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                  ></Box>
                  <Box
                    bg={theme.colors.background}
                    boxSize="4.5rem"
                    borderRadius="0.75rem"
                    boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                  ></Box>
                </Flex>
              </Flex>
              <Flex
                direction="column"
                justifyContent="start"
                h="80%"
                py="2rem"
                px="3rem"
              >
                <Flex
                  alignItems="flex-end"
                  justifyContent="space-between"
                  w="100%"
                >
                  <Text
                    fontSize="1.25rem"
                    fontWeight="700"
                    fontFamily={theme.fonts.body}
                  >
                    SLEIGHS
                  </Text>
                  <Flex>
                    <Text
                      fontSize="1rem"
                      fontWeight="400"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.white}
                      mr="0.5rem"
                    >
                      # OF SLEIGHS:{" "}
                    </Text>
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.white}
                    >
                      {sampleSleighs.length}
                    </Text>
                  </Flex>
                </Flex>
                <Flex
                  flexDirection="column"
                  justifyContent="space-between"
                  my="1.25rem"
                  w="100%"
                  h="48rem"
                >
                  <Flex
                    flexDirection="column"
                    justifyContent="start"
                    h="88%"
                    overflowY="auto"
                    gap="1.5rem"
                    pr="1rem"
                    mr="-1rem"
                  >
                    {sampleSleighs.map((sleigh, index) => (
                      <SleighCardComponent
                        key={index}
                        sleigh={sleigh}
                        onSelect={handleSelectSleigh}
                        isSelected={
                          !!(
                            selectedSleigh &&
                            selectedSleigh.name === sleigh.name
                          )
                        }
                      />
                    ))}
                  </Flex>
                  <Flex
                    flexDirection="column"
                    justifyContent="center"
                    align="center"
                    w="100%"
                    h="12%"
                  >
                    <StakeSleighModal
                      isOpen={isOpen}
                      onOpen={onOpen}
                      onClose={onClose}
                      stakeAmount={stakeAmount}
                      minStakeAmount={minStakeAmount}
                      maxStakeAmount={maxStakeAmount}
                      handleSliderChange={handleSliderChange}
                      handleInputChange={handleInputChange}
                      onConfirmStake={stakeSleigh}
                      stakingInProgress={stakingInProgress}
                    />
                    <Flex>
                      <Text
                        fontSize="1rem"
                        fontWeight="400"
                        fontFamily={theme.fonts.body}
                        color={theme.colors.white}
                        mr="0.5rem"
                      >
                        COST TO STAKE:{" "}
                      </Text>
                      <Text
                        fontSize="1rem"
                        fontWeight="700"
                        fontFamily={theme.fonts.body}
                        color={theme.colors.white}
                      >
                        10M BONK
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <SleighComponent sleigh={selectedSleigh} />
          </Flex>
        ) : (
          <Flex
            h="85vh"
            w="93vw"
            borderRadius="2rem"
            bg={theme.colors.secondary}
            color={theme.colors.white}
            fontFamily="Montserrat"
            justifyContent="center"
            align="center"
          >
            <Flex
              direction="column"
              w="100%"
              h="100%"
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
            >
              <Text
                fontSize="2.5rem"
                fontWeight="400"
                fontFamily={theme.fonts.header}
                color={theme.colors.white}
                pb="5rem"
              >
                AW SHUCKS, PLEASE LOGIN TO PLAY!
              </Text>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

export default HomePage;
