import * as React from "react";
import * as monaco from "monaco-editor";
import { clsx } from "clsx";
import { SectionTitle } from "@/components/ui/section-title.tsx";
import { Combobox, ComboBoxOption } from "@/components/ui/combobox.tsx";

type RichTextInputProps = {
  title: string;
  className?: string;
  contentRef?: React.MutableRefObject<string>;
};

export function RichTextInput({
  title,
  className,
  contentRef,
}: RichTextInputProps) {
  const [language, setLanguage] = React.useState(LANG_OPTIONS[0].value);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const modelRef = React.useRef<monaco.editor.ITextModel>();
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>();

  React.useEffect(() => {
    const container = containerRef.current;
    const editor = editorRef.current;
    if (!container || editor) return;

    modelRef.current = monaco.editor.createModel(
      "The quick brown fox...",
      "plaintext",
    );

    editorRef.current = monaco.editor.create(container, {
      model: modelRef.current,
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
    });
    editorRef.current?.onDidChangeModelContent(() => {
      const v = editorRef.current?.getValue();
      if (contentRef && v) {
        contentRef.current = v;
      }
    });
  }, []);

  return (
    <div className={clsx("w-full overflow-hidden flex flex-col", className)}>
      <div className="p-2 flex justify-between items-center">
        <SectionTitle>{title}</SectionTitle>
        <Combobox
          options={LANG_OPTIONS}
          value={language}
          onValueChange={(val) => {
            setLanguage(val);
            const model = modelRef.current;
            if (model) monaco.editor.setModelLanguage(model, val);
          }}
        />
      </div>
      <div className="p-3 flex-1">
        <div
          className="h-full rounded overflow-hidden border-2"
          ref={containerRef}
        ></div>
      </div>
    </div>
  );
}

const LANG_OPTIONS = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
] satisfies ComboBoxOption[];
