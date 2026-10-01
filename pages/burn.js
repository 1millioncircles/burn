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

// BRAND_NEW_BURN
// stay round.

const CIRCLES_MINT = new PublicKey(
  "Aea8zJW7jp1wkct3BjMeekBC1RQnHQyrvNutigc3pump"
);
const RPC = "https://solana.drpc.org";
const DECIMALS = 6;
const TOKENS_PER_CIRCLE = 1000n;
const UNITS_PER_CIRCLE = TOKENS_PER_CIRCLE * 10n ** BigInt(DECIMALS);

const EGGS = {
  1: "AN ARTIST RESPECTS THE CIRCLE THAT SERVES AS THE FOUNDATION OF CREATIVITY",
  10: "Tetractys, the 4th triangular number.",
  12: "Eggs? Donuts? Bagels? Clock? Zodiac? Grades? Jurors? Inches? Vinyl? Roses? Tribes? Apostles? Olympians? Cheaper by the... ",
  13: "There isn't even an elevator button for this...",
  15: "The 5th triangular number.",
  18: "חַי",
  21: "What's 9 + 10? Blackjack. The 6th triangular number. ",
  22: "I don't know about you... ",
  27: "I said your name 27 times, would that bring you back to life? Don't join the club. The 7th triangular number.",
  32: "Paths of creation, LEV!!!",
  33: "Highest honorary degree, vertebrae in the spine.",
  34: "You sick freak. ",
  36: "(1³+2³+3³=36), Roll two dice, Lamed Vavniks, the 8th triangular number.",
  42: "Don't forget to bring a towel.",
  45: "אָדָם",
  52: "Weeks in the year and cards in the deck.",
  55: "Shfifty-five. ",
  64: "Squares on a chessboard. ",
  67: "6 - 7? What are you, in middle school?",
  68: "It's like 69 but, uh, you just do it for me and I'll owe you one...",
  69: "Nice. ",
  72: "Highly significant... ",
  73: "חָכְמָה",
  88: "Largest number that doesn't contain the letter N. 4th hexadecagonal number. Keys on a piano. # of constellations. MPH to go back to the future. Nazi scum fuck off. Love and kisses.",
  90: "Right angle.",
  91: "Amen.",
  93: "Do what thou wilt shall be the whole of the law. ",
  96: "Quite bitter beings like to stack their bodies high.",
  99: "I've been waiting so long. Luftballons. Bottles of beer on the wall. Problems, but a bitch ain't one.",
  101: "Intro to Dalmations.",
  104: "10-4 big dog.",
  108: "Mala beads, earth:sun diameter ratio, moon:earth distance ratio, names of Shiva, energy lines, pressure points, upanishads, tai chi moves. Awake, harp and lyre! I will awaken the dawn.  ",
  138: "That's right, the phoenix will rise again!!!!!",
  144: "Gross. ",
  180: "Don't make me turn this thing around. ",
  203: "CONNECTICUTTTTTTTT!!!!!",
  211: "Essential community services, connecting people to local resources.",
  212: "I was in the 212, on the uptown A... and it was BOILING",
  230: "When's the best time to go to the dentist? Tooth hurty.",
  248: "Positive commandments. אַבְרָהָם ",
  256: "Byte me. ",
  273: "Kelvin popsicle",
  288: "I had a really good pun I wanted to write for this number but it was two gross...",
  305: "Mr. Worldwide.",
  311: "Amber is the color of your energy... ",
  312: "Ketchup on hot dogs is a crime.",
  318: "(((אֱלִיעֶזֶר)))",
  321: "Blastoff. ",
  343: "7^3",
  350: "I ain't givin' you no tree-fiddy ya gawddam Loch Ness monstah! ",
  358: "מָשִׁיחַ",
  360: "Very clever. Finally, we've come full circle. ",
  365: "Days in year. Negative commandments. And all the days of Enoch were three hundred and sixty five years.",
  369: "3-6-9, damn you fine. Hoping she can sock it to me one more time. Get low, get low (get low), get low (get low), get low (get low). To the window (to the window), to the wall (to the wall). Tesla would be so proud.    ",
  404: "Error: Circles not found ",
  411: "It seems you've got the right info... ",
  418: "I'm a teapot. ",
  420: "Grass probably helped me as much as it hurt me. Especially as a performer. When you're high, it's easy to kid yourself about how clever certain mediocre pieces of material are. But, on the other hand, pot opens windows and doors that you may not be able to get through any other way. - George Carlin ",
  432: "Raise your frequency!!!!!",
  433: "Silence.",
  440: "Who hijacked the music??? That's the secret of bluegrass: Keep every instrument in a separate octave, because Pythagoras (lol) set it up and gave the A note 440 vibrations. If octave is doublin' the A underneath that'd be 220 vibrations, the next 110 and the next 55.",
  451: "Cram them full of noncombustible data, chock them so damned full of ‘facts’ they feel stuffed, but absolutely ‘brilliant’ with information. Then they’ll feel they’re thinking, they’ll get a sense of motion without moving. And they’ll be happy, because facts of that sort don’t change. Don’t give them any slippery stuff like philosophy or sociology to tie things up with. ",
  511: "Up to the minute traffic and transit information.",
  512: "Keep Austin Weird. ",
  541: "יִשְׂרָאֵל",
  561: "Carmichael number??? WHO ARE YOU",
  611: "תּוֹרָה ",
  613: "That's a lot of commandments...",
  617: "SHIPPIN' UP TO BOSTON!!! ",
  666: "Here is wisdom: Let him that hath understanding count the number of the beast, for it is the number of a man; and his number is six hundred threescore and six. ((The 36th triangular number))",
  710: "Get a job. ",
  711: "Thank you, come again! ",
  718: "NO SLEEP 'TIL ",
  789: "So why did 7 eat 9?? Because they heard you were supposed to eat 3² meals a day. Somebody needs to lock up that cannibalistic freak.",
  808: "808 kick drum, 808 hat. 808 snare drum, 808 clap. Got an 808 this and an 808 that. Got an 808 boom and an 808 bap. ",
  811: "Call before you dig. ",
  911: "Never forget. ",
  912: "Slowvannah, honey.",
  913: "בְּרֵאשִׁ֖ית",
  1111: "WAKE UP",
  1225: " 35^2, 49th triangular number. Merry Christmas. (Happy birthday, Katie)",
  1234: "5, 6, 9 and 10. Let me hear you scream if you want some more like ahhhhhhh push it push it watch me work it: I'm perfect. ",
  1337: " *tips fedora*",
  1488: "Let's play 'follow the leader'. How about you start with what he did in the bunker. ",
  1492: "Cristobal Colon sailed the ocean blue just doesn't have the same ring to it...",
  1618: "Φ phie pho phum",
  1729: "My friends Hardy and Ramanujan would like to have a word with you... ",
  1738: "We could just drink it straight. ",
  1945: "The only girl I ever loved was born with roses in her eyes.",
  1964: "90% silver. ",
  1979: "Cool kids never have the time. ",
  1984: "The party told you to reject the evidence of your eyes and ears. It was their final, most essential command.",
  1985: "Bruce Springsteen, Madonna. Way before Nirvana.",
  2001: "I’m sorry, Dave. I’m afraid I can’t do that.",
  2048: "Remember this game???",
  2112: "I can't wait to share this new wonder. The people will all see its light. Let them all make their own music.",
  2122: "Get out, get under. ",
  2468: "Who do we appreciate?",
  2701: "Wow... you... figured out one of the most important numbers... ever... Like literally mystery of the universe type shit... keep exploring. You have the divine spark within you. This is the ultimate easter egg. No number compares.",
  3008: "You're so 2000 and late. ",
  4321: "Earth below us: Drifting, falling. Floating weightless: calling, calling home. ",
  4950: " the 99th triangular number...",
  5050: " the 100th triangular number...",
  6174: "Abra Kaprekar-dabra Alakazam! This number is magic!",
  6969: "Nice. Nice.",
  8128: "PERFECT",
  9001: "ITS OVER 9000!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
  9999: " CLOSE BUT NO CIGAR!!! ",
  12345: "You're like a dream come true. Just want to be with you. You know it's plain to see that you're the only one for me. Repeat steps 1-3. Make you fall in love with me. If ever I believe my work is done, then I'll start it back at 1.",
  24601: "I stole a loaf of bread: My sister's child was close to death, and we were starving. ",
  25920: "Full cycle through the zodiac. ",
  42069: "“Everything in excess! To enjoy the flavor of life, take big bites. Moderation is for monks.” Robert A. Heinlein. ",
  65536: " Unicode, 64KB, 2^16, 4^8",
  69420: " Grow up. ",
  80085: " HEHEHEHEHEHEHEHEHEHE Calculator tiddies",
  80808: "Air raid I slang the math raider nation black cab psychic radio also known as only channel in our mobile lab.",
  84716: "Heaven on earth. IYKYK. ",
  86400: " Seconds in a day",
  90210: " Beverly Hills: That's where I wanna be. Gimme gimme, gimme gimme. ",
  98765: "4321? Desert Hot Springs!!! ",
  99991: "Largest 5-digit Prime number.",
  112358: "You must be some kind of fibonacci fan...",
  121234: " Count me off! ",
  123456: "Oh, did you think something super special would happen if you typed this number in or something???? You think this is significant???? There's no way you actually have this many... STOP POKING AROUND AND JUST BURN SOME CIRCLES ALREADY",
  144000: "I'll see you there, my friend.",
  161803: "Writing this code has been a φ-ver dream",
  186000: "Light speed: miles per second",
  192000: "There's a monkey in the jungle watching a vapor trail caught up in a conflict between his brain and his tail. And if time's elimination, then we got nothing to lose. Please repeat the message: It's the music that we choose.",
  210000: "Blocks between bitcoin halvings... (HODL my friend) ",
  210420: "Out of bed just after one, down in time to catch the sun. ",
  271828: "Anyone? Anyone? Euler? Euler? - Ferris Euler's Day Off",
  299792: "Light speed: km/s if you don't use freedom units.",
  314159: "Pi R Squared?? NO! PIES ARE ROUND!!!!!!!!",
  420420: "Blaze it. Blaze it.",
  481516: "23, 42. WHAT DO THEY MEAN?????.",
  525600: "Minutes in a year, my least favorite musical.",
  696969: "Nice. Nice. Nice.",
  867530: "9",
  999983: "Largest 6-digit prime",
  999999: "YOU WISH :)",
};

