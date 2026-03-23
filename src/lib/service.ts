import { randomUUID } from "node:crypto";
import { z } from "zod";
import { readStore, writeStore } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { renderTemplate } from "@/lib/template";
import type { GeneratedDocument, Metrics, Template } from "@/lib/types";

const templateSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(200).default(""),
  content: z.string().trim().min(10).max(20000)
});

const updateTemplateSchema = templateSchema.partial().refine((payload) => Object.keys(payload).length > 0, {
  message: "At least one field is required for update."
});

const generateSchema = z.object({
  templateId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  payload: z.record(z.string(), z.string())
});

export async function listTemplates(): Promise<Template[]> {
  const store = await readStore();
  return store.templates.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createTemplate(input: unknown): Promise<Template> {
  const payload = templateSchema.parse(input);
  const store = await readStore();

  const now = new Date().toISOString();
  const template: Template = {
    id: randomUUID(),
    name: payload.name,
    description: payload.description,
    content: payload.content,
    createdAt: now,
    updatedAt: now
  };

  store.templates.push(template);
  await writeStore(store);
  return template;
}

export async function getTemplateById(id: string): Promise<Template> {
  const store = await readStore();
  const template = store.templates.find((item) => item.id === id);
  if (!template) {
    throw new AppError("Template not found.", 404);
  }
  return template;
}

export async function updateTemplate(id: string, input: unknown): Promise<Template> {
  const payload = updateTemplateSchema.parse(input);
  const store = await readStore();
  const template = store.templates.find((item) => item.id === id);

  if (!template) {
    throw new AppError("Template not found.", 404);
  }

  Object.assign(template, payload, {
    updatedAt: new Date().toISOString()
  });

  await writeStore(store);
  return template;
}

export async function deleteTemplate(id: string) {
  const store = await readStore();
  const initialCount = store.templates.length;
  store.templates = store.templates.filter((item) => item.id !== id);

  if (store.templates.length === initialCount) {
    throw new AppError("Template not found.", 404);
  }

  await writeStore(store);
}

export async function listDocuments(limit = 12): Promise<GeneratedDocument[]> {
  const store = await readStore();
  return store.documents
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.max(1, Math.min(limit, 100)));
}

export async function generateDocument(input: unknown): Promise<GeneratedDocument> {
  const payload = generateSchema.parse(input);
  const store = await readStore();
  const template = store.templates.find((item) => item.id === payload.templateId);

  if (!template) {
    throw new AppError("Template not found.", 404);
  }

  const rendering = renderTemplate(template.content, payload.payload);
  if (rendering.missing.length > 0) {
    throw new AppError(`Missing required variables: ${rendering.missing.join(", ")}.`, 422);
  }

  const document: GeneratedDocument = {
    id: randomUUID(),
    templateId: template.id,
    title: payload.title,
    payload: payload.payload,
    output: rendering.output,
    createdAt: new Date().toISOString()
  };

  store.documents.push(document);
  await writeStore(store);
  return document;
}

export async function getMetrics(): Promise<Metrics> {
  const store = await readStore();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const generationToday = store.documents.filter((doc) => doc.createdAt.startsWith(today)).length;
  const successRate = 100;

  return {
    templateCount: store.templates.length,
    documentCount: store.documents.length,
    generationToday,
    successRate
  };
}
