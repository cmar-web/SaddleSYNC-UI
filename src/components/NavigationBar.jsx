import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, clearSession, AUTH_EVENT } from "../lib/auth";
import logo from "../assets/saddlesynclogo.png";

export default function NavigationBar() {
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => setUser(getCurrentUser());
    window.addEventListener("storage", update);
    window.addEventListener(AUTH_EVENT, update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(AUTH_EVENT, update);
    };
  }, []);

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
  }

  const userDisplay = user?.Username || (user ? `User #${user.UserID}` : "");

  return (
    <header className="border-b border-[hsl(var(--border))] bg-white/90 backdrop-blur">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="SaddleSync" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">SaddleSync</p>
            <p className="text-lg font-serif text-[hsl(var(--rich-brown))]">Find barns that fit</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <NavLink to="/search" className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold bg-[hsl(var(--card))] shadow-card">
            Browse
          </NavLink>
          <NavLink to="/stableSignUp" className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-soft">
            List a stable
          </NavLink>
          {!user ? (
            <>
              <NavLink to="/login" className="px-4 py-2 rounded-xl text-[hsl(var(--rich-brown))] font-semibold">
                Log in
              </NavLink>
              <NavLink to="/userSignUp" className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold bg-[hsl(var(--muted))]">
                Sign up
              </NavLink>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="px-3 py-2 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--rich-brown))] font-semibold"
                title={`Logged in as ${userDisplay}`}
              >
                {userDisplay}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold bg-white shadow-card"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
