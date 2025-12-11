import { Link } from "react-router-dom";

export default function BoardingInfo() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
      <div className="container mx-auto grid lg:grid-cols-[1.5fr,1fr] gap-8">
        <section className="bg-white rounded-3xl shadow-elevated border border-[hsl(var(--border))] p-6 space-y-6">
          <header className="space-y-2">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Boarding services</p>
            <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Care that feels like home</h1>
            <p className="text-[hsl(var(--muted-foreground))]">What we include for every horse.</p>
          </header>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-card">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Stall features</p>
              <ul className="mt-2 space-y-2 text-[hsl(var(--rich-brown))]">
                <li>12x12 matted stalls</li>
                <li>Automatic waterers</li>
                <li>Daily cleaning</li>
                <li>Hay and grain included</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-card">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Care</p>
              <ul className="mt-2 space-y-2 text-[hsl(var(--rich-brown))]">
                <li>24/7 care</li>
                <li>Supplement feeding</li>
                <li>Daily turnout</li>
                <li>Blanketing</li>
              </ul>
            </div>
          </div>
        </section>

        <aside className="bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-6 space-y-4">
          <h2 className="text-xl font-serif text-[hsl(var(--rich-brown))]">Pricing</h2>
          <div className="px-4 py-2 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold inline-block">$600 deposit</div>
          <ul className="space-y-2 text-[hsl(var(--rich-brown))]">
            <li className="flex items-center justify-between"><span>Month to month</span><b>$850/mo</b></li>
            <li className="flex items-center justify-between"><span>&lt; 2 months</span><b>$800/mo</b></li>
            <li className="flex items-center justify-between"><span>2-6 months</span><b>$700/mo</b></li>
            <li className="flex items-center justify-between"><span>&gt; 6 months</span><b>$600/mo</b></li>
          </ul>
          <Link to="/boarding" className="inline-flex justify-center px-5 py-3 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-soft">
            Book now
          </Link>
        </aside>
      </div>
    </main>
  );
}
