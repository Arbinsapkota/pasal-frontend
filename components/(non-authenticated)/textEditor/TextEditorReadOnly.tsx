"use client";

import { useEffect, useState } from "react";
import he from "he";
import DOMPurify from "dompurify";

interface TextEditorReadOnlyProps {
  value?: string;
}

export default function TextEditorReadOnly({
  value = "",
}: TextEditorReadOnlyProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

  useEffect(() => {
    let html = "";

    try {
      const parsed = JSON.parse(value);
      let deltaOps: any[] | undefined;

      if (Array.isArray(parsed)) {
        deltaOps = parsed;
      } else if (parsed?.ops && Array.isArray(parsed.ops)) {
        deltaOps = parsed.ops;
      }

      if (deltaOps) {
        import("quill-delta-to-html").then(pkg => {
          const { QuillDeltaToHtmlConverter } = pkg as any;
          const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
          html = converter.convert();

          // Step 2: Decode HTML entities
          let decoded = he.decode(html);

          // Step 3: Fix unsafe links
          decoded = decoded.replace(
            /href="unsafe:([^"]+)"/g,
            (_: string, url: string) => {
              const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
              return `href="${cleanUrl}"`;
            }
          );

          // Step 4: Sanitize and allow target attribute
          const sanitized = DOMPurify.sanitize(decoded, {
            ADD_ATTR: ["target"],
          });

          setSanitizedHtml(
            !sanitized.trim() || sanitized.trim() === "<p><br/></p>"
              ? ""
              : sanitized
          );
        });
      } else {
        html = value;
        setSanitizedHtml(
          DOMPurify.sanitize(he.decode(html), { ADD_ATTR: ["target"] })
        );
      }
    } catch {
      html = value;
      setSanitizedHtml(
        DOMPurify.sanitize(he.decode(html), { ADD_ATTR: ["target"] })
      );
    }
  }, [value]);

  if (!sanitizedHtml) return null;

  return (
    <div
      className="prose max-w-full [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-left]:text-left"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

// "use client";

// import he from "he";
// import DOMPurify from "dompurify";
// import pkg from "quill-delta-to-html";
// const { QuillDeltaToHtmlConverter } = pkg as any;

// interface TextEditorReadOnlyProps {
//   value?: string;
// }

// export default function TextEditorReadOnly({
//   value = "",
// }: TextEditorReadOnlyProps) {
//   let html: string = "";

//   // Step 1: Detect and convert Quill Delta JSON if needed
//   try {
//     const parsed = JSON.parse(value);
//     let deltaOps: any[] | undefined;

//     if (Array.isArray(parsed)) {
//       deltaOps = parsed;
//     } else if (parsed?.ops && Array.isArray(parsed.ops)) {
//       deltaOps = parsed.ops;
//     }

//     if (deltaOps) {
//       const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
//       html = converter.convert();
//     } else {
//       html = value; // already HTML or plain text
//     }
//   } catch {
//     html = value; // not JSON → treat as HTML
//   }

//   // Step 2: Decode HTML entities
//   let decoded = he.decode(html);

//   // Step 3: Fix unsafe links
//   decoded = decoded.replace(
//     /href="unsafe:([^"]+)"/g,
//     (_: string, url: string) => {
//       const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
//       return `href="${cleanUrl}"`;
//     }
//   );

//   // Step 4: Sanitize and allow target attribute
//   const sanitized = DOMPurify.sanitize(decoded, { ADD_ATTR: ["target"] });

//   // Step 5: Avoid rendering empty content
//   if (!sanitized.trim() || sanitized.trim() === "<p><br/></p>") {
//     return null;
//   }

//   // Step 6: Render safely
//   return (
//     <div
//       className="prose max-w-full [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-left]:text-left"
//       dangerouslySetInnerHTML={{ __html: sanitized }}
//     />
//   );
// }

// // components/VaadinRichTextEditorReadOnly.tsx
// "use client";

// import { useEffect, useRef } from "react";
// import "@vaadin/vaadin-rich-text-editor";

// export default function TextEditorReadOnly({ value = "" }: { value?: string }) {
//   const editorRef = useRef<any>(null);

//   useEffect(() => {
//     const editor = editorRef.current;
//     if (!editor) return;

//     // Set value
//     editor.value = value;

//     // Disable editing
//     editor.readonly = true;
//     editor.disabled = true;

//     // Inject styles into shadow DOM
//     const injectStyles = () => {
//       const content = editor.shadowRoot?.querySelector('[part="content"]');
//       if (content && !content.querySelector("#readonly-style")) {
//         const style = document.createElement("style");
//         style.id = "readonly-style";
//         style.textContent = `
//           p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote, pre {
//             line-height: 0.5;

//           }

//           li {
//             margin-bottom: 0.9em;
//           }
//         `;
//         content.appendChild(style);
//       }
//     };

//     const timer = setTimeout(injectStyles, 150);

//     return () => clearTimeout(timer);
//   }, [value]);

//   return (
//     <vaadin-rich-text-editor
//       ref={editorRef}
//       style={{
//         width: "100%",
//         minHeight: "10px",
//       }}
//     />
//   );
// }
