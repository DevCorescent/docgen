import fs from "node:fs/promises";
import path from "node:path";
import type { DataStore } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "data", "store.json");

const DEFAULT_STORE: DataStore = {
  templates: [],
  documents: []
};

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf-8");
  }
}

export async function readStore(): Promise<DataStore> {
  await ensureStoreFile();
  const raw = await fs.readFile(DB_PATH, "utf-8");

  try {
    const parsed = JSON.parse(raw) as Partial<DataStore>;
    return {
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      documents: Array.isArray(parsed.documents) ? parsed.documents : []
    };
  } catch {
    return structuredClone(DEFAULT_STORE);
  }
}

export async function writeStore(data: DataStore) {
  await ensureStoreFile();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}
