import { apiRequest } from ".";
import axios from "axios";
import { Bonkers } from "../program/bonkers_program";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  VersionedTransaction,
  TransactionMessage,
  TransactionInstruction,
} from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import { Buffer } from "buffer";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
const bonkersIDL = require("../program/bonkers_program.json");
const BONKERS_PROGRAM_PROGRAMID =
  "9ejfcqQpWYQqXMiPeZVHhhbNu3qufuLWzGzVEBQYBEgS";

export const createSleighTx = async (
  _sleighId: bigint,
  stakeAmt: number,
  connection: Connection,
  publicKey: PublicKey
) => {
  if (!publicKey || !connection || !stakeAmt || !_sleighId)
    throw Error("All inputs required");

  try {
    const sleighIdHex = _sleighId.toString(16);
    const sleighIdBN = new BN(sleighIdHex, 16);
    const BONKERS_PROGRAM: Program<Bonkers> = new Program(
      bonkersIDL,
      BONKERS_PROGRAM_PROGRAMID,
      { connection }
    );

    const sleighOwner = publicKey;
    const systemProgram = SystemProgram.programId;

    const gameSettingsPubkey = new PublicKey("...");
    const gameRollsPubkey = new PublicKey("...");
    const sleighPubkey = new PublicKey("..."); // PDA?
    const gameTokenAtaPubkey = new PublicKey("...");
    const sleighOwnerAtaPubkey = new PublicKey("...");
    const coinMintPubkey = new PublicKey("...");
    const tokenProgramPubkey = new PublicKey("...");

    // Create the instruction
    const ix = await BONKERS_PROGRAM.methods
      .createSleigh(sleighIdBN, new BN(stakeAmt))
      .accounts({
        sleighOwner,
        systemProgram,
        gameSettings: gameSettingsPubkey,
        gameRolls: gameRollsPubkey,
        sleigh: sleighPubkey,
        gameTokenAta: gameTokenAtaPubkey,
        sleighOwnerAta: sleighOwnerAtaPubkey,
        coinMint: coinMintPubkey,
        tokenProgram: tokenProgramPubkey,
      })
      .instruction();

    const { blockhash } = await connection!.getLatestBlockhash();
    console.log("bh: ", blockhash);

    const txMsg = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToLegacyMessage();

    const tx = new VersionedTransaction(txMsg);
    if (!tx) throw Error("Tx not found");
    console.log("Tx: ", tx);
    return tx;
  } catch (error) {
    console.error("Error building tx: ", error);
  }
};
