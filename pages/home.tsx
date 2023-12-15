import { Navbar } from "@/components/Navbar";
import { SleighComponent } from "@/components/SleighComponent";
import { sampleSleighs } from "@/stores/sampleData";
import userStore from "@/stores/userStore";
// import userStore from "@/stores/userStore";
import theme from "@/styles/theme";
import { Sleigh } from "@/types/types";
import { Box, Image, Flex, Grid, Input, Text, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";

function HomePage() {
  const { loggedIn } = userStore();
  const router = useRouter();

  const [selectedSleigh, setSelectedSleigh] = useState<Sleigh | null>(null);

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
                mt="1.25rem"
                w="100%"
                gap="1.5rem"
              >
                {sampleSleighs.map((sleigh, index) => (
                  <SleighComponent
                    key={index}
                    sleigh={sleigh}
                    onSelect={handleSelectSleigh}
                    isSelected={
                      !!(selectedSleigh && selectedSleigh.name === sleigh.name)
                    }
                  />
                ))}
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
