import { useState } from "react";

export default function AuthGate({ onSubmit }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  function submit(e) {
    e.preventDefault();
    const ok = onSubmit(pw);
    if (!ok) setErr(true);
  }

  return (
    <div className="auth-screen">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 32 32" width="40" height="40" aria-hidden="true">
            <defs>
              <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#7C5CFF" />
                <stop offset="1" stopColor="#36D6C5" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#lg)" />
            <path
              d="M21 11.5a6 6 0 1 0 0 9"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <div className="auth-eyebrow">Conjourney</div>
        <h1>The Convi user journey, mapped.</h1>
        <p>
          A private flow editor for the merchant and shopper journeys. Enter
          the password to continue.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setErr(false);
            }}
            placeholder="••••••••••"
            autoFocus
            autoComplete="off"
          />
          {err && <div className="auth-err">That password isn't right.</div>}
          <button type="submit">Enter</button>
        </form>
        <div className="auth-footnote">Convi · Internal product map</div>
      </div>
    </div>
  );
}
