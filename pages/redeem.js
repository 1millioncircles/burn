import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Redeem() {
  const router = useRouter();
  const { publicKey } = useWallet();

  const sig = typeof router.query.sig === "string" ? router.query.sig : "";
  const circlesStr = typeof router.query.circles === "string" ? router.query.circles : "";

  const redemptionEmail = "1millioncircles@gmail.com"; 
  const subject = "CIRCLES physical redemption request";

  const emailBodyPlain = useMemo(() => {
    const lines = [
      "Hello,",
      "",
      "Following a successful token burn, I hereby submit a formal request to redeem my physical circles!",
      " . ",
" ",
      "",
      "• Number of physical circles burned:",
      circlesStr || "(missing)",
      "",
      "• Transaction signature (redeem code):",
      sig || "(missing)",
      "",
      "• Wallet address used for burn:",
      publicKey ? publicKey.toBase58() : "(not connected)",
      "",
      "• Full legal name:",
      "[ENTER NAME]",
      "",
      "• Mailing address:",
      "[ENTER FULL ADDRESS or PO BOX, INCLUDING COUNTRY.]",
      "",
      "• Contact info (if different from this email):",
      "[ENTER EMAIL / PHONE # / ETC]",
      "",

      "• Additional comments / requests / shipping instructions: ",
"[INTERNATIONAL, FIRST CLASS, OR PERSONAL HAND-DELIVERY MAY REQUIRE ADDITIONAL SHIPPING COSTS, HOWEVER I WILL TRY MY BEST TO HONOR THESE REQUESTS]",
      "",
      "I hereby acknowledge that physical circles will only be shipped, after 1 million have been completed.",
      "",
      "Thank you,",
      "[YOUR NAME]",
    ];
    return lines.join("\n");
  }, [sig, circlesStr, publicKey]);

  const mailtoHref = useMemo(() => {
    const subjectEnc = encodeURIComponent(subject);
    const bodyEnc = encodeURIComponent(emailBodyPlain);
    return `mailto:${redemptionEmail}?subject=${subjectEnc}&body=${bodyEnc}`;
  }, [redemptionEmail, subject, emailBodyPlain]);

  const [copyStatus, setCopyStatus] = useState("");

  const handleCopyAndEmail = useCallback(async () => {
    setCopyStatus("");
    try {
      await navigator.clipboard.writeText(emailBodyPlain);
      setCopyStatus("Copied email text ✅ Opening your email app…");
    } catch {
      setCopyStatus("Couldn’t auto-copy. Opening your email app anyway…");
    }
    window.location.href = mailtoHref;
  }, [emailBodyPlain, mailtoHref]);

  return (
    <main style={{ maxWidth: 780, margin: "40px auto", padding: 20, textAlign: "center", fontFamily: "system-ui" }}>
      <h1 style={{ marginTop: 0 }}>THANK YOU FOR BURNING <br />(OPTIONAL) Redeem your physical circles: <br />
1millioncircles@gmail.com</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: 13, opacity: 0.75 }}><div
  style={{
    fontSize: 15,
    lineHeight: 1.6,
    marginBottom: 14,
  }}
>
  <b>Congratulations on your monumental achievement, and for becoming part of history by burning CIRCLES.</b> <br />
I honor you for standing among an esteemed and noble class of art appreciators, refined cultural pioneers, and complete degenerates alike.
  <br />
  <br />
  <b>You now have a bold choice to make:</b> <br />Do nothing, close this page, remain anonymous, go on with your life,<br /> and your circles will be burned forever,<br /> (very cool) <br />
or:

  <br />
 <b>To redeem your physical circles, please continue below.</b><br />
All personal information remains secure until shipment and will be deleted shortly thereafter unless otherwise explicitly stated.
</div>

      <div style={{ marginTop: 16, fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>
        Each burn transaction obviously can only be redeemed once.<br />
In the highly unlikely event of multiple claims for the same transaction, redemption can only be honored for the wallet that performed the burn, and further verification may be required.
        <br />
      </div>

<div style={{ marginTop: 14, fontSize: 13, opacity: 0.75, textAlign: "center" }}>
  Email text (what will be copied):
</div>

<div
  style={{
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #eee",
    background: "#fafafa",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 1.5,
    maxHeight: 260,
    overflow: "auto",
  }}
>
  {emailBodyPlain.split("\n").map((line, i) => {
    const isLabel =

      line.startsWith("I hereby") ||
line.startsWith("Following") ||
 line.startsWith("• Additional") ||
 line.startsWith("• Contact info") ||
      line.startsWith("• Mailing address") ||
      line.startsWith("• Contact email") ||
      line.startsWith("• Full legal name") ||
      line.startsWith("• Wallet address") ||
      line.startsWith("• Transaction signature") ||
      line.startsWith("• Number of physical circles") ||
line.startsWith("Thank") ;


    return (
      <div key={i} style={{ marginBottom: 4 }}>
        {isLabel ? <b>{line}</b> : line}
      </div>
    );
  })}
</div>


        </div>
      </div>

      <button
        onClick={handleCopyAndEmail}
        style={{
          marginTop: 18,
          padding: "14px 16px",
          borderRadius: 12,
          border: "2px solid #111",
          fontWeight: 800,
          background: "white",
          cursor: "pointer",
        }}
      >
        Copy + Open Email
      </button>

      {copyStatus && (
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
          {copyStatus}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <button
          onClick={() => router.push("/burn")}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Back to burn
        </button>
      </div>
    </main>
  );
}
