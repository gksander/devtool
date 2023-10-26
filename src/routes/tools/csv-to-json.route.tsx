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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { RunButton } from "@/components/run-button.tsx";
import { create } from "zustand";
import { FileDrop } from "@/components/file-drop.tsx";
import { TooltipButton } from "@/components/ui/tooltip-button.tsx";
import { File, FileUp, XSquare } from "lucide-react";
import { clsx } from "clsx";

/**
 * TODO:
 * - Clipboard for copying JSON output
 * - Selecting fields to show
 * - Restricting to CSV
 */
export function CsvToJsonRoute() {
  const { execute: csvToJson, data: payload } =
    useInvokedQuery<[string[], Record<string, string>]>("csv_as_json");
  const mode = useStore((state) => state.mode);
  const [fields, setFields] = React.useState([] as string[]);
  const jsonContainerRef = React.useRef<HTMLDivElement>(null);
  const jsonEditorRef =
    React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const csvContainerRef = React.useRef<HTMLDivElement>(null);
  const csvEditorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );

  const filepath = useStore((state) => state.localFilePath);
  const setFilePath = useStore((state) => state.setLocalFilePath);
  const clearFilePath = useStore((state) => state.clearLocalFilePath);

  const json = payload?.[1] || [];

  // JSON Editor
  React.useEffect(() => {
    const container = jsonContainerRef.current;
    let editor = jsonEditorRef.current;
    if (!container || editor) return;

    jsonEditorRef.current = monaco.editor.create(container, {
      value: "",
      language: "json",
      automaticLayout: true,
      minimap: { enabled: false },
      readOnly: true,
    });

    editor = jsonEditorRef.current;
    return () => {
      editor?.dispose();
      jsonEditorRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const editor = jsonEditorRef.current;
    if (!editor || !json) return;

    editor.setValue(JSON.stringify(json, null, 2));
  }, [json]);

  // CSV Editor
  React.useEffect(() => {
    let container = csvContainerRef.current;
    let editor = csvEditorRef.current;
    if (!container || editor || mode === "file") return;

    csvEditorRef.current = monaco.editor.create(container, {
      value: "",
      language: "plaintext",
      automaticLayout: true,
      minimap: { enabled: false },
    });
    editor = csvEditorRef.current;

    editor?.onDidChangeModelContent(() => {
      const value = editor?.getValue();
      if (!value) return;

      csvToJson({ data: value, isFilePath: false, fields: [] })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    });
    // TODO: Track changes

    return () => {
      editor?.dispose();
      csvEditorRef.current = null;
    };
  }, [mode]);

  return (
    <React.Fragment>
      <div className="p-3 flex gap-x-3 h-full overflow-hidden">
        <Card className="flex-1 flex flex-col h-full overflow-hidden">
          <CardHeader>
            <CardTitle>CSV Input</CardTitle>
            <CardDescription>
              Enter CSV text or select local file.
            </CardDescription>
          </CardHeader>
          <CardContent
            className={clsx(
              "flex-1 w-full border-b overflow-hidden",
              mode === "text" && "p-0",
            )}
          >
            {mode === "file" ? (
              <div className="flex items-center gap-x-3 w-full">
                <File className="w-6 h-6 text-gray-600" />
                <span className="flex-1 text-sm text-gray-600">{filepath}</span>
                <TooltipButton
                  tooltip="Clear local file"
                  // TODO: Need to actually clear json editor on this.
                  onClick={clearFilePath}
                >
                  <XSquare className="w-4 h-4" />
                </TooltipButton>
              </div>
            ) : (
              <div
                className="h-full w-full overflow-hidden"
                ref={csvContainerRef}
              />
            )}
          </CardContent>
          <CardFooter className="p-3 shrink-0 flex justify-between">
            <TooltipButton
              tooltip="Choose local file"
              // TODO: Enforce CSV
              onClick={async () => {
                let filepath = await open();
                if (!filepath) return;
                filepath = Array.isArray(filepath) ? filepath[0] : filepath;

                setFilePath(filepath);
                csvToJson({
                  data: filepath,
                  isFilePath: true,
                  fields: [],
                }).catch(() => null);
              }}
            >
              <FileUp className="w-4 h-4" />
            </TooltipButton>
            <div>
              <RunButton title="Convert" />
            </div>
          </CardFooter>
        </Card>
        {/* Output */}
        <Card className="flex-1 h-full flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>JSON Output</CardTitle>
            <CardDescription>Result of CSV conversion.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div ref={jsonContainerRef} className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
      {/* TODO: Enforce CSV */}
      <FileDrop
        onFileDrop={(p) => {
          setFilePath(p);
          csvToJson({ data: p, isFilePath: true, fields: [] }).catch(
            () => null,
          );
        }}
      />
    </React.Fragment>
  );

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
        <div className="flex-1" ref={jsonContainerRef}>
          EDITOR
        </div>
      </div>
    </PageContainer>
  );
}

type State = {
  mode: "text" | "file";
  output: string;
  setOutput: (output: string) => void;
  localFilePath: string;
  setLocalFilePath: (path: string) => void;
  clearLocalFilePath: () => void;
};
const useStore = create<State>((set) => ({
  mode: "text",
  output: "",
  setOutput(output) {
    set({ output });
  },
  localFilePath: "",
  setLocalFilePath(path) {
    set({ localFilePath: path, mode: "file" });
  },
  clearLocalFilePath() {
    set({ localFilePath: "", mode: "text", output: "" });
  },
}));
