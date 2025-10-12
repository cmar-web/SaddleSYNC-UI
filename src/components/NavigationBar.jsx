// navigationbar.jsx
import { NavLink } from "react-router-dom";

export default function NavigationBar() {
  const linkClass = ({ isActive }) => isActive ? "link active" : "link";

  return (
    <header className="nav-header">
      <nav className="nav container">
        <NavLink to="/" className="brand">SADDLE SYNC</NavLink>
        <div className="links">
          <NavLink to="/search" className={linkClass}>Nearby Stables</NavLink>
          <NavLink to="/lessons" className={linkClass}>Find Lessons</NavLink>
          <NavLink to="/boarding" className={linkClass}>Find Boarding</NavLink>
          <NavLink to="/profile" className={linkClass}>My Profile</NavLink>
        </div>
      </nav>
    </header>
  );
}
