import { apiRequest } from ".";
import axios from "axios";
import { Bonkers } from "../program/bonkers";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getAccount,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  VersionedTransaction,
  TransactionMessage,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  BN,
  web3,
  Instruction,
} from "@coral-xyz/anchor";
import { Buffer } from "buffer";
import toast from "react-hot-toast";
//@ts-ignore
import { ByteifyEndianess, serializeUint64 } from "byteify";
// import {
//   globalGameId,
//   LANDING_GEAR_MINT_ADDRESS,
//   NAVIGATION_MINT_ADDRESS,
//   PRESENTS_BAG_MINT_ADDRESS,
//   PROPULSION_MINT_ADDRESS,
//   SPL_TOKENS,
//   TOKEN_MINT_ADDRESS,
// } from "@/constants";
import { GameRolls, GameSettings, Sleigh } from "@/types/types";
import { encode } from "bs58";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

const bonkersIDL = require("../program/bonkers.json");
const BONKERS_PROGRAM_PROGRAMID =
  "DYjXGPz5HGneqvA7jsgRVKTTaeoarCPNCH6pr9Lu2L3F";

export const getGameSettings = async (
  globalGameId: number | null,
  connection: Connection
): Promise<GameSettings | undefined> => {
  if (!globalGameId) {
    throw Error("No game id found");
  }
  try {
    const BONKERS_PROGRAM: Program<any> = new Program(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      { connection }
    );

    const gameSettingsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("settings"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];

    const gameSettingsAccount =
      await BONKERS_PROGRAM.account.gameSettings.fetch(gameSettingsPDA);
    return gameSettingsAccount as GameSettings;
  } catch (error) {
    console.error("Error getting game settings: ", error);
    return undefined;
  }
};

export const getGameRolls = async (
  globalGameId: number | null,
  connection: Connection,
  stage: string
): Promise<GameRolls> => {
  if (!globalGameId) {
    throw Error("No game id found");
  }
  try {
    const program = new Program<Bonkers>(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      {
        connection,
      }
    );

    const prefix = stage === "BUILD" ? "game_rolls_stg1" : "game_rolls_stg2";

    const gameRollsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from(prefix),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];

    const gameRollsAccount = await connection.getAccountInfo(gameRollsPDA);

    if (gameRollsAccount === null) {
      console.error("Game rolls account not found");
      return { rolls: [] };
    }

    const gameRollsData = await program.account.gameRolls.fetch(gameRollsPDA);

    return gameRollsData;
  } catch (error) {
    console.error("Error fetching game rolls: ", error);
    return { rolls: [] };
  }
};

export const getCurrentSleighs = async (
  globalGameId: number | null,
  sleighOwnerPublicKey: PublicKey | null,
  connection: Connection
): Promise<Sleigh[] | undefined> => {
  try {
    if (!sleighOwnerPublicKey) {
      throw Error("No public key found");
    }
    if (!globalGameId) {
      throw Error("No game id found");
    }
    const BONKERS_PROGRAM: Program<any> = new Program(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      { connection }
    );

    const sleighs = await BONKERS_PROGRAM.account.sleigh.all([
      {
        memcmp: {
          offset: 8,
          bytes: sleighOwnerPublicKey.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 8 + 32 + 8 + 1,
          bytes: encode(new BN(globalGameId).toArrayLike(Buffer, "le", 8)),
        },
      },
    ]);

    console.log("sleighs found: ", sleighs);

    return sleighs.map((accountInfo) => accountInfo.account) as Sleigh[];
  } catch (error) {
    console.error("Error getting current sleighs: ", error);
    return undefined;
  }
};

