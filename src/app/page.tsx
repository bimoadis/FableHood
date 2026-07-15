'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const handleCopyCA = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('0xF00D0000000000000000000000000000B453');
      alert('Contract address copied!');
    }
  };

  return (
    <div>
      {/* Contract ticker bar */}
      <div className="ticker">
        <div className="wrap">
          <span>🍞 <b>$FOOD</b></span>
          <span className="addr">0xF00D…B453</span>
          <button onClick={handleCopyCA}>Copy CA</button>
        </div>
      </div>

      {/* Header */}
      <header>
        <div className="wrap nav">
          <div className="brand">
            <svg width="34" height="34" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <polygon points="86,6 70,10 62,26 56,40 66,38 74,26 82,18" fill="#e4713c" />
              <path d="M20 46 L26 34 L38 24 L52 18 L64 20 L70 30 L70 40 L60 42 L60 50 L26 50 L20 46 Z" fill="#14814f" />
              <path d="M20 46 L70 40 L70 50 L20 50 Z" fill="#0a4b30" />
              <path d="M14 50 L20 46 L70 40 L76 46 L76 54 L14 54 Z" fill="#14814f" />
              <path d="M10 58 Q10 50 18 50 L78 50 Q86 50 86 58 L86 66 Q86 70 82 70 L82 78 L74 78 L74 70 L64 70 L64 78 L56 78 L56 70 L40 70 L40 78 L32 78 L32 70 L22 70 L22 78 L14 78 L14 70 Q10 70 10 66 Z" fill="#f2a17a" />
              <rect x="30" y="56" width="9" height="9" fill="#fafbf9" />
              <rect x="58" y="56" width="9" height="9" fill="#fafbf9" />
            </svg>
            <span>$FOOD<small>Fable Hood · Robinhood Chain</small></span>
          </div>
          <nav className="navlinks">
            <a href="#scan">Scan</a>
            <a href="#security">Security</a>
            <a href="#tools">Tools</a>
            <a href="#process">Process</a>
          </nav>
          <Link href="/scan" className="btn btn-primary notch-sm">
            Launch Console
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="scan">
        <div className="wrap">
          <div className="scan-target">
            <svg className="mascot" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <polygon points="86,6 70,10 62,26 56,40 66,38 74,26 82,18" fill="#e4713c" />
              <path d="M20 46 L26 34 L38 24 L52 18 L64 20 L70 30 L70 40 L60 42 L60 50 L26 50 L20 46 Z" fill="#14814f" />
              <path d="M20 46 L70 40 L70 50 L20 50 Z" fill="#0a4b30" />
              <path d="M14 50 L20 46 L70 40 L76 46 L76 54 L14 54 Z" fill="#14814f" />
              <path d="M10 58 Q10 50 18 50 L78 50 Q86 50 86 58 L86 66 Q86 70 82 70 L82 78 L74 78 L74 70 L64 70 L64 78 L56 78 L56 70 L40 70 L40 78 L32 78 L32 70 L22 70 L22 78 L14 78 L14 70 Q10 70 10 66 Z" fill="#f2a17a" />
              <rect x="30" y="56" width="9" height="9" fill="#fafbf9" />
              <rect x="58" y="56" width="9" height="9" fill="#fafbf9" />
            </svg>
            <div className="reticle">
              <span className="corner tl"></span>
              <span className="corner tr"></span>
              <span className="corner bl"></span>
              <span className="corner br"></span>
              <span className="sweep"></span>
            </div>
          </div>

          <div className="pill" style={{ marginBottom: '26px' }}>
            <span className="dot"></span> READY · Live on Robinhood L2
          </div>

          <h1>
            <span className="strike">Not another rug</span>
            Scan, Detect, and <span className="accent">Trade Safely</span> on Robinhood Chain
          </h1>
          <p className="sub">
            $FOOD (Fable Hood) audits DeFi assets and Tokenized RWAs on Robinhood Chain — verifying Arbitrum Orbit smart contracts, liquidity, and ownership before you sign.
          </p>

          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/scan" className="btn btn-primary notch-sm">
              Start Forensic Scan
            </Link>
          </div>

          <div className="trust">
            <span><b>12,482</b> contracts scanned today</span>
            <span><b>340</b> security flags caught</span>
            <span><b>100ms</b> L2 block time (Arbitrum Orbit)</span>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="section" id="security">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Four checks, one scan</h2>
              <p>Every address run through $FOOD clears the same set of traps before you ever get a green light.</p>
            </div>
            <div className="section-tag">// security.modules</div>
          </div>

          <div className="grid4">
            <div className="card notch">
              <div className="card-top">
                <div className="card-code">HONEY</div>
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3h6M10 3v5.5L4.8 17a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 8.5V3" />
                    <path d="M7.5 14h9" />
                  </svg>
                </div>
              </div>
              <h3>Honeypot Sandbox</h3>
              <p>Simulates a real buy and sell against the contract to confirm you can actually exit the trade.</p>
              <div className="stat"><span>●</span> Sell path verified</div>
            </div>

            <div className="card notch">
              <div className="card-top">
                <div className="card-code o">LIQ</div>
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
                  </svg>
                </div>
              </div>
              <h3>Liquidity Tracker</h3>
              <p>Watches pooled liquidity in real time and flags sudden pulls before they hit your wallet.</p>
              <div className="stat"><span>●</span> $482K locked, 180d</div>
            </div>

            <div className="card notch">
              <div className="card-top">
                <div className="card-code">OWN</div>
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <h3>Ownership Audit</h3>
              <p>Checks who still holds the keys — renounced, multisig, or a single wallet with full control.</p>
              <div className="stat"><span>●</span> Ownership renounced</div>
            </div>

            <div className="card notch">
              <div className="card-top">
                <div className="card-code w">TAX</div>
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7" cy="7" r="3" />
                    <circle cx="17" cy="17" r="3" />
                    <path d="M18 6L6 18" />
                  </svg>
                </div>
              </div>
              <h3>Dynamic Tax Detection</h3>
              <p>Reads the live buy and sell tax, including hidden ramps that only trigger after launch.</p>
              <div className="stat warn"><span>●</span> Sell tax rises after block 40</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="section" id="tools" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Real tools. Real chain data.</h2>
              <p>Every module below is backed by a live Robinhood L2 RPC call or local execution simulation, not a canned answer.</p>
            </div>
            <div className="section-tag">// under.the_hood</div>
          </div>

          <div className="tooltable">
            <div className="toolrow">
              <div className="fn"><span>simulate_buy_sell</span>()</div>
              <div className="src">Robinhood mainnet fork</div>
              <div className="badge">Live</div>
            </div>
            <div className="toolrow">
              <div className="fn"><span>get_liquidity_lock</span>()</div>
              <div className="src">DEX pool reader</div>
              <div className="badge">Live</div>
            </div>
            <div className="toolrow">
              <div className="fn"><span>get_ownership</span>()</div>
              <div className="src">Contract state reader</div>
              <div className="badge">Live</div>
            </div>
            <div className="toolrow">
              <div className="fn"><span>get_tax_schedule</span>()</div>
              <div className="src">Bytecode simulation</div>
              <div className="badge">Live</div>
            </div>
            <div className="toolrow">
              <div className="fn"><span>get_holder_distribution</span>()</div>
              <div className="src">Chain indexer</div>
              <div className="badge">Live</div>
            </div>
            <div className="toolrow">
              <div className="fn"><span>verdict_engine</span>()</div>
              <div className="src">Composite risk score</div>
              <div className="badge">Live</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section" id="process">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Simple on the surface. Thorough underneath.</h2>
              <p>The same four-stage pipeline runs on every address, in this order, every time.</p>
            </div>
            <div className="section-tag">// scan.pipeline</div>
          </div>

          <div className="process">
            <div className="step">
              <span className="n mono">01 · PASTE</span>
              <h4>Drop the address</h4>
              <p>Paste any Robinhood Chain contract address into the scanner — no wallet connection required to run a check.</p>
            </div>
            <div className="step">
              <span className="n mono">02 · FORK</span>
              <h4>Simulate the trade</h4>
              <p>$FOOD forks Robinhood mainnet L2 and runs transaction simulations to verify contract behavior.</p>
            </div>
            <div className="step">
              <span className="n mono">03 · AUDIT</span>
              <h4>Read the contract</h4>
              <p>Ownership, liquidity locks, and tax logic are pulled straight from chain state and bytecode.</p>
            </div>
            <div className="step">
              <span className="n mono">04 · VERDICT</span>
              <h4>Get the call</h4>
              <p>Everything rolls up into a single pass or flag verdict, in about two seconds.</p>
            </div>
          </div>

          <div style={{ height: '18px' }}></div>

          <div className="verdict notch">
            <div className="verdict-left">
              <div className="verdict-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <h3>The hoard may be hidden. The tell usually isn't.</h3>
                <p>Paste an address above and let $FOOD run the full pipeline before you sign anything.</p>
              </div>
            </div>
            <Link href="/scan" className="btn btn-primary notch-sm">
              Scan a Token
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap foot-row">
          <div className="foot-brand">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="22">
              <polygon points="86,6 70,10 62,26 56,40 66,38 74,26 82,18" fill="#e4713c" />
              <path d="M20 46 L26 34 L38 24 L52 18 L64 20 L70 30 L70 40 L60 42 L60 50 L26 50 L20 46 Z" fill="#14814f" />
              <path d="M10 58 Q10 50 18 50 L78 50 Q86 50 86 58 L86 66 Q86 70 82 70 L82 78 L74 78 L74 70 L64 70 L64 78 L56 78 L56 70 L40 70 L40 78 L32 78 L32 70 L22 70 L22 78 L14 78 L14 70 Q10 70 10 66 Z" fill="#f2a17a" />
            </svg>
            $FOOD · Fable Hood
          </div>
          <div className="foot-links">
            <a href="#tools">Docs</a>
            <a href="#tools">API</a>
            <a href="#">Twitter</a>
            <a href="#">Telegram</a>
          </div>
          <div>© 2026 Fable Hood. Not financial advice.</div>
        </div>
      </footer>
    </div>
  );
}
