import { describe, expect, it } from "vitest";
import { extractVariables, renderTemplate } from "@/lib/template";

describe("template utilities", () => {
  it("extracts unique variables from a template", () => {
    const content = "Hello {{name}}, project {{project_name}} for {{name}}.";
    const variables = extractVariables(content);

    expect(variables).toEqual(["name", "project_name"]);
  });

  it("renders template content and reports missing variables", () => {
    const content = "Dear {{name}}, your role is {{role}}.";
    const rendered = renderTemplate(content, { name: "Alicia", role: "Director" });

    expect(rendered.output).toBe("Dear Alicia, your role is Director.");
    expect(rendered.missing).toEqual([]);
  });

  it("keeps unresolved placeholders and marks them missing", () => {
    const content = "Hello {{name}} from {{team}}.";
    const rendered = renderTemplate(content, { name: "Jordan", team: "" });

    expect(rendered.output).toBe("Hello Jordan from {{team}}.");
    expect(rendered.missing).toEqual(["team"]);
  });
});
