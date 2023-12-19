import theme from "@/styles/theme";
import { GameSettings, Sleigh } from "@/types/types";
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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSolana from "@/hooks/useSolana";
import { useWallet } from "@solana/wallet-adapter-react";
import { randomBytes } from "crypto";
import {
  claimLevelsTx,
  deliveryTx,
  getGameRolls,
  repairSleighTx,
  retireSleighTx,
} from "@/utils/solana";
import { RepairSleighModal } from "./RepairSleighModal";
import { sampleSleighs } from "@/stores/sampleData";

interface SleighProps {
  sleigh: Sleigh | null;
  gameSettings: GameSettings | null;
}

export function SleighComponent({ sleigh, gameSettings }: SleighProps) {
  const [retireInProgress, setRetireInProgress] = useState<boolean>(false);
  const [repairSleighInProgress, setRepairSleighInProgress] =
    useState<boolean>(false);
  const [startingDeliveryInProgress, setStartingDeliveryInProgress] =
    useState<boolean>(false);
  const [claimingInProgress, setClaimingInProgress] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<string>("BUILD");

  useEffect(() => {
    if (gameSettings && gameSettings.stage1Start > gameSettings.stage1End) {
      setCurrentStage("DELIVERY");
    }
  }, [gameSettings]);

  const { connection } = useSolana();
  const {
    wallet,
    publicKey,
    signTransaction,
    signAllTransactions,
    connecting,
    disconnecting,
  } = useWallet();

  const startDelivery = async () => {
    setStartingDeliveryInProgress(true);

    try {
      if (!signTransaction || !connection || !publicKey || !sleigh) {
        throw Error("Staking failed");
      }
      const sleighId = BigInt(`0x${randomBytes(8).toString("hex")}`);

      const tx = await deliveryTx(sleighId, connection, publicKey);
      if (!tx) {
        throw Error("Failed to create tx");
      }
      const signedTx = await signTransaction(tx);
      await connection.sendTransaction(tx);
      console.log("Signed tx: ", signedTx);

      // Simulate a request with a 10-second delay
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      toast.success("Delivery started");
    } catch (e) {
      console.error("Error during staking: ", e);
      toast.error("Failed to start delivery");
    } finally {
      setStartingDeliveryInProgress(false);
    }
  };

  const claimSleigh = async () => {
    setClaimingInProgress(true);

    try {
      if (!signTransaction || !connection || !publicKey || !sleigh) {
        throw Error("Staking failed");
      }
      const sleighId = BigInt(`0x${randomBytes(8).toString("hex")}`);

      const gameRolls = await getGameRolls(connection, currentStage);

      if (!gameRolls) {
        throw Error("Failed to get game rolls");
      }

      const tx = await claimLevelsTx(
        sleighId,
        gameRolls.rolls,
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

      toast.success("Sleigh claimed");
    } catch (e) {
      console.error("Error during claiming sleigh: ", e);
      toast.error("Failed to claim sleigh");
    } finally {
      setClaimingInProgress(false);
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
                {currentStage}
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
            {currentStage == "DELIVERY" && (
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
                  isDisabled={startingDeliveryInProgress}
                  isLoading={startingDeliveryInProgress}
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
            )}
          </Flex>
          <Flex
            direction="column"
            w="100%"
            h="85%"
            justifyContent="center"
            alignItems="center"
          >
            <Flex
              direction="row"
              w="100%"
              justifyContent="space-between"
              alignItems="start"
              mt="-8rem"
              mb="5rem"
            >
              <Flex
                w="60%"
                h="10rem"
                ml="10rem"
                justifyContent="space-between"
                alignItems="end"
              >
                <Flex
                  w="30rem"
                  flexDirection="column"
                  justifyContent="space-between"
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
                    {sleigh.sleighId}
                  </Text>
                  {sleigh.builtIndex == 0 && (
                    <Button
                      borderWidth="2px"
                      borderColor={theme.colors.primary}
                      bg={theme.colors.primary}
                      borderRadius="30px"
                      fontWeight="700"
                      fontSize="1.25rem"
                      fontFamily={theme.fonts.body}
                      w="20rem"
                      mt="1rem"
                      h="3.5rem"
                      color={theme.colors.white}
                      isDisabled={claimingInProgress || sleigh.builtIndex > 0}
                      isLoading={claimingInProgress}
                      spinner={
                        <Flex flexDirection="row" align="center">
                          <Spinner color={theme.colors.white} size="sm" />
                        </Flex>
                      }
                      onClick={claimSleigh}
                      _hover={{
                        color: theme.colors.white,
                        borderColor: theme.colors.accentThree,
                        bg: theme.colors.accentThree,
                      }}
                    >
                      CLAIM SLEIGH
                    </Button>
                  )}
                </Flex>
                <Flex
                  flexDirection="column"
                  bg={theme.colors.background}
                  w="20rem"
                  h="10rem"
                  borderRadius="0.75rem"
                  borderWidth="2px"
                  borderColor={theme.colors.background}
                  boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                  p="1rem"
                >
                  <Flex justifyContent="space-between" w="100%" h="20rem">
                    <Text
                      fontSize="1.25rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.white}
                      mr="0.5rem"
                    >
                      NAVIGATION
                    </Text>
                    {sleigh.broken ? (
                      <Text
                        fontSize="1rem"
                        fontWeight="700"
                        fontFamily={theme.fonts.body}
                        color={theme.colors.primary}
                      >
                        BROKEN
                      </Text>
                    ) : (
                      <Text
                        fontSize="1rem"
                        fontWeight="700"
                        fontFamily={theme.fonts.body}
                        color={
                          sleigh.navigationHp < 60
                            ? theme.colors.primary
                            : sleigh.navigationHp < 120
                            ? theme.colors.quaternary
                            : sleigh.navigationHp < 200
                            ? theme.colors.tertiary
                            : theme.green[700]
                        }
                      >
                        {sleigh.navigationHp} HP
                      </Text>
                    )}
                  </Flex>
                  <Flex justifyContent="center" alignContent="center" mt="2rem">
                    <RepairSleighModal
                      repairSleighInProgress={repairSleighInProgress}
                      setRepairSleighInProgress={setRepairSleighInProgress}
                      currentStage={currentStage}
                      currentSleigh={sleigh}
                      partToRepair={"NAVIGATION"}
                      hp={sleigh.navigationHp}
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex justifyContent="center" w="100%">
              <Flex
                flexDirection="column"
                align="center"
                bg={theme.colors.background}
                w="20rem"
                h="10rem"
                borderRadius="0.75rem"
                borderWidth="2px"
                borderColor={theme.colors.background}
                boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                p="1rem"
                mt="5rem"
              >
                <Flex justifyContent="space-between" w="100%" h="20rem">
                  <Text
                    fontSize="1.25rem"
                    fontWeight="700"
                    fontFamily={theme.fonts.body}
                    color={theme.colors.white}
                    mr="0.5rem"
                  >
                    PROPULSION
                  </Text>
                  {sleigh.broken ? (
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.primary}
                    >
                      BROKEN
                    </Text>
                  ) : (
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={
                        sleigh.propulsionHp < 60
                          ? theme.colors.primary
                          : sleigh.propulsionHp < 120
                          ? theme.colors.quaternary
                          : sleigh.propulsionHp < 200
                          ? theme.colors.tertiary
                          : theme.green[700]
                      }
                    >
                      {sleigh.propulsionHp} HP
                    </Text>
                  )}
                </Flex>
                <Flex
                  justifyContent="center"
                  alignContent="center"
                  mt="2rem"
                  w="100%"
                >
                  <RepairSleighModal
                    repairSleighInProgress={repairSleighInProgress}
                    setRepairSleighInProgress={setRepairSleighInProgress}
                    currentStage={currentStage}
                    currentSleigh={sleigh}
                    partToRepair={"PROPULSION"}
                    hp={sleigh.propulsionHp}
                  />
                </Flex>
              </Flex>
              <Image src="/sleigh.svg" alt="Sleigh Image" w="50rem" />
              <Flex
                flexDirection="column"
                bg={theme.colors.background}
                w="20rem"
                h="10rem"
                borderRadius="0.75rem"
                borderWidth="2px"
                borderColor={theme.colors.background}
                boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
                p="1rem"
              >
                <Flex justifyContent="space-between" w="100%" h="20rem">
                  <Text
                    fontSize="1.25rem"
                    fontWeight="700"
                    fontFamily={theme.fonts.body}
                    color={theme.colors.white}
                    mr="0.5rem"
                  >
                    PRESENTS BAG
                  </Text>
                  {sleigh.broken ? (
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.primary}
                    >
                      BROKEN
                    </Text>
                  ) : (
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={
                        sleigh.presentsBagHp < 60
                          ? theme.colors.primary
                          : sleigh.presentsBagHp < 120
                          ? theme.colors.quaternary
                          : sleigh.presentsBagHp < 200
                          ? theme.colors.tertiary
                          : theme.green[700]
                      }
                    >
                      {sleigh.presentsBagHp} HP
                    </Text>
                  )}
                </Flex>
                <Flex justifyContent="center" alignContent="center" mt="2rem">
                  <RepairSleighModal
                    repairSleighInProgress={repairSleighInProgress}
                    setRepairSleighInProgress={setRepairSleighInProgress}
                    currentStage={currentStage}
                    currentSleigh={sleigh}
                    partToRepair={"PRESENTS BAG"}
                    hp={sleigh.presentsBagHp}
                  />
                </Flex>
              </Flex>
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
                  {sleigh.broken ? (
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={theme.colors.primary}
                    >
                      BROKEN
                    </Text>
                  ) : (
                    <Text
                      fontSize="1rem"
                      fontWeight="700"
                      fontFamily={theme.fonts.body}
                      color={
                        sleigh.landingGearHp < 60
                          ? theme.colors.primary
                          : sleigh.landingGearHp < 120
                          ? theme.colors.quaternary
                          : sleigh.landingGearHp < 200
                          ? theme.colors.tertiary
                          : theme.green[700]
                      }
                    >
                      {sleigh.landingGearHp} HP
                    </Text>
                  )}
                </Flex>
                <Flex justifyContent="center" alignContent="center" mt="2rem">
                  <RepairSleighModal
                    repairSleighInProgress={repairSleighInProgress}
                    setRepairSleighInProgress={setRepairSleighInProgress}
                    currentStage={currentStage}
                    currentSleigh={sleigh}
                    partToRepair={"LANDING GEAR"}
                    hp={sleigh.landingGearHp}
                  />
                </Flex>
              </Box>
              <RetireSleighModal
                retireInProgress={retireInProgress}
                setRetireInProgress={setRetireInProgress}
                currentSleigh={sleigh}
                currentStage={currentStage}
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
