import { Link } from "react-router-dom";
import logo from "../assets/saddlesynclogo.png";

export default function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] mt-12">
      <div className="container mx-auto px-6 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="SaddleSync" className="h-10 w-auto" />
          <div>
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">SaddleSync</p>
            <p className="text-lg font-serif text-[hsl(var(--rich-brown))]">For riders & barns</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-[hsl(var(--muted-foreground))]">
          <Link to="/search" className="hover:text-[hsl(var(--rich-brown))] font-medium">Browse</Link>
          <Link to="/stableSignUp" className="hover:text-[hsl(var(--rich-brown))] font-medium">List a stable</Link>
          <Link to="/contactUs" className="hover:text-[hsl(var(--rich-brown))] font-medium">Contact</Link>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--border))] bg-white/60">
        <div className="container mx-auto px-6 py-4 text-sm text-[hsl(var(--muted-foreground))] flex items-center justify-between">
          <span>© {new Date().getFullYear()} SaddleSync. All rights reserved.</span>
          <span className="hidden sm:inline">Made for movers, riders, and their horses.</span>
        </div>
      </div>
    </footer>
  );
}
