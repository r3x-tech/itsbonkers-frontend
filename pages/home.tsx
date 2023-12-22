import { Navbar } from "@/components/Navbar";
import { SleighCardComponent } from "@/components/SleighCardComponent";
import { SleighComponent } from "@/components/SleighComponent";
import { StakeSleighModal } from "@/components/StakeSleighModal";
import useSolana from "@/hooks/useSolana";
// import { sampleGameSettings, sampleSleighs } from "@/stores/sampleData";
import userStore from "@/stores/userStore";
import theme from "@/styles/theme";
import { Sleigh } from "@/types/types";
import { createSleighTx } from "@/utils";
import { GiSkis } from "react-icons/gi";
import { TbRefresh } from "react-icons/tb";

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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useGameSettings } from "@/hooks/useGameSettings";
import { useCurrentSleighs } from "@/hooks/useCurrentSleighs";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentWalletBonkBalance } from "@/hooks/useCurrentWalletBonkBalance";
import { useCurrentSlot } from "@/hooks/useCurrentSlot";
import { useCurrentPropulsionParts } from "@/hooks/useCurrentPropulsionParts";
import { useCurrentNavigationParts } from "@/hooks/useCurrentNavigationParts";
import { useCurrentLandingGearParts } from "@/hooks/useCurrentLandingGearParts";
import { useCurrentPresentsBagParts } from "@/hooks/useCurrentPresentsBagParts";
import {
  LANDING_GEAR_MINT_ADDRESS,
  NAVIGATION_MINT_ADDRESS,
  PRESENTS_BAG_MINT_ADDRESS,
  PROPULSION_MINT_ADDRESS,
} from "@/constants";