export const createSleighTx = async (
  globalGameId: number | null,
  tokenMintAddress: PublicKey,
  _sleighId: bigint,
  stakeAmt: number,
  connection: Connection,
  publicKey: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (!publicKey || !connection || !stakeAmt || !_sleighId || !globalGameId) {
    console.error("All createSleigh inputs required");
    return undefined;
  }

  try {
    const sleighIdBN = new BN(_sleighId.toString());

    const BONKERS_PROGRAM: Program<Bonkers> = new Program(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      { connection }
    );
    const sleighOwner = publicKey;
    const systemProgram = SystemProgram.programId;
    const gameSettingsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("settings"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const gameRollsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("game_rolls_stg1"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const sleighPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("sleigh"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
        Uint8Array.from(
          serializeUint64(BigInt(sleighIdBN.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];

    const gameTokenAta = getAssociatedTokenAddressSync(
      tokenMintAddress,
      gameSettingsPDA,
      true
    );
    const sleighOwnerAta = getAssociatedTokenAddressSync(
      tokenMintAddress,
      publicKey
    );

    // Create the instruction
    const ix = await BONKERS_PROGRAM.methods
      .createSleigh(sleighIdBN, new BN(stakeAmt))
      .accounts({
        sleighOwner,
        systemProgram,
        gameSettings: gameSettingsPDA,
        gameRolls: gameRollsPDA,
        sleigh: sleighPDA,
        gameTokenAta: gameTokenAta,
        sleighOwnerAta: sleighOwnerAta,
        coinMint: tokenMintAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    if (!ix) {
      console.error("Error retiring sleigh. ix: ", ix);
      return undefined;
    }

    const tx = await createTx(ix, connection, publicKey);
    console.info(
      "createSleigh ENCODED UNSIGNED TX: ",
      Buffer.from(tx!.serialize()).toString("base64")
    );

    if (!tx) {
      console.error("Error with claiming levels tx. tx: ", tx);
      return undefined;
    }
    return tx;
  } catch (error) {
    console.error("Error building tx: ", error);
    return undefined;
  }
};

export const claimLevelsTx = async (
  globalGameId: number | null,
  _sleighId: bigint,
  rollIndexes: BN[],
  connection: Connection,
  publicKey: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (
    !publicKey ||
    !connection ||
    !rollIndexes ||
    !_sleighId ||
    !globalGameId
  ) {
    console.error("All claimLevels inputs required");
    return undefined;
  }

  try {
    const sleighIdBN = new BN(_sleighId.toString());

    const rollIndexesBN = rollIndexes.map((index) => new BN(index));

    const BONKERS_PROGRAM: Program<any> = new Program(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      { connection }
    );

    const sleighOwner = publicKey;
    const gameSettingsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("settings"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const gameRollsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("game_rolls_stg1"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const sleighPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("sleigh"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
        Uint8Array.from(
          serializeUint64(BigInt(sleighIdBN.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];

    const ix = await BONKERS_PROGRAM.methods
      .claimLevels(sleighIdBN)
      .accounts({
        sleigh: sleighPDA,
        gameSettings: gameSettingsPDA,
        gameRolls: gameRollsPDA,
      })
      .instruction();

    if (!ix) {
      console.error("Error claiming levels. ix: ", ix);
      return undefined;
    }

    const tx = await createTx(ix, connection, publicKey);
    console.info(
      "claim ENCODED UNSIGNED TX: ",
      Buffer.from(tx!.serialize()).toString("base64")
    );

    if (!tx) {
      console.error("Error with claiming levels tx. tx: ", tx);
      return undefined;
    }
    return tx;
  } catch (error) {
    console.error("Error in claiming levels tx: ", error);
    return undefined;
  }
};

export const deliveryTx = async (
  globalGameId: number | null,
  _sleighId: bigint,
  connection: Connection,
  publicKey: PublicKey,
  propulsionMintAddress: PublicKey,
  landingGearMintAddress: PublicKey,
  navigationMintAddress: PublicKey,
  presentsBagMintAddress: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (!publicKey || !connection || !_sleighId || !globalGameId) {
    console.error("All delivery inputs required");
    return undefined;
  }

  try {
    const sleighIdBN = new BN(_sleighId.toString());
    const BONKERS_PROGRAM: Program<any> = new Program(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      { connection }
    );

    const gameSettingsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("settings"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const gameRollsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("game_rolls_stg2"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const sleighPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("sleigh"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
        Uint8Array.from(
          serializeUint64(BigInt(sleighIdBN.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];

    const sleighPropulsionPartsAta = getAssociatedTokenAddressSync(
      propulsionMintAddress,
      publicKey
    );
    const sleighLandingGearPartsAta = getAssociatedTokenAddressSync(
      landingGearMintAddress,
      publicKey
    );
    const sleighNavigationPartsAta = getAssociatedTokenAddressSync(
      navigationMintAddress,
      publicKey
    );
    const sleighPresentsBagPartsAta = getAssociatedTokenAddressSync(
      presentsBagMintAddress,
      publicKey
    );

    const ix = await BONKERS_PROGRAM.methods
      .delivery()
      .accounts({
        gameSettings: gameSettingsPDA,
        gameRolls: gameRollsPDA,
        sleigh: sleighPDA,
        sleighLandingGearPartsAta: sleighLandingGearPartsAta,
        sleighNavigationPartsAta: sleighNavigationPartsAta,
        sleighPresentsBagPartsAta: sleighPresentsBagPartsAta,
        sleighPropulsionPartsAta: sleighPropulsionPartsAta,
        landingGearMint: landingGearMintAddress,
        navigationMint: navigationMintAddress,
        presentsBagMint: presentsBagMintAddress,
        propulsionMint: propulsionMintAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const { blockhash } = await connection.getLatestBlockhash();

    if (!ix) {
      console.error("Error delivering. ix: ", ix);
      return undefined;
    }

    const tx = await createTx(ix, connection, publicKey);
    console.info(
      "delivery ENCODED UNSIGNED TX: ",
      Buffer.from(tx!.serialize()).toString("base64")
    );

    if (!tx) {
      console.error("Error with delivery tx. tx: ", tx);
      return undefined;
    }
    return tx;
  } catch (error) {
    console.error("Error in delivery tx: ", error);
    return undefined;
  }
};

export const repairSleighTx = async (
  globalGameId: number | null | null,
  _sleighId: bigint,
  repairDetails: {
    propulsion: number;
    landingGear: number;
    navigation: number;
    presentsBag: number;
  },
  connection: Connection,
  publicKey: PublicKey,
  propulsionMintAddress: PublicKey,
  landingGearMintAddress: PublicKey,
  navigationMintAddress: PublicKey,
  presentsBagMintAddress: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (
    !publicKey ||
    !connection ||
    !repairDetails ||
    !_sleighId ||
    !globalGameId
  ) {
    console.error("All reapirSleigh inputs required");
    return undefined;
  }

  try {
    const sleighIdBN = new BN(_sleighId.toString());

    const BONKERS_PROGRAM: Program<any> = new Program(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      { connection }
    );

    const sleighOwner = publicKey;
    const sleighPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("sleigh"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
        Uint8Array.from(
          serializeUint64(BigInt(sleighIdBN.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const gameSettingsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("settings"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const sleighPropulsionPartsAta = getAssociatedTokenAddressSync(
      propulsionMintAddress,
      publicKey
    );
    const sleighLandingGearPartsAta = getAssociatedTokenAddressSync(
      landingGearMintAddress,
      publicKey
    );
    const sleighNavigationPartsAta = getAssociatedTokenAddressSync(
      navigationMintAddress,
      publicKey
    );
    const sleighPresentsBagPartsAta = getAssociatedTokenAddressSync(
      presentsBagMintAddress,
      publicKey
    );

    const ix = await BONKERS_PROGRAM.methods
      .repair(
        repairDetails.propulsion,
        repairDetails.landingGear,
        repairDetails.navigation,
        repairDetails.presentsBag
      )
      .accounts({
        sleighOwner,
        sleigh: sleighPDA,
        gameSettings: gameSettingsPDA,
        sleighPropulsionPartsAta: sleighPropulsionPartsAta,
        sleighLandingGearPartsAta: sleighLandingGearPartsAta,
        sleighNavigationPartsAta: sleighNavigationPartsAta,
        sleighPresentsBagPartsAta: sleighPresentsBagPartsAta,
        propulsionMint: propulsionMintAddress,
        landingGearMint: landingGearMintAddress,
        navigationMint: navigationMintAddress,
        presentsBagMint: presentsBagMintAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    if (!ix) {
      console.error("Error repairing sleigh. ix: ", ix);
      return undefined;
    }

    const tx = await createTx(ix, connection, publicKey);
    console.info(
      "repair ENCODED UNSIGNED TX: ",
      Buffer.from(tx!.serialize()).toString("base64")
    );
    if (!tx) {
      console.error("Error with repair tx. tx: ", tx);
      return undefined;
    }
    return tx;
  } catch (error) {
    console.error("Error in repair tx: ", error);
    return undefined;
  }
};

export const retireSleighTx = async (
  globalGameId: number | null,
  _sleighId: BN,
  connection: Connection,
  publicKey: PublicKey,
  tokenMintAddress: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (!publicKey || !connection || !_sleighId || !globalGameId) {
    console.error("All retireSleigh inputs required");
    return undefined;
  }

  try {
    const BONKERS_PROGRAM: Program<any> = new Program(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      { connection }
    );

    const sleighOwner = publicKey;
    const sleighPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("sleigh"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
        Uint8Array.from(
          serializeUint64(BigInt(_sleighId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const gameSettingsPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("settings"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    PublicKey.findProgramAddressSync(
      [
        Buffer.from("settings"),
        Uint8Array.from(
          serializeUint64(BigInt(globalGameId.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];

    const gameTokenAta = getAssociatedTokenAddressSync(
      tokenMintAddress,
      gameSettingsPDA,
      true
    );
    const sleighOwnerAta = getAssociatedTokenAddressSync(
      tokenMintAddress,
      publicKey
    );
    const coinMintAddress = tokenMintAddress;

    const ix = await BONKERS_PROGRAM.methods
      .retire()
      .accounts({
        sleighOwner,
        sleigh: sleighPDA,
        gameSettings: gameSettingsPDA,
        gameTokenAta: gameTokenAta,
        sleighOwnerAta: sleighOwnerAta,
        coinMint: coinMintAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    if (!ix) {
      console.error("Error retiring sleigh. ix: ", ix);
      return undefined;
    }

    const tx = await createTx(ix, connection, publicKey);
    console.log(
      "retire ENCODED UNSIGNED TX: ",
      Buffer.from(tx!.serialize()).toString("base64")
    );

    if (!tx) {
      console.error("Error with retire tx. tx: ", tx);
      return undefined;
    }
    return tx;
  } catch (error) {
    console.error("Error in retiring sled tx: ", error);
    return undefined;
  }
};

export const createTx = async (
  ix: TransactionInstruction,
  connection: Connection,
  publicKey: PublicKey
): Promise<VersionedTransaction | undefined> => {
  try {
    const { blockhash } = await connection.getLatestBlockhash();
    console.log("latest bh: ", blockhash);

    const txMsg = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToLegacyMessage();

    const tx = new VersionedTransaction(txMsg);
    if (!tx) {
      console.error("Error creating tx for ix: ", ix, " with tx: ", tx);
      return undefined;
    }
    return tx;
  } catch (error) {
    console.error("Error creating tx: ", error);
    return undefined;
  }
};

export const signAndSendTransaction = async ({
  connection,
  ixs,
  wallet,
  signTransaction,
}: {
  connection: Connection;
  ixs: TransactionInstruction[];
  wallet: string;
  signTransaction: any;
}) => {
  if (!wallet || !ixs || !signTransaction) return;
  const { blockhash } = await connection!.getLatestBlockhash();
  console.log("bh: ", blockhash);

  const txMsg = new TransactionMessage({
    payerKey: new PublicKey(wallet),
    recentBlockhash: blockhash,
    instructions: ixs,
  }).compileToLegacyMessage();

  const tx = new VersionedTransaction(txMsg);
  if (!tx) {
    toast.error("Failed to create parallel tx");
    console.error("Failed to create parallel tx: ", tx);
    return;
  }

  const signedTx = await signTransaction(tx);
  return await connection.sendRawTransaction(signedTx.serialize());
};

export const sendAllTxParallel = async (
  connection: Connection,
  ixs: TransactionInstruction[],
  walletAddress: PublicKey,
  signAllTransactions: any
) => {
  try {
    const maxIxsInTx = 10;
    let txs = [];
    for (let i = 0; i < ixs.length; i += maxIxsInTx) {
      const messageV0 = new TransactionMessage({
        payerKey: walletAddress,
        recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
        instructions: ixs.slice(
          i,
          i + maxIxsInTx > ixs.length ? ixs.length : i + maxIxsInTx
        ),
      }).compileToLegacyMessage();
      const tx = new VersionedTransaction(messageV0);
      txs.push(tx);
    }
    signAllTransactions(txs)
      .then((sTxs: any) => {
        let sigs: Promise<string>[] = [];
        for (let stx of sTxs) {
          console.log(Buffer.from(stx.serialize()).toString("base64"));
          sigs.push(connection.sendRawTransaction(stx.serialize()));
        }
        Promise.all(sigs).then((sigs: string[]) => {
          console.log(sigs);
          toast.success("Sent all transactions successfully!");
        });
      })
      .catch((e: Error) => {
        console.error(e);
        toast.error("Something went wrong sending transactions");
      });
  } catch (e) {
    throw e;
  }
};

export const getBonkBalance = async ({
  walletAddress,
  connection,
  bonkMintAddress,
}: {
  walletAddress: string;
  connection: Connection;
  bonkMintAddress: string;
}) => {
  const bonkBalance = await getTokenAccountBalance(
    walletAddress,
    connection,
    bonkMintAddress
  );

  return bonkBalance;
};

export const getWalletTokenBalance = async ({
  walletAddress,
  connection,
  tokenMint,
}: {
  walletAddress: PublicKey;
  connection: Connection;
  tokenMint: string;
}) => {
  const tokenAccount = await getAccount(
    connection,
    getAssociatedTokenAddressSync(new PublicKey(tokenMint), walletAddress)
  );

  // console.log("tokenAccount.amount: ", tokenAccount.amount.toString());

  return tokenAccount.amount;
};

export async function getTokenAccountBalance(
  wallet: string,
  solanaConnection: Connection,
  mint: string
) {
  const filters: any[] = [
    {
      dataSize: 165, //size of account (bytes)
    },
    {
      memcmp: {
        offset: 32, //location of our query in the account (bytes)
        bytes: wallet, //our search criteria, a base58 encoded string
      },
    },
  ];

  const accounts = await solanaConnection?.getParsedProgramAccounts(
    new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // TOKEN_PROGRAM_ID
    { filters: filters }
  );

  // console.log(
  //   `Found ${accounts.length} token account(s) for wallet ${wallet}.`
  // );

  let retTokenBalance: number = 0;
  accounts.forEach((account, i) => {
    //Parse the account data
    const parsedAccountInfo: any = account.account.data;
    const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
    const tokenBalance: number =
      parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];

    //Log results
    // console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
    // console.log(`--Token Mint: ${mintAddress}`);
    // console.log(`--Token Balance: ${tokenBalance}`);

    if (mintAddress === mint) {
      retTokenBalance = tokenBalance;
    }
  });

  return retTokenBalance;
}

export const fetchCurrentSlot = async (
  connection: Connection
): Promise<number> => {
  try {
    const currentSlot = await connection.getSlot();
    console.log("currentSlot: ", currentSlot);

    if (!currentSlot) {
      console.error("slot not found");
      throw Error("Slot does not exist");
    }

    return currentSlot;
  } catch (error) {
    console.error("Error fetching slot: ", error);
    return 0;
  }
};
