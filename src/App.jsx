import { useCallback, useEffect, useState } from "react";
import AuthGate from "./components/AuthGate";
import Editor from "./components/Editor";
import PresenceProvider from "./components/PresenceProvider";
import { applyTheme, getInitialTheme } from "./lib/theme";

const PASSWORD = "$$Conjourney$$";
const STORAGE_KEY = "conjourney_auth_v1";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "ok") setAuthed(true);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

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

  if (!authed)
    return (
      <AuthGate onSubmit={attempt} theme={theme} onToggleTheme={toggleTheme} />
    );
  return (
    <PresenceProvider>
      <Editor
        onLogout={logout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </PresenceProvider>
  );
}
