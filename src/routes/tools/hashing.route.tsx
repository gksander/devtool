import * as React from "react";
import * as monaco from "monaco-editor";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button.tsx";
import { Clipboard, File, FileUp, Play, XSquare } from "lucide-react";
import { Combobox, ComboBoxOption } from "@/components/ui/combobox.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { TooltipButton } from "@/components/ui/tooltip-button.tsx";
import { writeText } from "@tauri-apps/api/clipboard";
import { useToast } from "@/components/ui/use-toast.ts";
import { create } from "zustand";
import { open } from "@tauri-apps/api/dialog";
import { clsx } from "clsx";
import { FileDrop } from "@/components/file-drop.tsx";

const options = [
  {
    value: "hash_sha256",
    label: "SHA-256",
  },
  {
    value: "hash_sha384",
    label: "SHA-384",
  },
  {
    value: "hash_sha512",
    label: "SHA-512",
  },
] satisfies ComboBoxOption[];

/**
 * TODO:
 * - Empty state for output
 * - cmd + enter to run
 * - cmd + k should propagate to search.
 */
export function HashingRoute() {
  const [hashType, setHashType] = React.useState(options[0].value);
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef("");
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const mode = useHashStore((state) => state.mode);
  const output = useHashStore((state) => state.output);
  const setOutput = useHashStore((state) => state.setOutput);
  const filepath = useHashStore((state) => state.localFilePath);
  const setFilePath = useHashStore((state) => state.setLocalFilePath);
  const clearFilePath = useHashStore((state) => state.clearLocalFilePath);
  const { toast } = useToast();

  React.useEffect(() => {
    const container = editorContainerRef.current;
    let editor = editorRef.current;
    if (!container || editor || mode === "file") return;

    editorRef.current = monaco.editor.create(container, {
      value: contentRef.current,
      language: "plaintext",
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });
    editor = editorRef.current;
    editor?.onDidChangeModelContent(() => {
      contentRef.current = editor?.getValue() || "";
    });

    return () => {
      if (editor) editor.dispose();
      editorRef.current = null;
    };
  }, [mode]);

  const run = async () => {
    setOutput(
      await invoke(hashType, {
        data: mode === "file" ? filepath : editorRef.current?.getValue() || "",
        isFilePath: mode === "file",
      }),
    );
  };

  const copyOutput = async () => {
    await writeText(output);
    toast({ title: "Copied output to clipboard.", duration: 3000 });
  };

  const chooseLocalFile = async () => {
    let filepath = await open({});
    if (!filepath) return;
    filepath = Array.isArray(filepath) ? filepath[0] : filepath;

    setFilePath(filepath);
  };

  return (
    <React.Fragment>
      <div className="h-full overflow-hidden flex gap-3 p-3">
        <Card className="flex-1 flex flex-col h-full overflow-hidden">
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Input to hash</CardDescription>
          </CardHeader>
          <CardContent
            className={clsx(
              "flex-1 border-b flex flex-col overflow-hidden",
              mode === "text" && "p-0",
            )}
          >
            {mode === "file" ? (
              <div className="flex items-center gap-x-3 w-full">
                <File className="w-6 h-6 text-gray-600" />
                <span className="flex-1 text-sm text-gray-600">{filepath}</span>
                <TooltipButton
                  tooltip="Clear local file"
                  onClick={clearFilePath}
                >
                  <XSquare className="w-4 h-4" />
                </TooltipButton>
              </div>
            ) : (
              <div
                className="flex-1 overflow-hidden"
                ref={editorContainerRef}
              ></div>
            )}
          </CardContent>
          <CardFooter className="flex gap-x-3 justify-between items-center p-3 shrink-0">
            <TooltipButton
              tooltip="Choose local file"
              onClick={chooseLocalFile}
            >
              {mode === "text" ? (
                <FileUp className="w-4 h-4" />
              ) : (
                <XSquare className="w-4 h-4" />
              )}
            </TooltipButton>
            <div className="flex gap-x-3">
              <Combobox
                options={options}
                value={hashType}
                onValueChange={setHashType}
                placeholder="Algorithm..."
              />
              <Button variant="default" onClick={run}>
                Run <Play className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardFooter>
        </Card>
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Hashed output</CardDescription>
          </CardHeader>
          <CardContent className="bg-gray-50 flex-1 relative">
            <p className="break-all font-mono">{output}</p>
            <div className="absolute bottom-3 right-3">
              {output && (
                <TooltipButton tooltip="Copy output" onClick={copyOutput}>
                  <Clipboard className="w-5 h-5" />
                </TooltipButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <FileDrop onFileDrop={setFilePath} />
    </React.Fragment>
  );
}

type State = {
  mode: "text" | "file";
  output: string;
  setOutput: (val: string) => void;
  localFilePath: string;
  setLocalFilePath: (val: string) => void;
  clearLocalFilePath: () => void;
};
const useHashStore = create<State>((set) => ({
  mode: "text",
  output: "",
  setOutput(val) {
    set({ output: val });
  },

  localFilePath: "",
  setLocalFilePath(val) {
    set({ localFilePath: val, mode: "file" });
  },
  clearLocalFilePath() {
    set({ localFilePath: "", mode: "text" });
  },
}));
