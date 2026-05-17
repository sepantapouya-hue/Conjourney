import { useEffect, useState } from "react";
import AuthGate from "./components/AuthGate";
import Editor from "./components/Editor";

const PASSWORD = "$$Conjourney$$";
const STORAGE_KEY = "conjourney_auth_v1";

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "ok") setAuthed(true);
  }, []);

  function attempt(password) {
    if (password === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "ok");
      setAuthed(true);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  }

  if (!authed) return <AuthGate onSubmit={attempt} />;
  return <Editor onLogout={logout} />;
}
