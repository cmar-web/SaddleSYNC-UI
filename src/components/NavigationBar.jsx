// src/components/NavigationBar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, clearCurrentUser } from "../lib/auth";
import logo from "../assets/saddlesynclogo.png";

export default function NavigationBar() {
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();

  // keep user state in sync for this tab and other tabs
  useEffect(() => {
    const update = () => setUser(getCurrentUser());
    //for other tabs
    window.addEventListener("storage", update); 
    // for this tab
    window.addEventListener("auth:changed", update);  
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("auth:changed", update);
    };
  }, []);

  function handleLogout() {
    clearCurrentUser();
    navigate("/", { replace: true });
  }

  const userDisplay = user?.Username || (user ? `User #${user.UserID}` : "");

  return (
    <header className="nav-header nav-green">
      <nav className="nav container">
        {/* left */}
        <Link to="/" className="brand--light">
          <img src={logo} alt="SaddleSync" className="logo" />
          <span className="brand-text">SaddleSync</span>
        </Link>

        {/* right */}
        <div className="actions">
          {!user ? (
            <>
              <NavLink to="/userSignUp" className="btn btn-light">Sign up</NavLink>
              <NavLink to="/login" className="btn btn-light btn-strong">Login</NavLink>
              <NavLink to="/search" className="cta-nav">
                <span>Find Nearby Stables</span><span className="arrow">→</span>
              </NavLink>
            </>
          ) : (
            <>
              {/* user badge */}
              <Link to="/profile" className="user-badge" title={`Logged in as ${userDisplay}`}>
                <span className="user-badge__label">Logged in as:</span>
                <span className="user-badge__name">{userDisplay}</span>
              </Link>

              <NavLink to="/stableSignUp" className="cta-nav">
                <span>Create Stable</span><span className="arrow">→</span>
              </NavLink>
              <button type="button" onClick={handleLogout} className="btn btn-light btn-strong">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
