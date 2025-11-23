// If you're in Next.js/TypeScript with ESM, do this import:
import pkg from "quill-delta-to-html";
const { QuillDeltaToHtmlConverter } = pkg as any;

export function deltaToHtml(deltaValue: string | object) {
  let deltaOps;

  // Parse JSON string if needed
  if (typeof deltaValue === "string") {
    try {
      const parsed = JSON.parse(deltaValue);
      if (Array.isArray(parsed)) {
        deltaOps = parsed;
      } else if (parsed?.ops && Array.isArray(parsed.ops)) {
        deltaOps = parsed.ops;
      } else {
        return deltaValue; // already HTML or plain text
      }
    } catch {
      return deltaValue; // already HTML or plain text
    }
  } else if (Array.isArray(deltaValue)) {
    deltaOps = deltaValue;
  } else if (deltaValue && (deltaValue as any).ops) {
    deltaOps = (deltaValue as any).ops;
  } else {
    return "";
  }

  // Convert Delta ops to HTML
  const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
  return converter.convert();
}
