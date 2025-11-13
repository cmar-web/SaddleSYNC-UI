// src/components/Footer.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, clearSession, AUTH_EVENT } from "../lib/auth";
import logo from "../assets/saddlesynclogo.png";
import "../styles/footer.css";

export default function Footer() {
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

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <Link to="/" className="footer-logo-link">
            <img src={logo} alt="SaddleSync" className="footer-logo" />
            <span className="footer-brand-text">SaddleSync</span>
          </Link>
        </div>

        <div className="footer-links">

              <NavLink to="/contactUs" className="footer-link">Contact Us</NavLink>

        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SaddleSync. All rights reserved.</p>
      </div>
    </footer>
  );
}
