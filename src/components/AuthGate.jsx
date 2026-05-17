import { useState } from "react";
import Logo from "./Logo";

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
          <Logo size={48} />
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
