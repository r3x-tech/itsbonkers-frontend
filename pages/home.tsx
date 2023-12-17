import { Navbar } from "@/components/Navbar";
import { SleighComponent } from "@/components/SleighComponent";
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
                    <SleighComponent
                      key={index}
                      sleigh={sleigh}
                      onSelect={handleSelectSleigh}
                      isSelected={
                        !!(
                          selectedSleigh && selectedSleigh.name === sleigh.name
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
                        borderColor: theme.colors.tertiary,
                        bg: theme.colors.tertiary,
                      }}
                    >
                      STAKE NEW SLEIGH +
                    </Button>
                    <Modal isOpen={isOpen} onClose={onSleighWarningClose}>
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
                          STAKE NEW SLEIGH
                        </ModalHeader>
                        <ModalCloseButton
                          m="1.5rem"
                          color={theme.colors.white}
                        />
                        <ModalBody
                          my="2rem"
                          w="100%"
                          // bg="blue"
                          flexDirection="row"
                          justifyContent="center"
                          alignContent="center"
                        >
                          <Flex
                            w="100%"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            // bg="pink"
                          >
                            <Text
                              textAlign="start"
                              w="100%"
                              mb="1rem"
                              color={theme.colors.white}
                              fontWeight="700"
                              fontSize="1.25rem"
                            >
                              AMOUNT TO STAKE:
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
                                  <Spinner
                                    color={theme.colors.white}
                                    size="sm"
                                  />
                                </Flex>
                              }
                              onClick={() => stakeSleigh()}
                              _hover={{
                                color: theme.colors.white,
                                borderColor: theme.colors.primary,
                                bg: theme.colors.primary,
                              }}
                            >
                              CONFIRM & CONTINUE
                            </Button>
                            <Text
                              fontWeight="bold"
                              my="1rem"
                              mx="1.5rem"
                              // textAlign="center"
                            >
                              <Box
                                as="span"
                                color={theme.colors.primary}
                                fontSize="1.5rem"
                              >
                                WARNING!
                              </Box>{" "}
                              <Box as="span" color={theme.colors.white}>
                                YOU ARE ABOUT TO STAKE
                              </Box>{" "}
                              <Box as="span" color={theme.colors.tertiary}>
                                {stakeAmount} BONK{" "}
                              </Box>
                              <Box as="span" color={theme.colors.white}>
                                THIS ACTION IS IRREVERSIBLE & SHOULD YOU CHOOSE
                                TO REMOVE YOUR STAKE YOU WILL LOSE THE STAKED
                                AMOUNT OF BONK. SHOULD YOU RE-STAKE AFTER
                                UN-STAKING YOU WILL RECEIVE 70% OF YOUR ORIGINAL
                                STAKE BACK.{" "}
                              </Box>{" "}
                            </Text>
                          </Flex>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  </>

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
          <Flex
            direction="column"
            px="3rem"
            py="2rem"
            h="100%"
            w="80%"
            overflowY="auto"
          >
            <Flex h="10%" justifyContent="space-between">
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
                  DELIVERY{" "}
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
                  10M BONK{" "}
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
                  100M BONK{" "}
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
                  NEXT DELIVERY IN:{" "}
                </Text>
                <Text
                  fontSize="1.25rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                  color={theme.colors.white}
                >
                  DELIVERY{" "}
                </Text>
              </Flex>
            </Flex>
            {selectedSleigh ? (
              <Flex
                direction="column"
                w="100%"
                h="100%"
                justifyContent="center"
                alignItems="center"
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
                      {selectedSleigh.lvl}
                    </Text>
                  </Flex>

                  <Text
                    fontSize="3rem"
                    fontWeight="400"
                    fontFamily={theme.fonts.header}
                    color={theme.colors.white}
                  >
                    {selectedSleigh.name}
                  </Text>
                </Flex>
                <Flex>
                  <Image src="/sleigh.svg" alt="Sleigh Image" w="50rem" />
                </Flex>
              </Flex>
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
        </Flex>
      </Flex>
    </Box>
  );
}

export default HomePage;