function HomePage() {
  const [selectedSleigh, setSelectedSleigh] = useState<Sleigh | null>(null);
  const [stakingInProgress, setStakingInProgress] = useState<boolean>(false);
  const [currentStakeCost, setCurrentStakeCost] = useState<number>(0);
  const [stg2Started, setStg2Started] = useState<boolean>(false);

  const { loggedIn } = userStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { connection } = useSolana();
  const {
    wallet,
    publicKey,
    signTransaction,
    signAllTransactions,
    connecting,
    disconnecting,
  } = useWallet();

  const { data: gameSettings, isLoading: isLoadingGameSettings } =
    useGameSettings(connection);
  const {
    data: currentSleighs,
    isLoading: isLoadingSleighs,
    refetch: refetchCurrentSleighs,
  } = useCurrentSleighs(publicKey, connection);
  const { data: walletBonkBalance, isLoading: isLoadingWalletBonkBalance } =
    useCurrentWalletBonkBalance(publicKey, connection);
  const { data: currentSlot } = useCurrentSlot();
  const {
    data: currentPropulsionParts,
    refetch: refetchCurrentPropulsionParts,
  } = useCurrentPropulsionParts(publicKey, connection, PROPULSION_MINT_ADDRESS);
  const {
    data: currentLandingGearParts,
    refetch: refetchCurrentLandingGearParts,
  } = useCurrentLandingGearParts(
    publicKey,
    connection,
    LANDING_GEAR_MINT_ADDRESS
  );
  const {
    data: currentNavigationParts,
    refetch: refetchCurrentNavigationParts,
  } = useCurrentNavigationParts(publicKey, connection, NAVIGATION_MINT_ADDRESS);
  const {
    data: currentPresentsBagParts,
    refetch: refetchCurrentPresentsBagParts,
  } = useCurrentPresentsBagParts(
    publicKey,
    connection,
    PRESENTS_BAG_MINT_ADDRESS
  );

  useEffect(() => {
    if (
      gameSettings &&
      currentSlot &&
      currentSlot > gameSettings.stage1End.toNumber()
    ) {
      setStg2Started(true);
    }
  }, [currentSlot, gameSettings]);

  useEffect(() => {
    if (publicKey && connection) {
      queryClient.refetchQueries({
        queryKey: ["gameSettings", connection],
      });
      queryClient.refetchQueries({
        queryKey: ["currentSleighs", publicKey, connection],
      });
      queryClient.refetchQueries({
        queryKey: ["bonkBalance", publicKey, connection],
      });
    }
  }, [connection, publicKey, queryClient]);

  useEffect(() => {
    if (gameSettings) {
      const sC =
        gameSettings.sleighsBuilt.toNumber() *
        gameSettings.mintCostMultiplier.toNumber();
      setCurrentStakeCost(sC);
    }
  }, [gameSettings]);

  const handleSelectSleigh = (sleigh: Sleigh) => {
    setSelectedSleigh(sleigh);
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
                h="25%"
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
                <Grid
                  templateColumns="repeat(2, 1fr)"
                  gap={4}
                  mt="1.25rem"
                  w="100%"
                >
                  <Box
                    bg={theme.colors.background}
                    w="100%"
                    height={["3.5rem, 4rem"]}
                    borderRadius="0.75rem"
                    boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                    justifyContent="center"
                    alignContent="center"
                    p="1rem"
                  >
                    <Flex
                      w="100%"
                      h="100%"
                      justifyContent="space-between"
                      align="center"
                    >
                      <Image src="/reindeer.png" alt="skis" boxSize="2rem" />
                      <Text
                        fontSize="1rem"
                        fontWeight="700"
                        fontFamily={theme.fonts.body}
                      >
                        {currentPropulsionParts?.toString()}
                      </Text>
                    </Flex>
                  </Box>

                  <Box
                    bg={theme.colors.background}
                    w="100%"
                    height={["3.5rem, 4rem"]}
                    borderRadius="0.75rem"
                    boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                    justifyContent="center"
                    alignContent="center"
                    p="1rem"
                  >
                    <Flex
                      w="100%"
                      h="100%"
                      justifyContent="space-between"
                      align="center"
                    >
                      <Image src="/gps.png" alt="gps" boxSize="2rem" />
                      <Text
                        fontSize="1rem"
                        fontWeight="700"
                        fontFamily={theme.fonts.body}
                      >
                        {currentNavigationParts?.toString()}
                      </Text>
                    </Flex>
                  </Box>
                  <Box
                    bg={theme.colors.background}
                    w="100%"
                    height={["3.5rem, 4rem"]}
                    borderRadius="0.75rem"
                    boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                    justifyContent="space-between"
                    alignContent="center"
                    p="1rem"
                  >
                    {/* <Flex                       w="100%"
                      h="100%"
                      justifyContent="start"
                      align="center">
                      <Image src="/skis.png" alt="skis" boxSize="2.5rem" />
                    </Flex> */}
                    <Flex
                      w="100%"
                      h="100%"
                      justifyContent="space-between"
                      align="center"
                    >
                      <GiSkis fontSize="2rem" />
                      <Text
                        fontSize="1rem"
                        fontWeight="700"
                        fontFamily={theme.fonts.body}
                      >
                        {currentLandingGearParts?.toString()}
                      </Text>
                    </Flex>
                  </Box>
                  <Box
                    bg={theme.colors.background}
                    w="100%"
                    height={["3.5rem, 4rem"]}
                    borderRadius="0.75rem"
                    boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                    justifyContent="center"
                    alignContent="center"
                    p="1rem"
                  >
                    <Flex
                      w="100%"
                      h="100%"
                      justifyContent="space-between"
                      align="center"
                    >
                      <Image src="/presentsbag.png" alt="skis" boxSize="2rem" />
                      <Text
                        fontSize="1rem"
                        fontWeight="700"
                        fontFamily={theme.fonts.body}
                      >
                        {currentPresentsBagParts?.toString()}
                      </Text>
                    </Flex>
                  </Box>
                </Grid>
              </Flex>
              <Flex
                direction="column"
                justifyContent="space-between"
                h="60%"
                py="2rem"
                px="3rem"
              >
                <Flex
                  alignItems="flex-end"
                  justifyContent="space-between"
                  w="100%"
                >
                  <Flex alignItems="center" justifyContent="start" w="50%">
                    <Text
                      fontSize="1.25rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      mr="1rem"
                    >
                      SLEIGHS
                    </Text>
                    <Flex
                      cursor="pointer"
                      onClick={async () => await refetchCurrentSleighs()}
                    >
                      <TbRefresh
                        size="1.5rem"
                        style={{
                          animation: isLoadingSleighs
                            ? "spin 1s linear infinite"
                            : "none",
                        }}
                      />
                    </Flex>
                  </Flex>

                  <Flex w="50%">
                    <Text
                      fontSize="1rem"
                      fontWeight="400"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.white}
                      mr="0.5rem"
                      mb="0.1rem"
                    >
                      # OF SLEIGHS:{" "}
                    </Text>
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.white}
                    >
                      {/* {sampleSleighs.length} */}
                      {currentSleighs?.length}
                    </Text>
                  </Flex>
                </Flex>
                <Flex
                  flexDirection="column"
                  justifyContent="space-between"
                  my="1.25rem"
                  pb="2rem"
                  w="100%"
                  h="100%"
                >
                  <Flex
                    flexDirection="column"
                    justifyContent="start"
                    h="100%"
                    overflowY="auto"
                    gap="1.5rem"
                    pr="1rem"
                    mr="-1rem"
                  >
                    {/* {sampleSleighs.map((sleigh, index) => (
                      <SleighCardComponent
                        key={index}
                        sleigh={sleigh}
                        onSelect={handleSelectSleigh}
                        isSelected={
                          !!(
                            selectedSleigh &&
                            selectedSleigh.sleighId === sleigh.sleighId
                          )
                        }
                      />
                    ))} */}
                    {currentSleighs?.map((sleigh, index) => (
                      <SleighCardComponent
                        key={index}
                        currentSleigh={sleigh}
                        onSelect={handleSelectSleigh}
                        isSelected={
                          !!(
                            selectedSleigh &&
                            selectedSleigh.sleighId.toString() ===
                              sleigh.sleighId.toString()
                          )
                        }
                      />
                    ))}
                  </Flex>
                </Flex>
                <Flex
                  flexDirection="column"
                  justifyContent="center"
                  align="center"
                  w="100%"
                  h="12%"
                >
                  <StakeSleighModal
                    minStakeAmount={currentStakeCost}
                    maxStakeAmount={walletBonkBalance!}
                    stakingInProgress={stakingInProgress}
                    setStakingInProgress={setStakingInProgress}
                    refetchCurrentSleighs={refetchCurrentSleighs}
                    stg2Started={stg2Started}
                  />
                  <Flex>
                    <Text
                      fontSize="1rem"
                      fontWeight="400"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.white}
                      mr="0.5rem"
                    >
                      CURRENT MIN. BID AMOUNT:{" "}
                    </Text>
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.white}
                    >
                      {currentStakeCost}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <SleighComponent
              currentSleigh={selectedSleigh}
              // gameSettings={sampleGameSettings[2]}
              gameSettings={gameSettings}
              refetchCurrentSleighs={refetchCurrentSleighs}
            />
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
