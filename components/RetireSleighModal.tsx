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

interface RetireSleighModallProps {
  isRetireModalOpen: boolean;
  onOpenRetireSleighModal: () => void;
  onCloseRetireSleighModal: () => void;
  retireSleigh: () => void;
  retireInProgress: boolean;
  sleighName: string;
}

export const RetireSleighModal: React.FC<RetireSleighModallProps> = ({
  isRetireModalOpen,
  onOpenRetireSleighModal,
  onCloseRetireSleighModal,
  retireSleigh,
  retireInProgress,
  sleighName,
}) => {
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
        isDisabled={retireInProgress}
        isLoading={retireInProgress}
        spinner={
          <Flex flexDirection="row" align="center">
            <Spinner color={theme.colors.white} size="sm" />
          </Flex>
        }
        onClick={onOpenRetireSleighModal}
        _hover={{
          color: theme.colors.white,
          borderColor: theme.colors.primary,
          bg: theme.colors.primary,
        }}
      >
        RETIRE SLEIGH
      </Button>
      <Modal
        isOpen={isRetireModalOpen}
        onClose={onCloseRetireSleighModal}
        isCentered
      >
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
                {sleighName}
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
                  {sleighName}
                </Box>
                <Box as="span" color={theme.colors.white}>
                  . THIS ACTION IS IRREVERSIBLE & SHOULD YOU CHOOSE TO RETIRE
                  YOUR SLEIGH YOU WILL LOSE THE STAKED AMOUNT OF BONK. SHOULD
                  YOU RE-STAKE AFTER RETIRING YOUR SLEIGH YOU WILL RECEIVE 70%
                  OF YOUR ORIGINAL STAKE BACK.{" "}
                </Box>{" "}
              </Text>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