export default function BurnPage() {
  const router = useRouter();
  const { publicKey, sendTransaction, connected } = useWallet();
  const connection = useMemo(() => new Connection(RPC, "confirmed"), []);

  const [tokenBalance, setTokenBalance] = useState("0");
  const [physicalCircles, setPhysicalCircles] = useState("0");
  const [rawBalance, setRawBalance] = useState(0n);
  const [source, setSource] = useState(null);
  const [programId, setProgramId] = useState(TOKEN_PROGRAM_ID);
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const available = rawBalance / UNITS_PER_CIRCLE;

  const load = useCallback(async () => {
    if (!publicKey) return;
    setStatus("Loading balances…");
    try {
      const mintInfo = await connection.getAccountInfo(CIRCLES_MINT);
      const pid =
        mintInfo && mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
          ? TOKEN_2022_PROGRAM_ID
          : TOKEN_PROGRAM_ID;
      setProgramId(pid);

      const resp = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: CIRCLES_MINT,
      });

      let rows = resp.value.map((item) => ({
        pubkey: item.pubkey,
        raw: BigInt(item.account.data.parsed.info.tokenAmount.amount),
        ui: Number(item.account.data.parsed.info.tokenAmount.uiAmount || 0),
      }));

      if (rows.length === 0) {
        for (const pid2 of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
          try {
            const ata = await getAssociatedTokenAddress(
              CIRCLES_MINT,
              publicKey,
              true,
              pid2
            );
            const bal = await connection.getTokenAccountBalance(ata);
            rows.push({
              pubkey: ata,
              raw: BigInt(bal.value.amount),
              ui: Number(bal.value.uiAmount || 0),
            });
          } catch (_) {}
        }
      }

      let total = 0n;
      let ui = 0;
      let best = null;
      let bestRaw = 0n;
      for (const row of rows) {
        total += row.raw;
        ui += row.ui;
        if (row.raw > bestRaw) {
          bestRaw = row.raw;
          best = row.pubkey;
        }
      }

      setRawBalance(total);
      setSource(best);
      setTokenBalance(ui.toLocaleString(undefined, { maximumFractionDigits: 6 }));
      setPhysicalCircles((total / UNITS_PER_CIRCLE).toLocaleString());
      setStatus(
        rows.length ? "" : "It seems like you don't have any circles. YET."
      );
    } catch (e) {
      setStatus(`Failed to load token info: ${e.message || e}`);
      setTokenBalance("0");
      setPhysicalCircles("0");
      setRawBalance(0n);
      setSource(null);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function burn() {
    if (!publicKey) return setStatus("Connect wallet first.");
    if (!source) return setStatus("It seems like you don't have any circles. YET.");
    if (!/^[0-9]+$/.test(amount.trim())) {
      return setStatus("Entire circles only, please! (No decimals 'round here).");
    }

    const circles = BigInt(amount.trim());
    const egg = EGGS[amount.trim()] || "";
    if (egg) setStatus(egg);

    if (circles <= 0n) return setStatus("How do you expect to burn 0 circles?");
    if (circles > 999999n) return setStatus("I admire your confidence...");
    if (circles > available) {
      return setStatus(
        egg
          ? `${egg}\nYou only have ${available} physical circles worth of tokens, not quite enough. I wish you had more, too.`
          : `You only have ${available} physical circles worth of tokens, not quite enough. I wish you had more, too.`
      );
    }

    if (
      !window.confirm(
        `Burn ${circles * TOKENS_PER_CIRCLE} CIRCLES for ${circles} physical circle(s)?\n\nThis cannot be undone.`
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      if (!egg) setStatus("Preparing burn…");
      const ix = createBurnCheckedInstruction(
        source,
        CIRCLES_MINT,
        publicKey,
        circles * UNITS_PER_CIRCLE,
        DECIMALS,
        [],
        programId
      );
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(ix);
      if (!egg) setStatus("Waiting for wallet approval...");
      const sig = await sendTransaction(tx, connection, { maxRetries: 3 });
      const res = await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed"
      );
      if (res.value.err) throw new Error("Chain rejected the burn.");
      setStatus(egg || `Burn successful. ${sig}`);
      setAmount("");
      await load();
      router.push({
        pathname: "/redeem",
        query: { sig, circles: amount.trim() || String(circles) },
      });
    } catch (e) {
      const msg = String(e?.message || e);
      setStatus(
        /rejected/i.test(msg) ? "Cancelled in wallet." : `Burn failed: ${msg}`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "50px auto",
        padding: 30,
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
      <div style={{ margin: 25 }}>
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
            value={amount}
            inputMode="numeric"
            placeholder="Physical circles (whole number)"
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^[0-9]+$/.test(v)) setAmount(v);
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 14,
              marginTop: 20,
              fontSize: 16,
            }}
          />
          <button
            onClick={burn}
            disabled={busy}
            style={{
              width: "100%",
              padding: 16,
              marginTop: 15,
              fontSize: 18,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {busy ? "burning..." : "🔥 BURN NOW"}
          </button>
          {/^[0-9]+$/.test(amount) && BigInt(amount) > 0n && (
            <div style={{ marginTop: 16 }}>
              {BigInt(amount) % 10000n === 0n && BigInt(amount) >= 10000n && (
                <div style={{ fontSize: 33, fontWeight: 600 }}>
                  {(BigInt(amount) / 10000n).toString()} FULL SHEET
                  {BigInt(amount) / 10000n === 1n ? "" : "S"}
                </div>
              )}
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 10 }}>
                {amount} physical circle{amount === "1" ? "" : "s"}
                <br />({(BigInt(amount) * 1000n).toString()} CIRCLES token)
              </div>
            </div>
          )}
          <p style={{ marginTop: 20, fontSize: 13, opacity: 0.75 }}>
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
        <p style={{ marginTop: 20, whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {status}
        </p>
      )}
    </main>
  );
}
