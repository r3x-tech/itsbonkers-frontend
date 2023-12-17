import { apiRequest } from ".";
import axios from "axios";
import { Bonkers } from "../program/bonkers_program";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
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
import { GAME_ID, TOKEN_MINT_ADDRESS } from "@/constants";
// import ByteifyEndianess from "byteify";
// import serializeUint64 from "byteify";

const bonkersIDL = require("../program/bonkers_program.json");
const BONKERS_PROGRAM_PROGRAMID =
  "DYjXGPz5HGneqvA7jsgRVKTTaeoarCPNCH6pr9Lu2L3F";

export const createSleighTx = async (
  _sleighId: bigint,
  stakeAmt: number,
  connection: Connection,
  publicKey: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (!publicKey || !connection || !stakeAmt || !_sleighId) {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
      new PublicKey(TOKEN_MINT_ADDRESS),
      gameSettingsPDA
    );
    const sleighOwnerAta = getAssociatedTokenAddressSync(
      new PublicKey(TOKEN_MINT_ADDRESS),
      publicKey
    );
    const coinMintAddress = new PublicKey(TOKEN_MINT_ADDRESS);

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
        coinMint: coinMintAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    if (!ix) {
      console.error("Error retiring sleigh. ix: ", ix);
      return undefined;
    }

    const tx = await createTx(ix, connection, publicKey);
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
  _sleighId: bigint,
  rollIndexes: number[],
  connection: Connection,
  publicKey: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (!publicKey || !connection || !rollIndexes || !_sleighId) {
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
    const sleighPDA = PublicKey.findProgramAddressSync(
      [
        Buffer.from("sleigh"),
        Uint8Array.from(
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];

    const ix = await BONKERS_PROGRAM.methods
      .claimLevels(sleighIdBN, rollIndexesBN)
      .accounts({
        sleighOwner: sleighOwner,
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
  _sleighId: bigint,
  connection: Connection,
  publicKey: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (!publicKey || !connection || !_sleighId) {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
    const sleighPropulsionPartsAta = new PublicKey("...");
    const sleighLandingGearPartsAta = new PublicKey("...");
    const sleighNavigationPartsAta = new PublicKey("...");
    const sleighPresentsBagPartsAta = new PublicKey("...");
    const propulsionMintAddress = new PublicKey("...");
    const landingGearMintAddress = new PublicKey("...");
    const navigationAddress = new PublicKey("...");
    const presentsBagMintAddress = new PublicKey("...");

    const ix = await BONKERS_PROGRAM.methods
      .delivery()
      .accounts({
        gameSettings: gameSettingsPDA,
        gameRolls: gameRollsPDA,
        sleigh: sleighPDA,
        sleighPropulsionPartsAta: sleighPropulsionPartsAta,
        sleighLandingGearPartsAta: sleighLandingGearPartsAta,
        sleighNavigationPartsAta: sleighNavigationPartsAta,
        sleighPresentsBagPartsAta: sleighPresentsBagPartsAta,
        propulsionMint: propulsionMintAddress,
        landingGearMint: landingGearMintAddress,
        navigationMint: navigationAddress,
        presentsBagMint: presentsBagMintAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const { blockhash } = await connection.getLatestBlockhash();
    const txMsg = new web3.TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToLegacyMessage();

    if (!ix) {
      console.error("Error delivering. ix: ", ix);
      return undefined;
    }

    const tx = await createTx(ix, connection, publicKey);
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
  _sleighId: bigint,
  repairDetails: {
    propulsion: number;
    landingGear: number;
    navigation: number;
    presentsBag: number;
  },
  connection: Connection,
  publicKey: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (!publicKey || !connection || !repairDetails || !_sleighId) {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];
    const sleighPropulsionPartsAta = new PublicKey("...");
    const sleighLandingGearPartsAta = new PublicKey("...");
    const sleighNavigationPartsAta = new PublicKey("...");
    const sleighPresentsBagPartsAta = new PublicKey("...");
    const propulsionMintAddress = new PublicKey("...");
    const landingGearMintAddress = new PublicKey("...");
    const navigationMintAddress = new PublicKey("...");
    const presentsBagMintAddress = new PublicKey("...");

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
  _sleighId: bigint,
  connection: Connection,
  publicKey: PublicKey
): Promise<VersionedTransaction | undefined> => {
  if (!publicKey || !connection || !_sleighId) {
    console.error("All retireSleigh inputs required");
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
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
          serializeUint64(BigInt(GAME_ID.toString()), {
            endianess: ByteifyEndianess.BIG_ENDIAN,
          })
        ),
      ],
      new PublicKey(BONKERS_PROGRAM_PROGRAMID)
    )[0];

    const gameTokenAta = getAssociatedTokenAddressSync(
      new PublicKey(TOKEN_MINT_ADDRESS),
      gameSettingsPDA
    );
    const sleighOwnerAta = getAssociatedTokenAddressSync(
      new PublicKey(TOKEN_MINT_ADDRESS),
      publicKey
    );
    const coinMintAddress = new PublicKey(TOKEN_MINT_ADDRESS);

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

    const txMsg = new web3.TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToLegacyMessage();

    const tx = new web3.VersionedTransaction(txMsg);
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
