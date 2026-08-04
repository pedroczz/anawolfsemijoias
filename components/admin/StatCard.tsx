export default function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-rosa/30 bg-white p-5 shadow-sm">
      <p className="text-sm text-vinho/60">{label}</p>
      <p className="mt-1 font-display text-2xl text-vinho">{value}</p>
    </div>
  );
}
