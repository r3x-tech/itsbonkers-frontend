import Head from "next/head";
import { Flex } from "@chakra-ui/react";
import LoginPage from "./login";

export default function Home() {
  return (
    <>
      <Head>
        <title>its BONKers</title>
        <meta name="description" content="Stake BONK 4 sleighs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex w="100%">
        <LoginPage />
      </Flex>
    </>
  );
}
