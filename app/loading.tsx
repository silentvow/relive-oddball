// Renders while app/page.tsx awaits its server fetches (Supabase).
// Keep the layout footprint identical so the swap doesn't shift content.

export default function HomeLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-6 text-center">
        <div className="skeleton mx-auto h-7 w-72 rounded-md" />
        <div className="skeleton mx-auto mt-2 h-4 w-52 rounded-md" />
      </header>

      <div className="mb-4 skeleton h-9 rounded-slot" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
        <div className="skeleton h-56 rounded-card" />
        <div className="flex flex-col gap-1">
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className="skeleton h-12 rounded-slot" />
          ))}
        </div>
      </div>

      <div className="mt-5 skeleton h-12 rounded-card" />
    </main>
  );
}
