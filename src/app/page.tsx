import { StatCard } from "@/components/stat-card";
import { getMetrics, listDocuments } from "@/lib/service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [metrics, recentDocuments] = await Promise.all([getMetrics(), listDocuments(8)]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Templates" value={metrics.templateCount} subtitle="Reusable business templates" />
        <StatCard title="Documents" value={metrics.documentCount} subtitle="Generated artifacts" />
        <StatCard title="Generated Today" value={metrics.generationToday} subtitle="Last 24 hours activity" />
        <StatCard title="Success Rate" value={`${metrics.successRate}%`} subtitle="Generation reliability" />
      </section>

      <section className="panel p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Recent Outputs</h2>
          <p className="text-sm text-slate-400">Latest generated documents from your workflow</p>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
            No generated documents yet. Create a template and generate your first output.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-2 py-3">Title</th>
                  <th className="px-2 py-3">Template ID</th>
                  <th className="px-2 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((document) => (
                  <tr key={document.id} className="border-t border-slate-800 text-slate-200">
                    <td className="px-2 py-3">{document.title}</td>
                    <td className="px-2 py-3 font-mono text-xs text-slate-400">{document.templateId}</td>
                    <td className="px-2 py-3 text-slate-400">{new Date(document.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
