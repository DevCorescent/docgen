import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        details: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
}
