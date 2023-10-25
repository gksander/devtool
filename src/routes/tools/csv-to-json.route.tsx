import * as React from "react";
import * as monaco from "monaco-editor";
import { PageContainer } from "@/components/ui/page-container.tsx";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { useInvokedQuery } from "@/util/useInvokedQuery.ts";
import { Title } from "@/components/ui/title.tsx";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";

export function CsvToJsonRoute() {
  const { execute, data } = useInvokedQuery<string[]>("extract_csv_headers");
  const { execute: csvToJson, data: json } =
    useInvokedQuery<Record<string, string>>("csv_as_json");
  const [filepath, setFilepath] = React.useState("");
  const [fields, setFields] = React.useState([] as string[]);
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>();

  React.useEffect(() => {
    const container = editorContainerRef.current;
    const editor = editorRef.current;
    if (!container || editor) return;

    editorRef.current = monaco.editor.create(container, {
      value: "",
      language: "json",
      // automaticLayout: true,
    });
  }, []);

  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !json) return;

    editor.setValue(JSON.stringify(json, null, 2));
  }, [json]);

  return (
    <PageContainer>
      <div className="flex gap-x-3 h-full">
        <div className="flex-1 grid grid-rows-[min-content_min-content_1fr] gap-y-2">
          <Title>CSV to JSON</Title>
          <div className="flex w-full gap-x-2">
            <Button
              onClick={async () => {
                let filepath = await open();
                if (!filepath) return;
                filepath = Array.isArray(filepath) ? filepath[0] : filepath;

                setFilepath(filepath);
                await execute({ dataPath: filepath });
              }}
              className="flex-1"
            >
              Select CSV file
            </Button>
            {data && (
              <Button
                onClick={async () => {
                  if (!filepath) return;

                  await csvToJson({ dataPath: filepath, fields });
                }}
                className="flex-1"
              >
                to JSON
              </Button>
            )}
          </div>
          <ScrollArea className="h-full max-h-full">
            {data?.slice(0).map((header) => (
              <span key={header} className="flex items-center gap-x-1">
                <Checkbox
                  checked={fields.includes(header)}
                  id={`field-${header}`}
                  onCheckedChange={() => {
                    setFields((oldFields) => {
                      if (oldFields.includes(header)) {
                        return oldFields.filter((f) => f !== header);
                      }

                      return [...oldFields, header];
                    });
                  }}
                />
                <label
                  htmlFor={`field-${header}`}
                  className="text-sm font-medium"
                >
                  {header}
                </label>
              </span>
            ))}
          </ScrollArea>
        </div>
        <div className="flex-1" ref={editorContainerRef}>
          EDITOR
        </div>
      </div>
    </PageContainer>
  );
}
