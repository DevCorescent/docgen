import { handleApiError, ok } from "@/lib/api-response";
import { createTemplate, listTemplates } from "@/lib/service";

export async function GET() {
  try {
    const templates = await listTemplates();
    return ok(templates);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const template = await createTemplate(body);
    return ok(template, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
