import * as React from "react";
import * as monaco from "monaco-editor";

export function DiffRoute() {
  const elRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>();

  React.useEffect(() => {
    const el = elRef.current;
    const editor = editorRef.current;
    if (!el || editor) return;

    editorRef.current = monaco.editor.create(el, {
      value: "const x = 13;",
      language: "typescript",
    });
  }, []);

  return <div ref={elRef} className="w-full h-[300px]"></div>;
}
