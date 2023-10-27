import * as React from "react";
import * as monaco from "monaco-editor";
import { Clipboard, FileUp } from "lucide-react";
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
import { useInvokedQuery } from "@/util/useInvokedQuery.ts";
import { SelectedFile } from "@/components/SelectedFile.tsx";
import { enableSearchFromEditor } from "@/lib/editor-utils.ts";

const options = [
  {
    value: "sha256",
    label: "SHA-256",
  },
  {
    value: "sha384",
    label: "SHA-384",
  },
  {
    value: "sha512",
    label: "SHA-512",
  },
] satisfies ComboBoxOption[];

/**
 * TODO:
 * - Empty state for output
 */
export function HashingRoute() {
  const { data: hashedOutput, execute } = useInvokedQuery<string>("hash");
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef("");
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const mode = useHashStore((state) => state.mode);
  const filepath = useHashStore((state) => state.localFilePath);
  const setFilePath = useHashStore((state) => state.setLocalFilePath);
  const clearFilePath = useHashStore((state) => state.clearLocalFilePath);
  const hashType = useHashStore((state) => state.hashType);
  const setHashType = useHashStore((state) => state.setHashType);
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
    enableSearchFromEditor(editor);

    // TODO: Throttle this?
    editor?.onDidChangeModelContent(() => {
      const value = editor?.getValue() || "";
      contentRef.current = value;

      execute({
        data: value,
        isFilePath: false,
        hashType: useHashStore.getState().hashType,
      }).catch(() => null);
    });

    return () => {
      if (editor) editor.dispose();
      editorRef.current = null;
    };
  }, [mode]);

  React.useEffect(() => {
    execute({
      data: mode === "file" ? filepath : contentRef.current,
      isFilePath: mode === "file",
      hashType,
    }).catch(() => null);
  }, [mode, filepath, hashType]);

  const copyOutput = async () => {
    if (hashedOutput) await writeText(hashedOutput);
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
            {/* TODO: dedup the file display between CSV */}
            {mode === "file" ? (
              <SelectedFile path={filepath} onClear={clearFilePath} />
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
              <FileUp className="w-4 h-4" />
            </TooltipButton>
            <div className="flex gap-x-3">
              <Combobox
                options={options}
                value={hashType}
                onValueChange={setHashType}
                placeholder="Algorithm..."
              />
            </div>
          </CardFooter>
        </Card>
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Hashed output</CardDescription>
          </CardHeader>
          <CardContent className="bg-gray-50 flex-1 relative">
            <p className="break-all font-mono">{hashedOutput}</p>
            <div className="absolute bottom-3 right-3">
              {hashedOutput && (
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
  hashType: string;
  setHashType: (hashType: string) => void;
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

  hashType: options[0].value,
  setHashType(hashType) {
    set({ hashType });
  },
}));
