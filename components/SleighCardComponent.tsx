import theme from "@/styles/theme";
import { Sleigh } from "@/types/types";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BN } from "@coral-xyz/anchor";

interface SleighProps {
  currentSleigh: Sleigh;
  onSelect: (sleigh: Sleigh) => void;
  isSelected: boolean;
}

export function SleighCardComponent({
  currentSleigh,
  onSelect,
  isSelected,
}: SleighProps) {
  const sleighIdString =
    currentSleigh.sleighId instanceof BN
      ? currentSleigh.sleighId.toString()
      : "Unknown";

  return (
    <Box
      bg={theme.colors.background}
      width="100%"
      h="7rem"
      borderRadius="0.75rem"
      borderColor={isSelected ? theme.colors.tertiary : theme.colors.background}
      borderWidth="2px"
      boxShadow="4px 4px 8px rgba(0, 0, 0, 0.4)"
      onClick={() => onSelect(currentSleigh)}
      cursor="pointer"
      p="1rem"
    >
      <Flex>
        <Text
          fontSize="1rem"
          fontWeight="400"
          fontFamily={theme.fonts.body}
          color={theme.colors.white}
          mr="0.5rem"
        >
          LVL:
        </Text>
        <Text
          fontSize="1rem"
          fontWeight="700"
          fontFamily={theme.fonts.body}
          color={theme.colors.white}
        >
          {currentSleigh.level.toString()}
        </Text>
      </Flex>
      <Text
        fontSize="1.5rem"
        fontWeight="400"
        fontFamily={theme.fonts.header}
        color={theme.colors.white}
      >
        {sleighIdString}
      </Text>
    </Box>
  );
}
