import { FileDrop } from "@/components/file-drop.tsx";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { writeText } from "@tauri-apps/api/clipboard";
import { open, save } from "@tauri-apps/api/dialog";
import { clsx } from "clsx";
import { CheckSquare, Clipboard, Download, FileUp, Square } from "lucide-react";
import * as monaco from "monaco-editor";
import * as React from "react";
import { create } from "zustand";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SelectedFile } from "@/components/SelectedFile.tsx";
import { enableSearchFromEditor } from "@/lib/editor-utils.ts";

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
  const selectedFields = useStore((state) => state.selectedFields);
  const toggleSelectedField = useStore((state) => state.toggleSelectedField);

  const json = payload?.[1] || "";
  const fields = payload?.[0];

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
    enableSearchFromEditor(editor);

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
    enableSearchFromEditor(editor);

    // TODO: Change selectedFields here? Enter a,b\n1,2 and select b, then change the b field to c. Things get weird.
    editor?.onDidChangeModelContent(() => {
      const value = editor?.getValue() || "";

      previewCsvToJson({ data: value, isFilePath: false, fields: [] }).catch(
        () => null,
      );
    });

    return () => {
      editor?.dispose();
      csvEditorRef.current = null;
    };
  }, [mode]);

  React.useEffect(() => {
    const data =
      mode === "text" ? csvEditorRef.current?.getValue() || "" : localFilePath;
    previewCsvToJson({
      data,
      isFilePath: mode === "file",
      fields: selectedFields,
    }).catch(() => null);
  }, [selectedFields, mode, localFilePath]);

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
      fields: selectedFields,
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
      fields: selectedFields,
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
              <SelectedFile path={localFilePath} onClear={clearFilePath} />
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
              <Popover>
                <PopoverTrigger asChild disabled={!fields?.length}>
                  <Button>
                    <CheckSquare className="w-4 h-4 mr-3" />
                    Fields
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[200px] p-0"
                  align="end"
                  side="top"
                >
                  <Command>
                    <CommandInput placeholder="Search fields..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {fields?.map((field) => {
                          const isSelected = selectedFields.includes(field);

                          return (
                            <CommandItem
                              key={field}
                              onSelect={() => toggleSelectedField(field)}
                              className="flex items-center"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                              <span className="ml-1">{field}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
  selectedFields: string[];
  toggleSelectedField: (field: string) => void;
};
const useStore = create<State>((set) => ({
  mode: "text",
  output: "",
  setOutput(output) {
    set({ output });
  },
  localFilePath: "",
  setLocalFilePath(path) {
    set({ localFilePath: path, mode: "file", selectedFields: [] });
  },
  clearLocalFilePath() {
    set({ localFilePath: "", mode: "text", output: "", selectedFields: [] });
  },
  selectedFields: [],
  toggleSelectedField(field) {
    set((state) => ({
      selectedFields: state.selectedFields.includes(field)
        ? state.selectedFields.filter((f) => f !== field)
        : state.selectedFields.concat(field),
    }));
  },
}));
