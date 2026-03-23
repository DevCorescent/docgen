import { handleApiError, ok } from "@/lib/api-response";
import { getMetrics, listDocuments } from "@/lib/service";

export async function GET() {
  try {
    const [metrics, recentDocuments] = await Promise.all([getMetrics(), listDocuments(5)]);
    return ok({ metrics, recentDocuments });
  } catch (error) {
    return handleApiError(error);
  }
}
