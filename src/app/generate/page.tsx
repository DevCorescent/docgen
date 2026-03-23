"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { extractVariables } from "@/lib/template";
import type { GeneratedDocument, Template } from "@/lib/types";

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.data) {
    throw new Error(json.error ?? "Request failed.");
  }
  return json.data;
}

export default function GeneratePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [payload, setPayload] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const requiredVariables = useMemo(
    () => extractVariables(selectedTemplate?.content ?? ""),
    [selectedTemplate?.content]
  );

  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoading(true);
        const response = await fetch("/api/templates", { cache: "no-store" });
        const data = await parseResponse<Template[]>(response);
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load templates.");
      } finally {
        setLoading(false);
      }
    }

    void loadTemplates();
  }, []);

  useEffect(() => {
    setPayload((current) => {
      const next: Record<string, string> = {};
      for (const key of requiredVariables) {
        next[key] = current[key] ?? "";
      }
      return next;
    });
  }, [requiredVariables]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTemplateId) {
      setError("Select a template before generating.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          title,
          payload
        })
      });
      const generated = await parseResponse<GeneratedDocument>(response);
      setResult(generated);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Could not generate document.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!result) {
      return;
    }
    await navigator.clipboard.writeText(result.output);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="panel p-5">
        <h2 className="text-lg font-semibold">Generate Document</h2>
        <p className="mt-1 text-sm text-slate-400">Choose a template, fill values, and generate final output.</p>

        {loading ? (
          <p className="mt-4 text-slate-400">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-700 p-6 text-slate-400">
            No templates available. Create one in the Templates section.
          </p>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleGenerate}>
            <div>
              <label className="label" htmlFor="templateSelect">
                Template
              </label>
              <select
                id="templateSelect"
                className="input"
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="documentTitle">
                Document title
              </label>
              <input
                id="documentTitle"
                className="input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Q2 Strategic Proposal"
                required
                minLength={3}
              />
            </div>

            <fieldset className="space-y-3 rounded-xl border border-slate-800 p-4">
              <legend className="px-2 text-sm text-slate-300">Payload Variables</legend>
              {requiredVariables.length === 0 ? (
                <p className="text-sm text-slate-500">Template does not have variables.</p>
              ) : (
                requiredVariables.map((variable) => (
                  <div key={variable}>
                    <label className="label" htmlFor={`var-${variable}`}>
                      {variable}
                    </label>
                    <input
                      id={`var-${variable}`}
                      className="input"
                      value={payload[variable] ?? ""}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          [variable]: event.target.value
                        }))
                      }
                      required
                    />
                  </div>
                ))
              )}
            </fieldset>

            {error ? (
              <div className="rounded-lg border border-rose-700 bg-rose-950/60 px-3 py-2 text-sm text-rose-300">{error}</div>
            ) : null}

            <button className="btn-primary w-full" disabled={submitting} type="submit">
              {submitting ? "Generating..." : "Generate Document"}
            </button>
          </form>
        )}
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Output Preview</h2>
          <button className="btn-secondary" onClick={() => void handleCopy()} type="button" disabled={!result}>
            Copy Output
          </button>
        </div>

        {!result ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
            Generated output will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Document Title</p>
              <p className="mt-1 text-slate-200">{result.title}</p>
            </div>
            <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
              {result.output}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
