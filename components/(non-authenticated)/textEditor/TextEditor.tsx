"use client";

import { useEffect, useRef } from "react";
import "@vaadin/vaadin-rich-text-editor";
export default function TextEditor({
  value = "",
  onChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
}) {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Set the value on load
    editor.value = value;

    // Update parent state on change
    const handleChange = () => {
      onChange?.(editor.value);
    };
    editor.addEventListener("value-changed", handleChange);

    // Inject styles into shadow DOM after it loads
    const injectStyles = () => {
      const content = editor.shadowRoot?.querySelector('[part="content"]');
      if (content && !content.querySelector("#custom-line-style")) {
        const style = document.createElement("style");
        style.id = "custom-line-style";
        style.textContent = `
          
        `;
        content.appendChild(style);
      }
    };

    // Use a timeout to ensure shadow DOM is available
    const timer = setTimeout(injectStyles, 150);

    return () => {
      editor.removeEventListener("value-changed", handleChange);
      clearTimeout(timer);
    };
  }, [onChange, value]);

  return (
    <vaadin-rich-text-editor
      ref={editorRef}
      style={{
        width: "100%",
        height: "300px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "0px",
      }}
    />
  );
}
