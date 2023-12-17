import theme from "@/styles/theme";
import { Sleigh } from "@/types/types";
import { Image, Flex, Text, Box, Button, Spinner } from "@chakra-ui/react";

interface SleighProps {
  sleigh: Sleigh | null;
}

export function SleighComponent({ sleigh }: SleighProps) {
  return (
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
            BUILD
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

        {/* Spoils Information */}
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

        {/* Next Delivery Information */}
        <Flex>
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
        </Flex>
      </Flex>
      {sleigh ? (
        <Flex
          direction="column"
          w="100%"
          h="100%"
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
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
                {sleigh.lvl}
              </Text>
            </Flex>
            <Text
              fontSize="3rem"
              fontWeight="400"
              fontFamily={theme.fonts.header}
              color={theme.colors.white}
            >
              {sleigh.name}
            </Text>
          </Flex>
          <Flex>
            <Image src="/sleigh.svg" alt="Sleigh Image" w="50rem" />
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
              cursor="pointer"
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
                  ENGINE
                </Text>
                <Text
                  fontSize="1rem"
                  fontWeight="700"
                  fontFamily={theme.fonts.body}
                  color={theme.colors.white}
                >
                  {sleigh.lvl}
                </Text>
              </Flex>
              <Flex justifyContent="center" alignContent="center" mt="2rem">
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
                  isDisabled={sleigh == null}
                  isLoading={sleigh == null}
                  spinner={
                    <Flex flexDirection="row" align="center">
                      <Spinner color={theme.colors.white} size="sm" />
                    </Flex>
                  }
                  onClick={() => {}}
                  _hover={{
                    color: theme.colors.white,
                    borderColor: theme.colors.accentThree,
                    bg: theme.colors.accentThree,
                  }}
                >
                  REPAIR
                </Button>
              </Flex>
            </Box>
            <Button
              borderWidth="2px"
              borderColor={theme.colors.primary}
              bg={theme.colors.secondary}
              borderRadius="30px"
              fontWeight="700"
              fontSize="1.25rem"
              fontFamily={theme.fonts.body}
              w="25rem"
              mb="1rem"
              h="3.5rem"
              color={theme.colors.white}
              isDisabled={sleigh == null}
              isLoading={sleigh == null}
              spinner={
                <Flex flexDirection="row" align="center">
                  <Spinner color={theme.colors.white} size="sm" />
                </Flex>
              }
              onClick={() => {}}
              _hover={{
                color: theme.colors.white,
                borderColor: theme.colors.primary,
                bg: theme.colors.primary,
              }}
            >
              RETIRE SLEIGH
            </Button>
          </Flex>
        </Flex>
      ) : (
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
            SHUCKS, SELECT A SLEIGH WILL YA!
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
