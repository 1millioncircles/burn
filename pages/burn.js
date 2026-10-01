import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

// yoooo what's up welcome to the code for this particular part of this website. I wrote this from scratch with chat gpt 5.2's help over around 100 queries and around 6-8 legitimate hours of work. This was my first time really ever coding anything blockchain transaction related and I truly built this page from the ground up. I'm not sure if it could be simplified more because I ran into many errors along the way trying to get it to really connect but here it is, a very simple burn function with 1000:1 ratio, caps at 1 million circles. This exact blockchain code on this page was the biggest hurdle mentally that I had been facing for the past 6 months since coming up with this idea in regards to preparation. I'd considered hiring someone but I didn't want to invite a lack of security, so here we are. Thank you for reading. I hope you have a wonderful day
// september 25 2025 rpcs and other shit have changed the way the code works and it broke a few weeks ago, been trying to figure it out and i hope this fucking works. chatGPT 5.6
// september 30 2026 rebuilt burn send: fresh blockhash, confirm with lastValidBlockHeight. easter eggs restored from the january page. stay round.

const CIRCLES_MINT = new PublicKey(
  "Aea8zJW7jp1wkct3BjMeekBC1RQnHQyrvNutigc3pump"
);

const DECIMALS = 6;
const TOKENS_PER_CIRCLE = 1000;
const UNITS_PER_CIRCLE = BigInt(TOKENS_PER_CIRCLE) * 10n ** BigInt(DECIMALS);
const MAX_PHYSICAL = 1_000_000n;
const RPC = "https://solana.drpc.org";

