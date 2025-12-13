import { Link } from "react-router-dom";

export default function Boarding() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
      <div className="container mx-auto grid lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl shadow-elevated border border-[hsl(var(--border))] p-6 space-y-6">
          <header className="space-y-2">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Boarding request</p>
            <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Tell us about your horse</h1>
          </header>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--muted-foreground))]">First Name</label>
                <input className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2" placeholder="First name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--muted-foreground))]">Last Name</label>
                <input className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2" placeholder="Last name" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--muted-foreground))]">Phone Number</label>
                <input className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2" type="tel" placeholder="(xxx) xxx-xxxx" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--muted-foreground))]">Email</label>
                <input className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2" type="email" placeholder="name@email.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">Select horse(s) boarding</label>
              <div className="flex gap-2">
                <select className="flex-1 rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                  <option>Choose a horse</option>
                  <option>John</option>
                  <option>Johnathan</option>
                  <option>Denny</option>
                </select>
                <button type="button" className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--rich-brown))]">+</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">Notes</label>
              <textarea className="w-full rounded-2xl border border-[hsl(var(--border))] px-3 py-3" rows={4} placeholder="Any additional comments or concerns" />
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-[hsl(var(--rich-brown))]">Select desired dates</h3>
              <div className="flex gap-2">
                <button type="button" className="px-2 py-1 rounded-lg border border-[hsl(var(--border))]" aria-label="Prev">&lt;</button>
                <button type="button" className="px-2 py-1 rounded-lg border border-[hsl(var(--border))]" aria-label="Next">&gt;</button>
              </div>
            </div>
            <div className="text-sm text-[hsl(var(--muted-foreground))]">September 2025</div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm text-[hsl(var(--muted-foreground))]">
              {"Su Mo Tu We Th Fr Sa".split(" ").map((d) => (<span key={d}>{d}</span>))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {[1,2,3,4,5,6,7,21,22,23,24,25,26,27,28,29,30].map((day) => (
                <span
                  key={day}
                  className={`h-10 flex items-center justify-center rounded-full border ${day >=21 && day <=25 ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]"}`}
                >
                  {day}
                </span>
              ))}
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Select desired booking dates using calendar.</p>
            <Link to="/billing" className="w-full inline-flex justify-center px-5 py-3 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-soft">Payment and billing</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
