import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Box } from "@chakra-ui/react";
import theme from "@/styles/theme";
import LoginPage from "./login";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>its BONKers</title>
        <meta name="description" content="Stake BONK 4 sleighs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        h="100vh"
        w="100vw"
        bg={theme.colors.background}
        color="white"
        fontFamily="Montserrat"
      >
        <LoginPage />
      </Box>
    </>
  );
}
