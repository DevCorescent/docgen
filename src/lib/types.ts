export type Template = {
  id: string;
  name: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type GeneratedDocument = {
  id: string;
  templateId: string;
  title: string;
  payload: Record<string, string>;
  output: string;
  createdAt: string;
};

export type Metrics = {
  templateCount: number;
  documentCount: number;
  generationToday: number;
  successRate: number;
};

export type DataStore = {
  templates: Template[];
  documents: GeneratedDocument[];
};
