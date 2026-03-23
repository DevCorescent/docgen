"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { extractVariables } from "@/lib/template";
import type { Template } from "@/lib/types";

type ApiResponse<T> = {
  data?: T;
  error?: string;
  details?: string[];
};

type TemplateForm = {
  name: string;
  description: string;
  content: string;
};

const defaultTemplateForm: TemplateForm = {
  name: "",
  description: "",
  content: ""
};

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || json.data === undefined) {
    throw new Error(json.error ?? "Request failed.");
  }
  return json.data;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<TemplateForm>(defaultTemplateForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const visibleTemplates = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return templates;
    }
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(normalized) ||
        template.description.toLowerCase().includes(normalized) ||
        template.content.toLowerCase().includes(normalized)
    );
  }, [search, templates]);

  const sampleVariables = useMemo(() => extractVariables(form.content), [form.content]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoading(true);
        const response = await fetch("/api/templates", { cache: "no-store" });
        const data = await parseResponse<Template[]>(response);
        setTemplates(data);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load templates.");
      } finally {
        setLoading(false);
      }
    }

    void loadTemplates();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const created = await parseResponse<Template>(response);
      setTemplates((current) => [created, ...current]);
      setForm(defaultTemplateForm);
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create template.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      await parseResponse<{ deleted: boolean }>(response);
      setTemplates((current) => current.filter((template) => template.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete template.");
    }
  }

  async function handleQuickRename(template: Template) {
    const nextName = window.prompt("Rename template", template.name);
    if (!nextName || nextName.trim().length < 3) {
      return;
    }

    try {
      setEditingId(template.id);
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName.trim() })
      });
      const updated = await parseResponse<Template>(response);
      setTemplates((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update template.");
    } finally {
      setEditingId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
      <section className="panel p-5">
        <h2 className="text-lg font-semibold">Create Template</h2>
        <p className="mt-1 text-sm text-slate-400">
          Use variables in double braces. Example: <code>{"{{customer_name}}"}</code>
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Enterprise Proposal"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              className="input"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Template for pre-sales proposals"
            />
          </div>

          <div>
            <label className="label" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              className="input min-h-52"
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder={"Hello {{customer_name}},\n\nYour proposal value is {{proposal_value}}."}
              required
              minLength={10}
            />
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-300">
            <p className="mb-2 font-medium text-slate-200">Detected Variables</p>
            {sampleVariables.length === 0 ? (
              <p className="text-slate-500">No variables detected yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sampleVariables.map((variable) => (
                  <span key={variable} className="rounded-md bg-slate-800 px-2 py-1 font-mono text-xs text-blue-300">
                    {variable}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? "Saving..." : "Save Template"}
          </button>
        </form>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Template Library</h2>
          <input
            className="input max-w-xs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates"
          />
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-700 bg-rose-950/60 px-3 py-2 text-sm text-rose-300">{error}</div>
        ) : null}

        {loading ? (
          <p className="text-slate-400">Loading templates...</p>
        ) : visibleTemplates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-700 p-5 text-center text-slate-400">No templates found.</p>
        ) : (
          <div className="space-y-3">
            {visibleTemplates.map((template) => {
              const variables = extractVariables(template.content);
              return (
                <article key={template.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{template.description || "No description provided"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary px-3 py-1.5 text-xs"
                        disabled={editingId === template.id}
                        onClick={() => void handleQuickRename(template)}
                        type="button"
                      >
                        Rename
                      </button>
                      <button
                        className="rounded-lg border border-rose-800 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-900/30"
                        onClick={() => void handleDelete(template.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{template.content}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {variables.length === 0 ? (
                      <span className="text-xs text-slate-500">No variables</span>
                    ) : (
                      variables.map((variable) => (
                        <span key={variable} className="rounded-md bg-slate-800 px-2 py-1 font-mono text-xs text-blue-300">
                          {variable}
                        </span>
                      ))
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
