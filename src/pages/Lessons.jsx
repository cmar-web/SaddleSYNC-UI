import React from "react";

export default function Lessons() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
      <div className="container mx-auto grid lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl shadow-elevated border border-[hsl(var(--border))] p-6 space-y-6">
          <header className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center font-serif text-xl">LS</div>
            <div>
              <h1 className="text-2xl font-serif text-[hsl(var(--rich-brown))]">Ride with us</h1>
              <p className="text-[hsl(var(--muted-foreground))]">Tell us about you so we can match a lesson.</p>
            </div>
          </header>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">First Name</label>
              <input className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2" placeholder="First name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">Last Name</label>
              <input className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2" placeholder="Last name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">Phone</label>
              <input className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2" placeholder="(xxx) xxx-xxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">Experience level</label>
              <select className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">Email</label>
              <input className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2" type="email" placeholder="Email" />
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <label className="flex items-start gap-2 text-[hsl(var(--muted-foreground))]">
              <input type="checkbox" className="mt-1 rounded" />
              <span>I will need gear (helmets, boots). See recommendations in the gear guide.</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[hsl(var(--muted-foreground))]">Notes</label>
            <textarea className="w-full rounded-2xl border border-[hsl(var(--border))] px-3 py-3" rows={3} placeholder="Any additional comments or concerns" />
          </div>

          <button className="w-full md:w-auto px-5 py-3 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-soft">Submit inquiry</button>
        </section>

        <section className="space-y-4">
          <div className="bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Lesson availability</p>
                <h2 className="text-xl font-serif text-[hsl(var(--rich-brown))]">Select a day</h2>
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">September</div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm text-[hsl(var(--muted-foreground))]">
              {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {[...Array(28)].map((_, i) => {
                const day = i + 1;
                const active = day === 21;
                return (
                  <button
                    key={day}
                    className={`h-10 rounded-full border ${active ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]"}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Select from calendar availability.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 shadow-card">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Lesson Type</div>
              <div className="flex gap-2 mt-2">
                {['Private','Group'].map((opt) => (
                  <button key={opt} className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] bg-[hsl(var(--card))]">{opt}</button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 shadow-card">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Lesson Style</div>
              <div className="flex gap-2 mt-2">
                {['Western','English'].map((opt) => (
                  <button key={opt} className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] bg-[hsl(var(--card))]">{opt}</button>
                ))}
              </div>
            </div>
          </div>

          <button className="w-full md:w-auto px-5 py-3 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold bg-white shadow-card">Payment and billing</button>
        </section>
      </div>
    </main>
  );
}
