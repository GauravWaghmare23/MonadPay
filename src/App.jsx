import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  SIDEBET_ADDRESS,
  USDC_ADDRESS,
  RESOLVER_ADDRESS,
  SIDEBET_ABI,
  USDC_ABI,
  USDC_DECIMALS
} from "./constants";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  const [amount, setAmount] = useState("");
  const [totalYes, setTotalYes] = useState("0");
  const [totalNo, setTotalNo] = useState("0");
  const [resolved, setResolved] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [claimed, setClaimed] = useState(false);

  // ✅ selected side (from URL or click)
  const [selectedSide, setSelectedSide] = useState(null);

  // ADMIN – Telegram post generator
  const [question, setQuestion] = useState("");
  const [deadlineText, setDeadlineText] = useState("");

  // ---------------- READ URL PARAM ----------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const side = params.get("side");
    if (side === "yes" || side === "no") {
      setSelectedSide(side);
    }
  }, []);

  // ---------------- CONNECT ----------------
  async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask not found");

    const prov = new ethers.BrowserProvider(window.ethereum);
    const sign = await prov.getSigner();
    setProvider(prov);
    setSigner(sign);
    setAccount(await sign.getAddress());
  }

  // ---------------- LOAD STATE ----------------
  async function loadState() {
    if (!provider) return;

    const bet = new ethers.Contract(
      SIDEBET_ADDRESS,
      SIDEBET_ABI,
      provider
    );

    setTotalYes(
      ethers.formatUnits(await bet.totalYes(), USDC_DECIMALS)
    );
    setTotalNo(
      ethers.formatUnits(await bet.totalNo(), USDC_DECIMALS)
    );

    const r = await bet.resolved();
    setResolved(r);
    if (r) setOutcome(await bet.outcome());
  }

  useEffect(() => {
    loadState();
  }, [provider]);

  // ---------------- ACTIONS ----------------
  async function approveUSDC() {
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
    await (
      await usdc.approve(
        SIDEBET_ADDRESS,
        ethers.parseUnits(amount, USDC_DECIMALS)
      )
    ).wait();
  }

  async function placeBet() {
    if (!selectedSide) return alert("Select YES or NO");
    if (!amount) return alert("Enter amount");

    const bet = new ethers.Contract(
      SIDEBET_ADDRESS,
      SIDEBET_ABI,
      signer
    );

    const parsed = ethers.parseUnits(amount, USDC_DECIMALS);

    const tx =
      selectedSide === "yes"
        ? await bet.betYes(parsed)
        : await bet.betNo(parsed);

    await tx.wait();
    setAmount("");
    loadState();
  }

  async function resolveBet(v) {
    const bet = new ethers.Contract(
      SIDEBET_ADDRESS,
      SIDEBET_ABI,
      signer
    );
    await (await bet.resolve(v)).wait();
    loadState();
  }

  async function claim() {
    const bet = new ethers.Contract(
      SIDEBET_ADDRESS,
      SIDEBET_ABI,
      signer
    );
    await (await bet.claim()).wait();
    setClaimed(true);
  }

  // ---------------- TELEGRAM MESSAGE ----------------
  function telegramMessage() {
    const base = window.location.origin;
    return `📊 *SIDE BET*

${question}

⏰ Deadline: ${deadlineText}

YES ✅
${base}?side=yes

NO ❌
${base}?side=no`;
  }

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-6">
          SideBet
        </h1>

        {!account && (
          <button
            onClick={connectWallet}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold"
          >
            Connect MetaMask
          </button>
        )}

        {account && (
          <div className="space-y-5">

            <p className="text-xs text-zinc-400 break-all">
              Wallet: {account}
            </p>

            {/* POOLS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-900/30 p-4 rounded-xl text-center">
                <p className="text-xs text-green-400">YES</p>
                <p className="text-xl font-bold">{totalYes}</p>
              </div>
              <div className="bg-red-900/30 p-4 rounded-xl text-center">
                <p className="text-xs text-red-400">NO</p>
                <p className="text-xl font-bold">{totalNo}</p>
              </div>
            </div>

            {/* BETTING */}
            {!resolved && (
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Amount (USDC)"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-800"
                />

                <button
                  onClick={approveUSDC}
                  className="w-full py-2 bg-zinc-700 rounded-xl"
                >
                  Approve USDC
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedSide("yes")}
                    className={`flex-1 py-3 rounded-xl ${
                      selectedSide === "yes"
                        ? "bg-green-500 ring-2 ring-green-300"
                        : "bg-green-700"
                    }`}
                  >
                    YES
                  </button>

                  <button
                    onClick={() => setSelectedSide("no")}
                    className={`flex-1 py-3 rounded-xl ${
                      selectedSide === "no"
                        ? "bg-red-500 ring-2 ring-red-300"
                        : "bg-red-700"
                    }`}
                  >
                    NO
                  </button>
                </div>

                <button
                  onClick={placeBet}
                  className="w-full py-3 bg-indigo-600 rounded-xl"
                >
                  Place Bet
                </button>
              </div>
            )}

            {/* ADMIN RESOLVER */}
            {account === RESOLVER_ADDRESS && !resolved && (
              <div className="border-t border-zinc-700 pt-4">
                <p className="text-sm text-zinc-400 mb-2">
                  Admin Resolver Panel
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => resolveBet(true)}
                    className="flex-1 py-2 bg-green-700 rounded-xl"
                  >
                    Resolve YES
                  </button>
                  <button
                    onClick={() => resolveBet(false)}
                    className="flex-1 py-2 bg-red-700 rounded-xl"
                  >
                    Resolve NO
                  </button>
                </div>
              </div>
            )}

            {/* CLAIM */}
            {resolved && !claimed && (
              <button
                onClick={claim}
                className="w-full py-3 bg-indigo-600 rounded-xl"
              >
                Claim ({outcome ? "YES" : "NO"})
              </button>
            )}

            {/* FINAL */}
            {resolved && claimed && (
              <div className="text-center text-zinc-400">
                <p className="font-semibold">Market Closed</p>
                <p>Final Outcome: {outcome ? "YES" : "NO"}</p>
              </div>
            )}

            {/* ADMIN – TELEGRAM POST */}
            {account === RESOLVER_ADDRESS && (
              <div className="border-t border-zinc-700 pt-4 space-y-3">
                <p className="text-sm text-zinc-400">
                  Telegram Post Generator
                </p>

                <input
                  placeholder="Question"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  className="w-full p-2 rounded-lg bg-zinc-800"
                />

                <input
                  placeholder="Deadline text"
                  value={deadlineText}
                  onChange={e => setDeadlineText(e.target.value)}
                  className="w-full p-2 rounded-lg bg-zinc-800"
                />

                <textarea
                  rows={6}
                  readOnly
                  value={telegramMessage()}
                  className="w-full p-2 rounded-lg bg-zinc-800 text-xs"
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
