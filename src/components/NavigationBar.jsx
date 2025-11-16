// src/components/NavigationBar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, clearSession, AUTH_EVENT } from "../lib/auth";
import logo from "../assets/saddlesynclogo.png";
import "../styles/navBar.css";

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
    <header className="nav-header nav-green">
      <nav className="nav container">
        <Link to="/" className="brand--light">
          <img src={logo} alt="SaddleSync" className="logo" />
          <span className="brand-text">SADDLESYNC</span>
        </Link>

        <div className="actions">
          {!user ? (
            <>
              <NavLink to="/userSignUp" className="btn btn-light">
                Sign up
              </NavLink>
              <NavLink to="/login" className="btn btn-light">
                Login
              </NavLink>
              <NavLink to="/search" className="btn btn-light btn-strong">
                <span>Find Nearby Stables</span>
                <span className="arrow">→</span>
              </NavLink>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="user-badge"
                title={`Logged in as ${userDisplay}`}
              >
                <span className="user-badge__label">Logged in as:</span>
                <span className="user-badge__name">{userDisplay}</span>
              </Link>

              <NavLink to="/stableSignUp" className="cta-nav">
                <span>Create Stable</span>
                <span className="arrow">→</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-light btn-strong"
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
