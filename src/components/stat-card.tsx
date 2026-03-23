export function StatCard({
  title,
  value,
  subtitle
}: {
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <article className="panel p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </article>
  );
}
