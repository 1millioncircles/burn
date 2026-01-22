

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getMint,
  createBurnCheckedInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
// yoooo what's up welcome to the code for this particular part of this website. I wrote this from scratch with chat gpt 5.2's help over around 100 queries and around 6-8 legitimate hours of work. This was my first time really ever coding anything blockchain transaction related and I truly built this page from the ground up. I'm not sure if it could be simplified more because I ran into many errors along the way trying to get it to really connect but here it is, a very simple burn function with 1000:1 ratio, caps at 1 million circles. This exact blockchain code on this page was the biggest hurdle mentally that I had been facing for the past 6 months since coming up with this idea in regards to preparation. I'd considered hiring someone but I didn't want to invite a lack of security, so here we are. Thank you for reading. I hope you have a wonderful day.

// Replace this with real mint wen launch!!!!!!
const CIRCLE_MINT = new PublicKey("9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump");


const TOKENS_PER_CIRCLE = 1000n;

// Safety limit per transaction
const MAX_CIRCLES_PER_TX = 100000n;
const MAX_CIRCLES_INPUT = 1000000n; // 1 MILLIOOOOOOOONNNNN circles


function isWholeNumberString(s) {
  return /^[0-9]+$/.test(s);
}
function pow10BigInt(n) {
  let r = 1n;
  for (let i = 0; i < n; i++) r *= 10n;
  return r;
}

