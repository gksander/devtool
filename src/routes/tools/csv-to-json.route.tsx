import * as React from "react";
import * as monaco from "monaco-editor";
import { open } from "@tauri-apps/api/dialog";
import { useInvokedQuery } from "@/util/useInvokedQuery.ts";
import { Button } from "@/components/ui/button";
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
import { Clipboard, File, FileUp, XSquare } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { writeText } from "@tauri-apps/api/clipboard";

/**
 * TODO:
 * - Selecting fields to show
 */
export function CsvToJsonRoute() {
  const { toast } = useToast();
  const { execute: csvToJson, data: payload } =
    useInvokedQuery<[string[], Record<string, string>]>("csv_as_json");
  const mode = useStore((state) => state.mode);
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
              onClick={async () => {
                let filepath = await open({
                  multiple: false,
                  filters: [{ name: "CSV", extensions: ["csv"] }],
                });
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
          <CardContent className="flex-1 overflow-hidden p-0 border-b">
            <div ref={jsonContainerRef} className="h-full w-full" />
          </CardContent>
          <CardFooter className="shrink-0 p-3 flex justify-end">
            <Button
              onClick={async () => {
                const val = jsonEditorRef.current?.getValue();
                if (!val) return;

                await writeText(val);
                toast({ title: "Copied output to clipboard.", duration: 2000 });
              }}
            >
              Copy <Clipboard className="w-4 h-4 ml-3" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      <FileDrop
        onFileDrop={(p) => {
          setFilePath(p);
          csvToJson({ data: p, isFilePath: true, fields: [] }).catch(
            () => null,
          );
        }}
        fileExtensions={["csv"]}
      />
    </React.Fragment>
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
