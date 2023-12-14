import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { SolanaProvider } from "@/contexts/SolanaProvider";
import { Toaster } from "react-hot-toast";
import theme from "@/styles/theme";
import { Irish_Grover, IBM_Plex_Mono } from "next/font/google";

const queryClient = new QueryClient();

const headerFont = Irish_Grover({ weight: ["400"], subsets: ["latin"] });
const bodyFont = IBM_Plex_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          html {
            --header: ${headerFont.style.fontFamily};
            --body: ${bodyFont.style.fontFamily};
          }
        `}
      </style>
      <SolanaProvider>
        <ChakraProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
            <Toaster />
          </QueryClientProvider>
        </ChakraProvider>
      </SolanaProvider>
    </>
  );
}
