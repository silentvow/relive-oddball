export default function ShareLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <header className="mb-6 text-center">
        <div className="skeleton mx-auto h-3 w-24 rounded-md" />
        <div className="skeleton mx-auto mt-2 h-7 w-72 rounded-md" />
        <div className="skeleton mx-auto mt-2 h-4 w-56 rounded-md" />
      </header>

      <div className="mb-6 grid grid-cols-1 gap-1.5 rounded-card border-[1.5px] border-edge bg-cream-card p-4 sm:grid-cols-2 sm:gap-x-6">
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className="skeleton h-12 rounded-slot" />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="skeleton h-9 w-32 rounded-full" />
        <div className="skeleton h-9 w-28 rounded-full" />
      </div>
    </main>
  );
}
