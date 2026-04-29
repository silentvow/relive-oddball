export default function ResultsLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <header className="mb-6 text-center">
        <div className="skeleton mx-auto h-7 w-64 rounded-md" />
        <div className="skeleton mx-auto mt-2 h-4 w-44 rounded-md" />
      </header>

      <div className="mb-4 skeleton h-9 rounded-slot" />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="skeleton h-80 rounded-card" />
        <div className="skeleton h-80 rounded-card" />
      </div>

      <div className="mb-6 skeleton h-72 rounded-card" />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="skeleton h-9 w-32 rounded-full" />
        <div className="skeleton h-9 w-16 rounded-full" />
        <div className="skeleton h-9 w-28 rounded-full" />
      </div>
    </main>
  );
}