function eggFor(circles) {
  return circles === 1n
    ? "AN ARTIST RESPECTS THE CIRCLE THAT SERVES AS THE FOUNDATION OF CREATIVITY"
    : circles === 10n
    ? "Tetractys, the 4th triangular number."
    : circles === 12n
    ? "Eggs? Donuts? Bagels? Clock? Zodiac? Grades? Jurors? Inches? Vinyl? Roses? Tribes? Apostles? Olympians? Cheaper by the... "
    : circles === 13n
    ? "There isn't even an elevator button for this..."
    : circles === 15n
    ? "The 5th triangular number."
    : circles === 18n
    ? "חַי"
    : circles === 21n
    ? "What's 9 + 10? Blackjack. The 6th triangular number. "
    : circles === 22n
    ? "I don't know about you... "
    : circles === 27n
    ? "I said your name 27 times, would that bring you back to life? Don't join the club. The 7th triangular number."
    : circles === 32n
    ? "Paths of creation, LEV!!!"
    : circles === 33n
    ? "Highest honorary degree, vertebrae in the spine."
    : circles === 34n
    ? "You sick freak. "
    : circles === 36n
    ? "(1³+2³+3³=36), Roll two dice, Lamed Vavniks, the 8th triangular number."
    : circles === 42n
    ? "Don't forget to bring a towel."
    : circles === 45n
    ? "אָדָם"
    : circles === 52n
    ? "Weeks in the year and cards in the deck."
    : circles === 55n
    ? "Shfifty-five. "
    : circles === 64n
    ? "Squares on a chessboard. "
    : circles === 67n
    ? "6 - 7? What are you, in middle school?"
    : circles === 68n
    ? "It's like 69 but, uh, you just do it for me and I'll owe you one..."
    : circles === 69n
    ? "Nice. "
    : circles === 72n
    ? "Highly significant... "
    : circles === 73n
    ? "חָכְמָה"
    : circles === 88n
    ? "Largest number that doesn't contain the letter N. 4th hexadecagonal number. Keys on a piano. # of constellations. MPH to go back to the future. Nazi scum fuck off. Love and kisses."
    : circles === 90n
    ? "Right angle."
    : circles === 91n
    ? "Amen."
    : circles === 93n
    ? "Do what thou wilt shall be the whole of the law. "
    : circles === 96n
    ? "Quite bitter beings like to stack their bodies high."
    : circles === 99n
    ? "I've been waiting so long. Luftballons. Bottles of beer on the wall. Problems, but a bitch ain't one."
    : circles === 101n
    ? "Intro to Dalmations."
    : circles === 104n
    ? "10-4 big dog."
    : circles === 108n
    ? "Mala beads, earth:sun diameter ratio, moon:earth distance ratio, names of Shiva, energy lines, pressure points, upanishads, tai chi moves. Awake, harp and lyre! I will awaken the dawn.  "
    : circles === 138n
    ? "That's right, the phoenix will rise again!!!!!"
    : circles === 144n
    ? "Gross. "
    : circles === 180n
    ? "Don't make me turn this thing around. "
    : circles === 203n
    ? "CONNECTICUTTTTTTTT!!!!!"
    : circles === 211n
    ? "Essential community services, connecting people to local resources."
    : circles === 212n
    ? "I was in the 212, on the uptown A... and it was BOILING"
    : circles === 230n
    ? "When's the best time to go to the dentist? Tooth hurty."
    : circles === 248n
    ? "Positive commandments. אַבְרָהָם "
    : circles === 256n
    ? "Byte me. "
    : circles === 273n
    ? "Kelvin popsicle"
    : circles === 288n
    ? "I had a really good pun I wanted to write for this number but it was two gross..."
    : circles === 305n
    ? "Mr. Worldwide."
    : circles === 311n
    ? "Amber is the color of your energy... "
    : circles === 312n
    ? "Ketchup on hot dogs is a crime."
    : circles === 318n
    ? "(((אֱלִיעֶזֶר)))"
    : circles === 321n
    ? "Blastoff. "
    : circles === 343n
    ? "7^3"
    : circles === 350n
    ? "I ain't givin' you no tree-fiddy ya gawddam Loch Ness monstah! "
    : circles === 358n
    ? "מָשִׁיחַ"
    : circles === 360n
    ? "Very clever. Finally, we've come full circle. "
    : circles === 365n
    ? "Days in year. Negative commandments. And all the days of Enoch were three hundred and sixty five years."
    : circles === 369n
    ? "3-6-9, damn you fine. Hoping she can sock it to me one more time. Get low, get low (get low), get low (get low), get low (get low). To the window (to the window), to the wall (to the wall). Tesla would be so proud.    "
    : circles === 404n
    ? "Error: Circles not found "
    : circles === 411n
    ? "It seems you've got the right info... "
    : circles === 418n
    ? "I'm a teapot. "
    : circles === 420n
    ? "Grass probably helped me as much as it hurt me. Especially as a performer. When you're high, it's easy to kid yourself about how clever certain mediocre pieces of material are. But, on the other hand, pot opens windows and doors that you may not be able to get through any other way. - George Carlin "
    : circles === 432n
    ? "Raise your frequency!!!!!"
    : circles === 433n
    ? "Silence."
    : circles === 440n
    ? "Who hijacked the music??? That's the secret of bluegrass: Keep every instrument in a separate octave, because Pythagoras (lol) set it up and gave the A note 440 vibrations. If octave is doublin' the A underneath that'd be 220 vibrations, the next 110 and the next 55."
    : circles === 451n
    ? "Cram them full of noncombustible data, chock them so damned full of ‘facts’ they feel stuffed, but absolutely ‘brilliant’ with information. Then they’ll feel they’re thinking, they’ll get a sense of motion without moving. And they’ll be happy, because facts of that sort don’t change. Don’t give them any slippery stuff like philosophy or sociology to tie things up with. "
    : circles === 511n
    ? "Up to the minute traffic and transit information."
    : circles === 512n
    ? "Keep Austin Weird. "
    : circles === 541n
    ? "יִשְׂרָאֵל"
    : circles === 561n
    ? "Carmichael number??? WHO ARE YOU"
    : circles === 611n
    ? "תּוֹרָה "
    : circles === 613n
    ? "That's a lot of commandments..."
    : circles === 617n
    ? "SHIPPIN' UP TO BOSTON!!! "
    : circles === 666n
    ? "Here is wisdom: Let him that hath understanding count the number of the beast, for it is the number of a man; and his number is six hundred threescore and six. ((The 36th triangular number))"
    : circles === 710n
    ? "Get a job. "
    : circles === 711n
    ? "Thank you, come again! "
    : circles === 718n
    ? "NO SLEEP 'TIL "
    : circles === 789n
    ? "So why did 7 eat 9?? Because they heard you were supposed to eat 3² meals a day. Somebody needs to lock up that cannibalistic freak."
    : circles === 808n
    ? "808 kick drum, 808 hat. 808 snare drum, 808 clap. Got an 808 this and an 808 that. Got an 808 boom and an 808 bap. "
    : circles === 811n
    ? "Call before you dig. "
    : circles === 911n
    ? "Never forget. "
    : circles === 912n
    ? "Slowvannah, honey."
    : circles === 913n
    ? "בְּרֵאשִׁ֖ית"
    : circles === 1111n
    ? "WAKE UP"
    : circles === 1225n
    ? " 35^2, 49th triangular number. Merry Christmas. (Happy birthday, Katie)"
    : circles === 1234n
    ? "5, 6, 9 and 10. Let me hear you scream if you want some more like ahhhhhhh push it push it watch me work it: I'm perfect. "
    : circles === 1337n
    ? " *tips fedora*"
    : circles === 1488n
    ? "Let's play 'follow the leader'. How about you start with what he did in the bunker. "
    : circles === 1492n
    ? "Cristobal Colon sailed the ocean blue just doesn't have the same ring to it..."
    : circles === 1618n
    ? "Φ phie pho phum"
    : circles === 1729n
    ? "My friends Hardy and Ramanujan would like to have a word with you... "
    : circles === 1738n
    ? "We could just drink it straight. "
    : circles === 1945n
    ? "The only girl I ever loved was born with roses in her eyes."
    : circles === 1964n
    ? "90% silver. "
    : circles === 1979n
    ? "Cool kids never have the time. "
    : circles === 1984n
    ? "The party told you to reject the evidence of your eyes and ears. It was their final, most essential command."
    : circles === 1985n
    ? "Bruce Springsteen, Madonna. Way before Nirvana."
    : circles === 2001n
    ? "I’m sorry, Dave. I’m afraid I can’t do that."
    : circles === 2048n
    ? "Remember this game???"
    : circles === 2112n
    ? "I can't wait to share this new wonder. The people will all see its light. Let them all make their own music."
    : circles === 2122n
    ? "Get out, get under. "
    : circles === 2468n
    ? "Who do we appreciate?"
    : circles === 2701n
    ? "Wow... you... figured out one of the most important numbers... ever... Like literally mystery of the universe type shit... keep exploring. You have the divine spark within you. This is the ultimate easter egg. No number compares."
    : circles === 3008n
    ? "You're so 2000 and late. "
    : circles === 4321n
    ? "Earth below us: Drifting, falling. Floating weightless: calling, calling home. "
    : circles === 4950n
    ? " the 99th triangular number..."
    : circles === 5050n
    ? " the 100th triangular number..."
    : circles === 6174n
    ? "Abra Kaprekar-dabra Alakazam! This number is magic!"
    : circles === 6969n
    ? "Nice. Nice."
    : circles === 8128n
    ? "PERFECT"
    : circles === 9001n
    ? "ITS OVER 9000!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    : circles === 9999n
    ? " CLOSE BUT NO CIGAR!!! "
    : circles === 12345n
    ? "You're like a dream come true. Just want to be with you. You know it's plain to see that you're the only one for me. Repeat steps 1-3. Make you fall in love with me. If ever I believe my work is done, then I'll start it back at 1."
    : circles === 24601n
    ? "I stole a loaf of bread: My sister's child was close to death, and we were starving. "
    : circles === 25920n
    ? "Full cycle through the zodiac. "
    : circles === 42069n
    ? "“Everything in excess! To enjoy the flavor of life, take big bites. Moderation is for monks.” Robert A. Heinlein. "
    : circles === 65536n
    ? " Unicode, 64KB, 2^16, 4^8"
    : circles === 69420n
    ? " Grow up. "
    : circles === 80085n
    ? " HEHEHEHEHEHEHEHEHEHE Calculator tiddies"
    : circles === 80808n
    ? "Air raid I slang the math raider nation black cab psychic radio also known as only channel in our mobile lab."
    : circles === 84716n
    ? "Heaven on earth. IYKYK. "
    : circles === 86400n
    ? " Seconds in a day"
    : circles === 90210n
    ? " Beverly Hills: That's where I wanna be. Gimme gimme, gimme gimme. "
    : circles === 98765n
    ? "4321? Desert Hot Springs!!! "
    : circles === 99991n
    ? "Largest 5-digit Prime number."
    : circles === 112358n
    ? "You must be some kind of fibonacci fan..."
    : circles === 121234n
    ? " Count me off! "
    : circles === 123456n
    ? "Oh, did you think something super special would happen if you typed this number in or something???? You think this is significant???? There's no way you actually have this many... STOP POKING AROUND AND JUST BURN SOME CIRCLES ALREADY"
    : circles === 144000n
    ? "I'll see you there, my friend."
    : circles === 161803n
    ? "Writing this code has been a φ-ver dream"
    : circles === 186000n
    ? "Light speed: miles per second"
    : circles === 192000n
    ? "There's a monkey in the jungle watching a vapor trail caught up in a conflict between his brain and his tail. And if time's elimination, then we got nothing to lose. Please repeat the message: It's the music that we choose."
    : circles === 210000n
    ? "Blocks between bitcoin halvings... (HODL my friend) "
    : circles === 210420n
    ? "Out of bed just after one, down in time to catch the sun. "
    : circles === 271828n
    ? "Anyone? Anyone? Euler? Euler? - Ferris Euler's Day Off"
    : circles === 299792n
    ? "Light speed: km/s if you don't use freedom units."
    : circles === 314159n
    ? "Pi R Squared?? NO! PIES ARE ROUND!!!!!!!!"
    : circles === 420420n
    ? "Blaze it. Blaze it."
    : circles === 481516n
    ? "23, 42. WHAT DO THEY MEAN?????."
    : circles === 525600n
    ? "Minutes in a year, my least favorite musical."
    : circles === 696969n
    ? "Nice. Nice. Nice."
    : circles === 867530n
    ? "9"
    : circles === 999983n
    ? "Largest 6-digit prime"
    : circles === 999999n
    ? "YOU WISH :)"
    : "";
}