export default function BurnCircles() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const router = useRouter();

  const [tokenProgramId, setTokenProgramId] = useState(null);
  const [decimals, setDecimals] = useState(null);

  const [rawBalance, setRawBalance] = useState(0n);
  const [circlesAvailable, setCirclesAvailable] = useState(0n);

  const [sourceTokenAccount, setSourceTokenAccount] = useState(null);

  const [circlesStr, setCirclesStr] = useState("");
  const [status, setStatus] = useState("");
  const [txSig, setTxSig] = useState("");

  // Detect token program owner of the mint
  useEffect(() => {
    (async () => {
      try {
        setStatus("Detecting token program…");
        const info = await connection.getAccountInfo(CIRCLE_MINT, "confirmed");
        if (!info) throw new Error("Mint not found (check address).");

        if (info.owner.equals(TOKEN_PROGRAM_ID)) setTokenProgramId(TOKEN_PROGRAM_ID);
        else if (info.owner.equals(TOKEN_2022_PROGRAM_ID)) setTokenProgramId(TOKEN_2022_PROGRAM_ID);
        else throw new Error(`Unknown mint owner program: ${info.owner.toBase58()}`);

        setStatus("");
      } catch (e) {
        setStatus(`Failed to detect token program: ${e?.message ?? String(e)}`);
      }
    })();
  }, [connection]);

  const refresh = useCallback(async () => {
    setTxSig("");
    if (!publicKey || !tokenProgramId) return;

    try {
      setStatus("Loading balances…");

      const mint = await getMint(connection, CIRCLE_MINT, "confirmed", tokenProgramId);
      setDecimals(mint.decimals);

      // ✅ Get ALL token accounts owned by this wallet for this mint (not just ATA)
      const resp = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: CIRCLE_MINT },
        "confirmed"
      );

      let totalRaw = 0n;
      let bestAcct = null;
      let bestRaw = 0n;

      for (const item of resp.value) {
        const info = item.account.data.parsed.info;
        const amountStr = info.tokenAmount.amount; // raw integer string
        const raw = BigInt(amountStr);

        totalRaw += raw;
        if (raw > bestRaw) {
          bestRaw = raw;
          bestAcct = item.pubkey;
        }
      }

      setRawBalance(totalRaw);
      setSourceTokenAccount(bestAcct);

      const neededPerCircleRaw = TOKENS_PER_CIRCLE * pow10BigInt(mint.decimals);
      setCirclesAvailable(totalRaw / neededPerCircleRaw);

      setStatus("");
    } catch (e) {
      setStatus(`Failed to load token info: ${e?.message ?? String(e)}`);
    }
  }, [connection, publicKey, tokenProgramId]);

  useEffect(() => {
    refresh();
  }, [refresh, publicKey?.toBase58(), tokenProgramId?.toBase58?.()]);

  const burn = useCallback(async () => {
    setTxSig("");

    if (!publicKey) return setStatus("Connect wallet first.");
    if (!signTransaction) return setStatus("Wallet cannot sign.");
    if (!tokenProgramId) return setStatus("Token program not detected yet.");
    if (decimals == null) return setStatus("Token decimals not loaded yet.");
  
    if (!sourceTokenAccount) return setStatus("It seems like you don't have any circles. YET.");

    const s = circlesStr.trim();
    if (!s || !isWholeNumberString(s)) return setStatus("Entire circles only, please! (No decimals 'round here).");

    const circles = BigInt(s);
const egg = 
circles === 1n ? "AN ARTIST RESPECTS THE CIRCLE THAT SERVES AS THE FOUNDATION OF CREATIVITY" :
circles === 10n ? "Tetractys, the 4th triangular number." :	
circles === 12n ? "Eggs? Donuts? Bagels? Clock? Zodiac? Grades? Jurors? Inches? Vinyl? Roses? Tribes? Apostles? Olympians? Cheaper by the... " :
circles === 13n ? "There isn't even an elevator button for this..." :
circles === 15n ? "The 5th triangular number." : 
circles === 18n ? "חַי" :
circles === 21n ? "What's 9 + 10? Blackjack. The 6th triangular number. " :
circles === 22n ? "I don't know about you... " :
circles === 27n ? "I said your name 27 times, would that bring you back to life? Don't join the club. The 7th triangular number." :
circles === 32n ? "לֵב" :
circles === 33n ? "Highest honorary degree, vertebrae in the spine." :
circles === 34n ? "You sick freak. " :
circles === 36n ? "(1³+2³+3³=36), Roll two dice, Lamed Vavniks, the 8th triangular number." :
circles === 42n ? "Don't forget to bring a towel." :  
circles === 45n ? "אָדָם" :
circles === 52n ? "Weeks in the year and cards in the deck." :  
circles === 55n ? "Shfifty-five. " :
circles === 64n ? "Squares on a chessboard. " :
circles === 67n ? "6 - 7? What are you, in middle school?" : 
circles === 68n ? "It's like 69 but, uh, you just do it for me and I'll owe you one..." :
circles === 69n ? "Nice. " :
circles === 72n ? "Highly significant... " :
circles === 73n ? "חָכְמָה" :
circles === 88n ? "Largest number that doesn't contain the letter N. 4th hexadecagonal number. Keys on a piano. # of constellations. MPH to go back to the future. Nazi scum fuck off. Love and kisses." :  
circles === 90n	? "Right angle." :
circles === 91n ? "Amen." :
circles === 93n ? "Do what thou wilt shall be the whole of the law. " :
circles === 96n ? "Quite bitter beings like to stack their bodies high." :
circles === 99n ? "I've been waiting so long. Luftballons. Bottles of beer on the wall. Problems, but a bitch ain't one." :
circles === 101n ? "Intro to Dalmations." :
circles === 104n ? "10-4 big dog." :
circles === 108n ? "Mala beads, earth:sun diameter ratio, moon:earth distance ratio, names of Shiva, energy lines, pressure points, upanishads, tai chi moves. Awake, harp and lyre! I will awaken the dawn.  " :
circles === 138n ? "That's right, the phoenix will rise again!!!!!" :
circles === 144n ? "Gross. " :
circles === 180n ? "Don't make me turn this thing around. " :
circles === 203n ? "CONNECTICUTTTTTTTT!!!!!" :
circles === 211n ? "Essential community services, connecting people to local resources." :
circles === 212n ? "I was in the 212, on the uptown A... and it was BOILING" :
circles === 230n ? "When's the best time to go to the dentist? Tooth hurty." :
circles === 248n ? "Positive commandments. אַבְרָהָם " :
circles === 256n ? "Byte me. " :
circles === 273n ? "Kelvin popsicle" :
circles === 288n ? "I had a really good pun I wanted to write for this number but it was two gross..." :
circles === 305n ? "Mr. Worldwide." :
circles === 311n ? "Amber is the color of your energy... " :
circles === 312n ? "Ketchup on hot dogs is a crime." :
circles === 318n ? "(((אֱלִיעֶזֶר)))" :
circles === 321n ? "Blastoff. " :
circles === 343n ? "7^3" :
circles === 350n ? "I ain't givin' you no tree-fiddy ya gawddam Loch Ness monstah! " :
circles === 358n ? "מָשִׁיחַ" :
circles === 360n ? "Very clever. Finally, we've come full circle. " : 
circles === 365n ? "Days in year. Negative commandments. And all the days of Enoch were three hundred and sixty five years." :
circles === 369n ? "3-6-9, damn you fine. Hoping she can sock it to me one more time. Get low, get low (get low), get low (get low), get low (get low). To the window (to the window), to the wall (to the wall). Tesla would be so proud.    " :
circles === 404n ? "Error: Circles not found " :
circles === 411n ? "It seems you've got the right info... " :
circles === 418n ? "I'm a teapot. " :
circles === 420n ? "Grass probably helped me as much as it hurt me. Especially as a performer. When you're high, it's easy to kid yourself about how clever certain mediocre pieces of material are. But, on the other hand, pot opens windows and doors that you may not be able to get through any other way. - George Carlin " : 
circles === 432n ? "Raise your frequency!!!!!" :
circles === 433n ? "Silence." :
circles === 440n ? "Who hijacked the music??? That's the secret of bluegrass: Keep every instrument in a separate octave, because Pythagoras (lol) set it up and gave the A note 440 vibrations. If octave is doublin' the A underneath that'd be 220 vibrations, the next 110 and the next 55." :
circles === 451n ? "Cram them full of noncombustible data, chock them so damned full of ‘facts’ they feel stuffed, but absolutely ‘brilliant’ with information. Then they’ll feel they’re thinking, they’ll get a sense of motion without moving. And they’ll be happy, because facts of that sort don’t change. Don’t give them any slippery stuff like philosophy or sociology to tie things up with. " :
circles === 511n ? "Up to the minute traffic and transit information." :
circles === 512n ? "Keep Austin Weird. " :
circles === 541n ? "יִשְׂרָאֵל" :
circles === 561n ? "Carmichael number??? WHO ARE YOU" :
circles === 611n ? "תּוֹרָה " :
circles === 613n ? "That's a lot of commandments..." :
circles === 617n ? "SHIPPIN' UP TO BOSTON!!! " :
circles === 666n ? "Here is wisdom: Let him that hath understanding count the number of the beast, for it is the number of a man; and his number is six hundred threescore and six. ((The 36th triangular number))" : 
circles === 710n ? "Get a job. " :
circles === 711n ? "Thank you, come again! " :
circles === 718n ? "NO SLEEP 'TIL " :
circles === 789n ? "So why did 7 eat 9?? Because they heard you were supposed to eat 3² meals a day. Somebody needs to lock up that cannibalistic freak." :
circles === 808n ? "808 kick drum, 808 hat. 808 snare drum, 808 clap. Got an 808 this and an 808 that. Got an 808 boom and an 808 bap. " :
circles === 811n ? "Call before you dig. " :
circles === 911n ? "Never forget. " :
circles === 912n ? "Slowvannah, honey." :
circles === 913n ? "בְּרֵאשִׁ֖ית" :
circles === 1111n ? "WAKE UP" :
circles === 1225n ? " 35^2, 49th triangular number. Merry Christmas. (Happy birthday, Katie)" : 
circles === 1234n ? "5, 6, 9 and 10. Let me hear you scream if you want some more like ahhhhhhh push it push it watch me work it: I'm perfect. " :
circles === 1337n ? " *tips fedora*" : 
circles === 1488n ? "Let's play 'follow the leader'. How about you start with what he did in the bunker. " :  
circles === 1492n ? "Cristobal Colon sailed the ocean blue just doesn't have the same ring to it..." :
circles === 1618n ? "Φ phie pho phum" :
circles === 1729n ? "My friends Hardy and Ramanujan would like to have a word with you... " :
circles === 1738n ? "We could just drink it straight. " :
circles === 1945n ? "The only girl I ever loved was born with roses in her eyes." :
circles === 1964n ? "90% silver. " :
circles === 1979n ? "Cool kids never have the time. " :
circles === 1984n ? "The party told you to reject the evidence of your eyes and ears. It was their final, most essential command." :
circles === 1985n ? "Bruce Springsteen, Madonna. Way before Nirvana." :
circles === 2001n ? "I’m sorry, Dave. I’m afraid I can’t do that." :
circles === 2048n ? "Remember this game???" :
circles === 2112n ? "I can't wait to share this new wonder. The people will all see its light. Let them all make their own music." :
circles === 2122n ? "Get out, get under. " :
circles === 2468n ? "Who do we appreciate?" :
circles === 2701n ? "Wow... you... figured out one of the most important numbers... ever... Like literally mystery of the universe type shit... keep exploring. You have the divine spark within you. This is the ultimate easter egg. No number compares." : 
circles === 3008n ? "You're so 2000 and late. " :
circles === 4321n ? "Earth below us: Drifting, falling. Floating weightless: calling, calling home. " :
circles === 4950n ? " the 99th triangular number..." :
circles === 5050n ? " the 100th triangular number..." :
circles === 6174n ? "Abra Kaprekar-dabra Alakazam! This number is magic!" :
circles === 6969n ? "Nice. Nice." :
circles === 8128n ? "PERFECT" :
circles === 9001n ? "ITS OVER 9000!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" :
circles === 9999n ? " CLOSE BUT NO CIGAR!!! " :
circles === 12345n ? "You're like a dream come true. Just want to be with you. You know it's plain to see that you're the only one for me. Repeat steps 1-3. Make you fall in love with me. If ever I believe my work is done, then I'll start it back at 1." :
circles === 24601n ? "I stole a loaf of bread: My sister's child was close to death, and we were starving. " :
circles === 25920n ? "Full cycle through the zodiac. " : 
circles === 42069n ? "“Everything in excess! To enjoy the flavor of life, take big bites. Moderation is for monks.” Robert A. Heinlein. " :
circles === 65536n ? " Unicode, 64KB, 2^16, 4^8" : 
circles === 69420n ? " Grow up. " :
circles === 80085n ? " HEHEHEHEHEHEHEHEHEHE Calculator tiddies" : 
circles === 80808n ? "Air raid I slang the math raider nation black cab psychic radio also known as only channel in our mobile lab." :
circles === 84716n ? "Heaven on earth. IYKYK. " :
circles === 86400n ? " Seconds in a day" : 
circles === 90210n ? " Beverly Hills: That's where I wanna be. Gimme gimme, gimme gimme. " : 
circles === 98765n ? "4321? Desert Hot Springs!!! " :
circles === 99991n ? "Largest 5-digit Prime number." :
circles === 112358n ? "You must be some kind of fibonacci fan..." :
circles === 121234n ? " Count me off! " :
circles === 123456n ? "Oh, did you think something super special would happen if you typed this number in or something???? You think this is significant???? There's no way you actually have this many... STOP POKING AROUND AND JUST BURN SOME CIRCLES ALREADY" :
circles === 144000n ? "I'll see you there, my friend." :
circles === 161803n ? "Writing this code has been a φ-ver dream" :
circles === 186000n ? "Light speed: miles per second" :
circles === 192000n ? "There's a monkey in the jungle watching a vapor trail caught up in a conflict between his brain and his tail. And if time's elimination, then we got nothing to lose. Please repeat the message: It's the music that we choose." :
circles === 210000n ? "Blocks between bitcoin halvings... (HODL my friend) " :
circles === 210420n ? "Out of bed just after one, down in time to catch the sun. " : 
circles === 271828n ? "Anyone? Anyone? Euler? Euler? - Ferris Euler's Day Off" :
circles === 299792n ? "Light speed: km/s if you don't use freedom units." :
circles === 314159n ? "Pi R Squared?? NO! PIES ARE ROUND!!!!!!!!" :
circles === 420420n ? "Blaze it. Blaze it." :
circles === 481516n ? "23, 42. WHAT DO THEY MEAN?????. " :
circles === 525600n ? "Minutes in a year, my least favorite musical." : 
circles === 696969n ? "Nice. Nice. Nice." :
circles === 867530n ? "9" :
circles === 999983n ? "Largest 6-digit prime" :
circles === 999999n ? "YOU WISH :)" :


"";
const isEgg = egg !== "";
if (isEgg) setStatus(egg.trim());

    if (circles <= 0n) return setStatus("How do you expect to burn 0 circles?");
    if (circles > 999999n) return setStatus("I admire your confidence...");
    if (circles > circlesAvailable) return setStatus(
  egg
    ? `${egg}\nYou only have ${circlesAvailable} physical circles worth of tokens. I wish you had more, too.`
    : `You only have ${circlesAvailable} physical circles worth of tokens. I wish you had more, too.`
);


    try {
      if (!egg) setStatus("Preparing burn…");
      const amountRaw = circles * TOKENS_PER_CIRCLE * pow10BigInt(decimals);

      const ix = createBurnCheckedInstruction(
        sourceTokenAccount, // burn from the token account that actually holds tokens
        CIRCLE_MINT,
        publicKey,
        amountRaw,
        decimals,
        [],
        tokenProgramId
      );

      const { blockhash } = await connection.getLatestBlockhash("finalized");

      const tx = new Transaction().add(ix);
      tx.feePayer = publicKey;
      tx.recentBlockhash = blockhash;

      if (!egg) setStatus("Requesting signature…");
      const signed = await signTransaction(tx);

      if (!egg) setStatus("Sending…");
      const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
setTxSig(sig);
refresh().catch(() => {});
router.push(`/redeem?sig=${encodeURIComponent(sig)}&circles=${encodeURIComponent(circlesStr.trim())}`);
return;



      setTxSig(sig);
      setStatus("Burn complete 🔥");
      await refresh();
    } catch (e) {
      setStatus(`Burn failed: ${e?.message ?? String(e)}`);
    }
  }, [publicKey, signTransaction, tokenProgramId, decimals, circlesStr, circlesAvailable, sourceTokenAccount, connection, refresh]);

  const displayTokens = useMemo(() => {
    if (decimals == null) return "?";
    const div = pow10BigInt(decimals);
    const whole = rawBalance / div;
    const frac = (rawBalance % div).toString().padStart(decimals, "0").slice(0, 6);
    return `${whole.toString()}.${frac}`;
  }, [rawBalance, decimals]);

  const inputIsValid = useMemo(() => {
    const s = circlesStr.trim();
    if (!s) return false;
    if (!isWholeNumberString(s)) return false;
    try {
      return BigInt(s) > 0n;
    } catch {
      return false;
    }
  }, [circlesStr]);

  const circlesBig = useMemo(() => (inputIsValid ? BigInt(circlesStr.trim()) : 0n), [inputIsValid, circlesStr]);

  return (
    <main style={{ maxWidth: 780, margin: "40px auto", padding: 20, textAlign: "center", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>🔥 Burn Circles</h1>
        <WalletMultiButton />
      </div>

      <p>
     <b>1000 CIRCLES token = 1 physical circle</b>.<br /> 1 full sheet = 10,000 physical circles 
      </p>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <span style={{ opacity: 0.7 }}>CIRCLES token:</span>{" "}
            <b>{Number(displayTokens).toLocaleString(undefined, { maximumFractionDigits: 6 })}</b>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>Physical circles available:</span>{" "}
            <b>{circlesAvailable.toString()}</b>
          </div>
        </div>

        <input
          value={circlesStr}
       onChange={(e) => {
  const v = e.target.value;

  // allow empty
  if (v === "") {
    setCirclesStr("");
    return;
  }

  // digits only
  if (!/^[0-9]+$/.test(v)) return;

  try {
    const n = BigInt(v);

    // cap at 1,000,000
    if (n > MAX_CIRCLES_INPUT) {
      setCirclesStr(MAX_CIRCLES_INPUT.toString());
      return;
    }

    setCirclesStr(v);
  } catch {
    // ignore invalid BigInt
  }
}}

          placeholder="Physical circles (whole number)"
          inputMode="numeric"
          style={{ width: "100%", textAlign: "center", padding: 12, marginTop: 12, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <button
          onClick={burn}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 18,
            borderRadius: 14,
            border: "2px solid #111",
            fontSize: 18,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          🔥 BURN NOW
        </button>

        {/* ✅ Only show the “how much will burn” block AFTER a valid input is entered */}
        {inputIsValid && (
          <div style={{ textAlign: "center" }}>
  {inputIsValid && circlesBig % 10000n === 0n && circlesBig >= 10000n && (
  <div
    style={{
      marginTop: 4,
      fontSize: 33,
      fontWeight: 600,
      textAlign: "center",
      letterSpacing: "0.04em",
    }}
  >
    {(circlesBig / 10000n).toString()} FULL SHEET
    {circlesBig / 10000n === 1n ? "" : "S"}
  </div>
)}


            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 10, marginBottom: 8, justifyContent: "center", textAlign: "center" }}>
              {circlesBig.toString()} physical circle{circlesBig === 1n ? "" : "s"} <br />(
              {(circlesBig * 1000n).toString()} CIRCLES token)
            </div>

            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Blockchain transactions are irreversible.<br />Burn at your own risk.<br />
              By clicking this button you confirm that you understand and accept all responsibility.<br />
              <br /><br />
              To redeem your physical circles, you must claim within 24 hours.<br />
              Unclaimed circles will be destroyed.<br /><br />
              Thank you for truly supporting the 1 million circles project.
            </div>
          </div>
        )}

       

        {txSig && (
          <div style={{ marginTop: 10 }}>
            Proof:{" "}
            <a href={`https://solscan.io/tx/${txSig}`} target="_blank" rel="noreferrer">
              View on Solscan
            </a>
          </div>

        )}
      </div>
 {status && <div style={{ marginTop: 10,whiteSpace: "pre-line",
 textAlign: "center" }}>{status}</div>}
    </main>
  );
}