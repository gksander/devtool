import { FileDrop } from "@/components/file-drop.tsx";
import { RunButton } from "@/components/run-button.tsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { TooltipButton } from "@/components/ui/tooltip-button.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { useInvokedQuery } from "@/util/useInvokedQuery.ts";
import { writeText } from "@tauri-apps/api/clipboard";
import { open, save } from "@tauri-apps/api/dialog";
import { clsx } from "clsx";
import { Clipboard, Download, File, FileUp, XSquare } from "lucide-react";
import * as monaco from "monaco-editor";
import * as React from "react";
import { create } from "zustand";

/**
 * TODO:
 * - Selecting fields to show
 */
export function CsvToJsonRoute() {
  const { toast } = useToast();
  const { execute: previewCsvToJson, data: payload } = useInvokedQuery<
    [string[], string]
  >("preview_csv_to_json");
  const { execute: exportCsvToJson } =
    useInvokedQuery<string>("export_csv_to_json");
  const mode = useStore((state) => state.mode);
  const jsonContainerRef = React.useRef<HTMLDivElement>(null);
  const jsonEditorRef =
    React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const csvContainerRef = React.useRef<HTMLDivElement>(null);
  const csvEditorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );

  const localFilePath = useStore((state) => state.localFilePath);
  const setFilePath = useStore((state) => state.setLocalFilePath);
  const clearFilePath = useStore((state) => state.clearLocalFilePath);

  const json = payload?.[1] || "";

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

    editor.setValue(json);
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

      previewCsvToJson({ data: value, isFilePath: false, fields: [] })
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

  const handleSaveFile = async () => {
    const filepath = await save({
      title: "Save JSON Output",
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });
    if (!filepath) return;

    exportCsvToJson({
      data:
        mode === "text"
          ? csvEditorRef.current?.getValue() || ""
          : localFilePath,
      isFilePath: mode === "file",
      fields: [], // TODO: Fields
      outputPath: filepath,
      toClipboard: false,
    }).then(() => {
      toast({
        title: "Saved JSON",
        description: `Saved to ${filepath}`,
        duration: 2000,
      });
    });
  };

  const handleCopyToClipboard = async () => {
    const dat = await exportCsvToJson({
      data:
        mode === "text"
          ? csvEditorRef.current?.getValue() || ""
          : localFilePath,
      isFilePath: mode === "file",
      fields: [], // TODO: Fields
      outputPath: "",
      toClipboard: true,
    });

    await writeText(dat);

    toast({
      title: "Copied JSON",
      description: `Copied to clipboard.`,
      duration: 2000,
    });
  };

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
                <span className="flex-1 text-sm text-gray-600">
                  {localFilePath}
                </span>
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
                previewCsvToJson({
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
            <CardDescription>
              Result of CSV conversion. Preview shown below, use copy/save
              buttons for full output.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 border-b">
            <div ref={jsonContainerRef} className="h-full w-full" />
          </CardContent>
          <CardFooter className="shrink-0 p-3 flex justify-end items-center gap-x-3">
            <Button onClick={handleSaveFile}>
              <Download className="w-4 h-4 mr-3" />
              Save
            </Button>
            <Button onClick={handleCopyToClipboard}>
              Copy <Clipboard className="w-4 h-4 ml-3" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      <FileDrop
        onFileDrop={(p) => {
          setFilePath(p);
          previewCsvToJson({ data: p, isFilePath: true, fields: [] }).catch(
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
