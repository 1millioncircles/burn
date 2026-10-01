import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// yoooo what's up welcome to the code for this particular part of this website. I wrote this from scratch with chat gpt 5.2's help over around 100 queries and around 6-8 legitimate hours of work. This was my first time really ever coding anything blockchain transaction related and I truly built this page from the ground up. I'm not sure if it could be simplified more because I ran into many errors along the way trying to get it to really connect but here it is, a very simple burn function with 1000:1 ratio, caps at 1 million circles. This exact blockchain code on this page was the biggest hurdle mentally that I had been facing for the past 6 months since coming up with this idea in regards to preparation. I'd considered hiring someone but I didn't want to invite a lack of security, so here we are. Thank you for reading. I hope you have a wonderful day
// september 25 2025 rpcs and other shit have changed the way the code works and it broke a few weeks ago, been trying to figure it out and i hope this fucking works. chatGPT 5.6
// september 30 2026 rebuilt burn send: fresh blockhash, confirm with lastValidBlockHeight, silent RPC fallback. stay round.

const CIRCLES_MINT = new PublicKey(
  "Aea8zJW7jp1wkct3BjMeekBC1RQnHQyrvNutigc3pump"
);

const DECIMALS = 6;
const TOKENS_PER_CIRCLE = 1000;
const UNITS_PER_CIRCLE = BigInt(TOKENS_PER_CIRCLE) * 10n ** BigInt(DECIMALS);
const MAX_PHYSICAL = 1_000_000;

const ENDPOINTS = [
  "https://solana.drpc.org",
  "https://solana-rpc.publicnode.com",
  "https://rpc.ankr.com/solana",
  "https://api.mainnet-beta.solana.com",
];

async function withWorkingConnection(preferred, fn) {
  const urls = [preferred, ...ENDPOINTS.filter((url) => url !== preferred)];
  let lastError;
  for (const url of urls) {
    try {
      const connection = new Connection(url, "confirmed");
      return await fn(connection);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export default function BurnPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [tokenBalance, setTokenBalance] = useState("0");
  const [physicalCircles, setPhysicalCircles] = useState("0");
  const [rawBalance, setRawBalance] = useState(0n);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const loadBalance = useCallback(async () => {
    if (!publicKey) {
      setTokenBalance("0");
      setPhysicalCircles("0");
      setRawBalance(0n);
      return;
    }

    try {
      await withWorkingConnection(connection.rpcEndpoint, async (conn) => {
        const tokenAccount = await getAssociatedTokenAddress(
          CIRCLES_MINT,
          publicKey,
          false,
          TOKEN_PROGRAM_ID
        );
        const balance = await conn.getTokenAccountBalance(tokenAccount);
        const raw = BigInt(balance.value.amount);
        setRawBalance(raw);
        setTokenBalance(balance.value.uiAmountString || "0");
        setPhysicalCircles((raw / UNITS_PER_CIRCLE).toLocaleString());
      });
      setStatus("");
    } catch (error) {
      console.error(error);
      setTokenBalance("0");
      setPhysicalCircles("0");
      setRawBalance(0n);
      setStatus("No CIRCLES tokens found in this wallet.");
    }
  }, [connection, publicKey]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  async function burnTokens() {
    if (!publicKey) {
      setStatus("Connect your wallet first.");
      return;
    }

    const circlesToBurn = Number(amount);
    if (!Number.isInteger(circlesToBurn) || circlesToBurn < 1) {
      setStatus("Enter a whole number of physical circles.");
      return;
    }
    if (circlesToBurn > MAX_PHYSICAL) {
      setStatus("Caps at 1,000,000 physical circles.");
      return;
    }

    const burnAmount = BigInt(circlesToBurn) * UNITS_PER_CIRCLE;
    if (burnAmount > rawBalance) {
      setStatus("Not enough $CIRCLES for that many physical circles.");
      return;
    }

    const ok = window.confirm(
      `Burn ${circlesToBurn * TOKENS_PER_CIRCLE} CIRCLES for ${circlesToBurn} physical circle(s)?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      setStatus("Waiting for wallet approval...");

      const signature = await withWorkingConnection(
        connection.rpcEndpoint,
        async (conn) => {
          const tokenAccount = await getAssociatedTokenAddress(
            CIRCLES_MINT,
            publicKey,
            false,
            TOKEN_PROGRAM_ID
          );

          const instruction = createBurnCheckedInstruction(
            tokenAccount,
            CIRCLES_MINT,
            publicKey,
            burnAmount,
            DECIMALS,
            [],
            TOKEN_PROGRAM_ID
          );

          const { blockhash, lastValidBlockHeight } =
            await conn.getLatestBlockhash("confirmed");

          const transaction = new Transaction({
            feePayer: publicKey,
            blockhash,
            lastValidBlockHeight,
          }).add(instruction);

          const sig = await sendTransaction(transaction, conn, {
            skipPreflight: false,
            maxRetries: 3,
          });

          const result = await conn.confirmTransaction(
            { signature: sig, blockhash, lastValidBlockHeight },
            "confirmed"
          );

          if (result.value.err) {
            throw new Error("Chain rejected the burn.");
          }

          return sig;
        }
      );

      setStatus(`Burn successful. ${signature}`);
      setAmount("");
      await loadBalance();
      router.push({
        pathname: "/redeem",
        query: { sig: signature, circles: String(circlesToBurn) },
      });
    } catch (error) {
      console.error(error);
      const msg = String(error?.message || error);
      if (/User rejected|rejected the request/i.test(msg)) {
        setStatus("Cancelled in wallet.");
      } else {
        setStatus(msg ? `Burn failed: ${msg}` : "Burn failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "30px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Burn CIRCLES</h1>
      <p>
        <strong>1000 CIRCLES token = 1 physical circle</strong>
      </p>

      <div style={{ margin: "25px" }}>
        <WalletMultiButton />
      </div>

      {connected && publicKey && (
        <>
          <p>
            CIRCLES token: <strong>{tokenBalance}</strong>
          </p>
          <p>
            Physical circles available: <strong>{physicalCircles}</strong>
          </p>

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Number of physical circles"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              marginTop: "20px",
              fontSize: "16px",
            }}
          />

          <button
            onClick={burnTokens}
            disabled={busy}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "15px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {busy ? "burning..." : "🔥 BURN NOW"}
          </button>

          <p style={{ marginTop: "20px" }}>
Blockchain transactions are irreversible.
<br />
Burn at your own risk.
<br />
By clicking this button you confirm that you understand and accept all responsibility.
To redeem your physical circles, you must claim within 24 hours by emailing 1millioncircles@gmail.com.
<br />
Unclaimed circles will be destroyed.
<br />
Thank you for truly supporting the 1 million circles project.          </p>
        </>
      )}

      {status && (
        <p style={{ marginTop: "20px", wordBreak: "break-word" }}>{status}</p>
      )}
    </main>
  );
}
