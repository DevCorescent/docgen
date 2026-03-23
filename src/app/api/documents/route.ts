import { handleApiError, ok } from "@/lib/api-response";
import { generateDocument, listDocuments } from "@/lib/service";

export async function GET() {
  try {
    const documents = await listDocuments();
    return ok(documents);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const generated = await generateDocument(body);
    return ok(generated, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
