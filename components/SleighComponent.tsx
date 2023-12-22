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
// import { sampleSleighs } from "@/stores/sampleData";
import { useCurrentSlot } from "@/hooks/useCurrentSlot";
import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import userStore from "@/stores/userStore";

interface SleighProps {
  currentSleigh: Sleigh | null;
  gameSettings: GameSettings | undefined;
  refetchCurrentSleighs: () => void;
}

export function SleighComponent({
  currentSleigh,
  gameSettings,
  refetchCurrentSleighs,
}: SleighProps) {
  const [retireInProgress, setRetireInProgress] = useState<boolean>(false);
  const [repairSleighInProgress, setRepairSleighInProgress] =
    useState<boolean>(false);
  const [startingDeliveryInProgress, setStartingDeliveryInProgress] =
    useState<boolean>(false);
  const [claimingInProgress, setClaimingInProgress] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<string>("BUILD");
  const [pendingDeliveries, setPendingDeliveries] = useState<number>(0);

  const { connection } = useSolana();
  const {
    wallet,
    publicKey,
    signTransaction,
    signAllTransactions,
    connecting,
    disconnecting,
  } = useWallet();
  const { data: currentSlot } = useCurrentSlot();
  const {
    globalGameId,
    LANDING_GEAR_MINT_ADDRESS,
    NAVIGATION_MINT_ADDRESS,
    PRESENTS_BAG_MINT_ADDRESS,
    PROPULSION_MINT_ADDRESS,
  } = userStore();

  useEffect(() => {
    const setDeliveries = async (sleigh: Sleigh, connection: Connection) => {
      // refetchPendingDeliveries(sleigh);
      const gameRolls = await getGameRolls(
        globalGameId,
        connection,
        "DELIVERY"
      );
      if (gameRolls && currentSleigh) {
        const numOfDeliveriesPending =
          gameRolls.rolls.length - currentSleigh.lastDeliveryRoll.toNumber();
        setPendingDeliveries(numOfDeliveriesPending);
      }
    };
    if (
      connection &&
      currentStage != "DELIVERY" &&
      gameSettings &&
      globalGameId &&
      currentSlot &&
      currentSlot > gameSettings.stage1End.toNumber() &&
      currentSleigh
    ) {
      setCurrentStage("DELIVERY");
      setDeliveries(currentSleigh, connection);
    }
  }, [
    connection,
    currentSleigh,
    currentSlot,
    currentStage,
    gameSettings,
    globalGameId,
  ]);

  const startDelivery = async () => {
    setStartingDeliveryInProgress(true);

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
        throw Error("Delivery failed");
      }
      const sleighId = BigInt(`0x${randomBytes(8).toString("hex")}`);

      const tx = await deliveryTx(
        globalGameId,
        BigInt(currentSleigh.sleighId.toString()),
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
        "startDelivery Signed tx: ",
        Buffer.from(signedTx!.serialize()).toString("base64")
      );

      await connection.sendRawTransaction(signedTx.serialize());
      toast.success("Delivery started");
    } catch (e) {
      console.error("Error during delivery: ", e);
      toast.error("Failed to start delivery");
    } finally {
      refetchCurrentSleighs();
      setStartingDeliveryInProgress(false);
    }
  };

  const claimSleigh = async () => {
    setClaimingInProgress(true);

    try {
      if (
        !signTransaction ||
        !connection ||
        !publicKey ||
        !currentSleigh ||
        !globalGameId
      ) {
        throw Error("Claim sleigh failed");
      }
      const sleighId = BigInt(`0x${randomBytes(8).toString("hex")}`);

      const gameRolls = await getGameRolls(
        globalGameId,
        connection,
        currentStage
      );

      if (!gameRolls) {
        throw Error("Failed to get game rolls");
      }

      const tx = await claimLevelsTx(
        globalGameId,
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
      console.log("Claim Sleigh Signed tx: ", signedTx);

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
      {currentSleigh ? (
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
                STAKED AT ROLL:{" "}
              </Text>
              <Flex>
                <Text
                  fontSize="1.25rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                  color={theme.colors.white}
                  mr="0.5rem"
                >
                  {currentSleigh?.stakedAfterRoll.toString() || 0}
                </Text>
              </Flex>
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
                {currentSleigh?.stakeAmt.toString() || 0} BONK
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
                {(gameSettings!.sleighsBuilt.toNumber() -
                  currentSleigh.builtIndex.toNumber()) *
                  gameSettings!.mintCostMultiplier!.toNumber() || 0}{" "}
                BONK
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
                    {gameSettings?.lastRolled
                      .add(gameSettings.rollInterval)
                      .div(new BN(2))
                      .mul(new BN(60))
                      .toString()}{" "}
                    MIN
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
                    <Text>({pendingDeliveries.toString()})</Text>
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
                      {currentSleigh.level.toString()}
                    </Text>
                  </Flex>
                  <Text
                    fontSize="3rem"
                    fontWeight="400"
                    fontFamily={theme.fonts.header}
                    color={theme.colors.white}
                  >
                    {currentSleigh.sleighId.toString()}
                  </Text>
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
                    {currentSleigh.broken ? (
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
                          currentSleigh.navigationHp < 60
                            ? theme.colors.primary
                            : currentSleigh.navigationHp < 120
                            ? theme.colors.quaternary
                            : currentSleigh.navigationHp < 200
                            ? theme.colors.tertiary
                            : theme.green[700]
                        }
                      >
                        {currentSleigh.navigationHp} HP
                      </Text>
                    )}
                  </Flex>
                  <Flex justifyContent="center" alignContent="center" mt="2rem">
                    <RepairSleighModal
                      repairSleighInProgress={repairSleighInProgress}
                      setRepairSleighInProgress={setRepairSleighInProgress}
                      currentStage={currentStage}
                      currentSleigh={currentSleigh}
                      partToRepair={"NAVIGATION"}
                      hp={currentSleigh.navigationHp}
                      refetchCurrentSleighs={refetchCurrentSleighs}
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
                  {currentSleigh.broken ? (
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
                        currentSleigh.propulsionHp < 60
                          ? theme.colors.primary
                          : currentSleigh.propulsionHp < 120
                          ? theme.colors.quaternary
                          : currentSleigh.propulsionHp < 200
                          ? theme.colors.tertiary
                          : theme.green[700]
                      }
                    >
                      {currentSleigh.propulsionHp} HP
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
                    currentSleigh={currentSleigh}
                    partToRepair={"PROPULSION"}
                    hp={currentSleigh.propulsionHp}
                    refetchCurrentSleighs={refetchCurrentSleighs}
                  />
                </Flex>
              </Flex>
              {currentSleigh.builtIndex.toNumber() == 0 &&
              currentStage == "BUILD" ? (
                <Tooltip
                  label="BIDDING 4 SLEIGH IN PROGRESS"
                  aria-label="BIDDING 4 SLEIGH IN PROGRESS"
                  bg={theme.colors.black}
                >
                  <Image
                    src="/sleighBidInProgress.svg"
                    alt="Sleigh Bid In Progress Image"
                    w="50rem"
                  />
                </Tooltip>
              ) : currentSleigh.builtIndex.toNumber() == 0 &&
                currentStage == "DELIVERY" ? (
                <Tooltip
                  label="LOST BID 4 SLEIGH. RETIRE THIS SLEIGH TO RECLAIM BONK"
                  aria-label="LOST BID 4 SLEIGH. RETIRE THIS SLEIGH TO RECLAIM BONK"
                  bg={theme.colors.black}
                >
                  <Image
                    src="/sleighLostBid.svg"
                    alt="Sleigh Lost Bid Image"
                    w="50rem"
                  />
                </Tooltip>
              ) : (
                <Image src="/sleigh.svg" alt="Sleigh Image" w="50rem" />
              )}
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
                  {currentSleigh.broken ? (
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
                        currentSleigh.presentsBagHp < 60
                          ? theme.colors.primary
                          : currentSleigh.presentsBagHp < 120
                          ? theme.colors.quaternary
                          : currentSleigh.presentsBagHp < 200
                          ? theme.colors.tertiary
                          : theme.green[700]
                      }
                    >
                      {currentSleigh.presentsBagHp} HP
                    </Text>
                  )}
                </Flex>
                <Flex justifyContent="center" alignContent="center" mt="2rem">
                  <RepairSleighModal
                    repairSleighInProgress={repairSleighInProgress}
                    setRepairSleighInProgress={setRepairSleighInProgress}
                    currentStage={currentStage}
                    currentSleigh={currentSleigh}
                    partToRepair={"PRESENTS BAG"}
                    hp={currentSleigh.presentsBagHp}
                    refetchCurrentSleighs={refetchCurrentSleighs}
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
                  {currentSleigh.broken ? (
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
                        currentSleigh.landingGearHp < 60
                          ? theme.colors.primary
                          : currentSleigh.landingGearHp < 120
                          ? theme.colors.quaternary
                          : currentSleigh.landingGearHp < 200
                          ? theme.colors.tertiary
                          : theme.green[700]
                      }
                    >
                      {currentSleigh.landingGearHp} HP
                    </Text>
                  )}
                </Flex>
                <Flex justifyContent="center" alignContent="center" mt="2rem">
                  <RepairSleighModal
                    repairSleighInProgress={repairSleighInProgress}
                    setRepairSleighInProgress={setRepairSleighInProgress}
                    currentStage={currentStage}
                    currentSleigh={currentSleigh}
                    partToRepair={"LANDING GEAR"}
                    hp={currentSleigh.landingGearHp}
                    refetchCurrentSleighs={refetchCurrentSleighs}
                  />
                </Flex>
              </Box>
              <RetireSleighModal
                retireInProgress={retireInProgress}
                setRetireInProgress={setRetireInProgress}
                currentSleigh={currentSleigh}
                currentStage={currentStage}
                refetchCurrentSleighs={refetchCurrentSleighs}
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
