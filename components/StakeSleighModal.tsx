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
} from "@chakra-ui/react";
import theme from "@/styles/theme";

interface StakeSleighModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  stakeAmount: number;
  minStakeAmount: number;
  maxStakeAmount: number;
  handleSliderChange: (value: number) => void;
  handleInputChange: (valueAsString: string, valueAsNumber: number) => void;
  onConfirmStake: () => void;
  stakingInProgress: boolean;
}

export const StakeSleighModal: React.FC<StakeSleighModalProps> = ({
  isOpen,
  onOpen,
  onClose,
  stakeAmount,
  minStakeAmount,
  maxStakeAmount,
  handleSliderChange,
  handleInputChange,
  onConfirmStake,
  stakingInProgress,
}) => {
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
        STAKE NEW SLEIGH +
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
            STAKE NEW SLEIGH
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
                    <Spinner color={theme.colors.white} size="sm" />
                  </Flex>
                }
                onClick={onConfirmStake}
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