export default function BurnPage() {
  const router = useRouter();
  const { publicKey, sendTransaction, connected } = useWallet();
  const connection = useMemo(() => new Connection(RPC, "confirmed"), []);

  const [tokenBalance, setTokenBalance] = useState("0");
  const [physicalCircles, setPhysicalCircles] = useState("0");
  const [rawBalance, setRawBalance] = useState(0n);
  const [sourceTokenAccount, setSourceTokenAccount] = useState(null);
  const [tokenProgramId, setTokenProgramId] = useState(TOKEN_PROGRAM_ID);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const circlesAvailable = rawBalance / UNITS_PER_CIRCLE;
  const circlesBig = useMemo(() => {
    const s = amount.trim();
    if (!/^[0-9]+$/.test(s)) return 0n;
    try {
      return BigInt(s);
    } catch {
      return 0n;
    }
  }, [amount]);
  const inputIsValid = circlesBig > 0n;

  const loadBalance = useCallback(async () => {
    if (!publicKey) {
      setTokenBalance("0");
      setPhysicalCircles("0");
      setRawBalance(0n);
      setSourceTokenAccount(null);
      return;
    }

    try {
      const mintInfo = await connection.getAccountInfo(CIRCLES_MINT, "confirmed");
      const programId =
        mintInfo && mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
          ? TOKEN_2022_PROGRAM_ID
          : TOKEN_PROGRAM_ID;
      setTokenProgramId(programId);

      const accounts = [];

      try {
        const parsed = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: CIRCLES_MINT },
          "confirmed"
        );
        for (const item of parsed.value) {
          const ta = item.account?.data?.parsed?.info?.tokenAmount;
          if (!ta) continue;
          accounts.push({
            pubkey: item.pubkey,
            raw: BigInt(ta.amount),
            ui: Number(ta.uiAmount || 0),
          });
        }
      } catch (e) {
        console.error(e);
      }

      if (accounts.length === 0) {
        try {
          const rawAccounts = await connection.getTokenAccountsByOwner(
            publicKey,
            { mint: CIRCLES_MINT }
          );
          for (const item of rawAccounts.value) {
            const bal = await connection.getTokenAccountBalance(item.pubkey);
            accounts.push({
              pubkey: item.pubkey,
              raw: BigInt(bal.value.amount),
              ui: Number(bal.value.uiAmount || 0),
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (accounts.length === 0) {
        for (const pid of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
          try {
            const ata = await getAssociatedTokenAddress(
              CIRCLES_MINT,
              publicKey,
              true,
              pid
            );
            const bal = await connection.getTokenAccountBalance(ata);
            accounts.push({
              pubkey: ata,
              raw: BigInt(bal.value.amount),
              ui: Number(bal.value.uiAmount || 0),
            });
          } catch (e) {
            console.error(e);
          }
        }
      }

      let totalRaw = 0n;
      let bestAcct = null;
      let bestRaw = 0n;
      let uiTotal = 0;
      for (const acct of accounts) {
        totalRaw += acct.raw;
        uiTotal += acct.ui;
        if (acct.raw > bestRaw) {
          bestRaw = acct.raw;
          bestAcct = acct.pubkey;
        }
      }

      setRawBalance(totalRaw);
      setSourceTokenAccount(bestAcct);
      setTokenBalance(
        uiTotal.toLocaleString(undefined, { maximumFractionDigits: 6 })
      );
      setPhysicalCircles((totalRaw / UNITS_PER_CIRCLE).toLocaleString());
      setStatus(
        accounts.length
          ? ""
          : "It seems like you don't have any circles. YET."
      );
    } catch (error) {
      console.error(error);
      setTokenBalance("0");
      setPhysicalCircles("0");
      setRawBalance(0n);
      setSourceTokenAccount(null);
      setStatus(`Failed to load token info: ${error?.message || error}`);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  async function burnTokens() {
    if (!publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!sourceTokenAccount) {
      setStatus("It seems like you don't have any circles. YET.");
      return;
    }

    const s = amount.trim();
    if (!s || !/^[0-9]+$/.test(s)) {
      setStatus("Entire circles only, please! (No decimals 'round here).");
      return;
    }

    const circles = BigInt(s);
    const egg = eggFor(circles);
    if (egg) setStatus(egg.trim());

    if (circles <= 0n) {
      setStatus("How do you expect to burn 0 circles?");
      return;
    }
    if (circles > 999999n || circles > MAX_PHYSICAL) {
      setStatus("I admire your confidence...");
      return;
    }
    if (circles > circlesAvailable) {
      setStatus(
        egg
          ? `${egg}\nYou only have ${circlesAvailable} physical circles worth of tokens, not quite enough. I wish you had more, too.`
          : `You only have ${circlesAvailable} physical circles worth of tokens, not quite enough. I wish you had more, too.`
      );
      return;
    }

    const burnAmount = circles * UNITS_PER_CIRCLE;
    const ok = window.confirm(
      `Burn ${circles * BigInt(TOKENS_PER_CIRCLE)} CIRCLES for ${circles} physical circle(s)?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setBusy(true);
    try {
      if (!egg) setStatus("Preparing burn…");

      const instruction = createBurnCheckedInstruction(
        sourceTokenAccount,
        CIRCLES_MINT,
        publicKey,
        burnAmount,
        DECIMALS,
        [],
        tokenProgramId
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(instruction);

      if (!egg) setStatus("Waiting for wallet approval...");
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 3,
      });

      const result = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      if (result.value.err) {
        throw new Error("Chain rejected the burn.");
      }

      setStatus(egg ? egg.trim() : `Burn successful. ${signature}`);
      setAmount("");
      await loadBalance();
      router.push({
        pathname: "/redeem",
        query: { sig: signature, circles: String(circles) },
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
        <strong>1000 $CIRCLES token = 1 physical circle</strong>
        <br />
        1 full sheet = 10,000 physical circles
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
            type="text"
            inputMode="numeric"
            placeholder="Physical circles (whole number)"
            value={amount}
            onChange={(event) => {
              const v = event.target.value;
              if (v === "" || /^[0-9]+$/.test(v)) setAmount(v);
            }}
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

          {inputIsValid && (
            <div style={{ marginTop: 16 }}>
              {circlesBig % 10000n === 0n && circlesBig >= 10000n && (
                <div
                  style={{
                    fontSize: 33,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  {(circlesBig / 10000n).toString()} FULL SHEET
                  {circlesBig / 10000n === 1n ? "" : "S"}
                </div>
              )}
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 10 }}>
                {circlesBig.toString()} physical circle
                {circlesBig === 1n ? "" : "s"}
                <br />({(circlesBig * 1000n).toString()} CIRCLES token)
              </div>
            </div>
          )}

          <p style={{ marginTop: "20px", fontSize: 13, opacity: 0.75 }}>
            Blockchain transactions are irreversible.
            <br />
            Burn at your own risk.
            <br />
            By clicking this button you confirm that you understand and accept all
            responsibility.
            <br />
            <br />
            To redeem your physical circles, you must claim within 24 hours by
            emailing 1millioncircles@gmail.com.
            <br />
            Unclaimed circles will be destroyed.
            <br />
            <br />
            Thank you for truly supporting the 1 million circles project.
          </p>
        </>
      )}

      {status && (
        <p
          style={{
            marginTop: "20px",
            wordBreak: "break-word",
            whiteSpace: "pre-line",
          }}
        >
          {status}
        </p>
      )}
    </main>
  );
}
