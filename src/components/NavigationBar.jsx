// src/components/NavigationBar.jsx
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/saddlesynclogo.png";

export default function NavigationBar() {
  return (
    <header className="nav-header nav-green">
      <nav className="nav container">
        {/* left  */}
        <Link to="/" className="brand brand--light">
          <img src={logo} alt="SADDLESYNC" className="logo" />
          <span className="brand-text">SADDLESYNC</span>
        </Link>

        {/* right*/}
        <div className="actions">
          <NavLink to="/userSignUp" className="btn btn-light">Sign up</NavLink>
          <NavLink to="/userSignUp" className="btn btn-light btn-strong">Login</NavLink>
          <NavLink to="/search" className="cta-nav">
            <span>Find Nearby Stables</span>
            <span className="arrow">→</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
