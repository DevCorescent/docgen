import { handleApiError, ok } from "@/lib/api-response";
import { deleteTemplate, getTemplateById, updateTemplate } from "@/lib/service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const template = await getTemplateById(id);
    return ok(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const template = await updateTemplate(id, body);
    return ok(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteTemplate(id);
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
