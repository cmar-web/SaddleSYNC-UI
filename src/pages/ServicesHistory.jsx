export default function ServicesHistory() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-8 space-y-4">
          <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Past bookings</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Past lessons and services will be shown here in a future update. For now, check your profile to review your booking activity.
          </p>
        </div>
      </div>
    </main>
  );
}
