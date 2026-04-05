import { useEffect, useState } from "react";
import SideBar from "./pages/SideBar";
import Home from "./pages/Home";
import "./App.css";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [activePanel, setActivePanel] = useState("home");

  // ───────── Auth ─────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      window.history.replaceState({}, "", "/");
      return;
    }

    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(
          "https://lancherixstudio-backend.onrender.com/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!res.ok) throw new Error();
        const userData = await res.json();
 
        if (userData.role !== "allclearance") {
          throw new Error("Unauthorized role");
        }

        setUser(userData);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
      }
    };

    fetchUser();
  }, [token]);

  /*const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };*/

  // ───────── UI ─────────

  if (!token) {
    return (
      <div className="auth-screen">
        <h1>Lancherix Labs</h1>
        <button onClick={() => window.location.href =
          "https://auth.lancherix.com/login?app=labs"}>
          Sign in
        </button>
        <button onClick={() => window.location.href =
          "https://auth.lancherix.com/register?app=labs"}>
          Register
        </button>
      </div>
    );
  }

  if (!user) return <div className="loading">Loading…</div>;

  return (
    <div className="desktop">
      <SideBar
        user={user}
        onSelect={setActivePanel}
      />

      <div className="assistant-window">
        <Home />
      </div>
    </div>
  );
}