import * as React from "react";
import * as monaco from "monaco-editor";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button.tsx";
import { Clipboard, Play } from "lucide-react";
import { Combobox, ComboBoxOption } from "@/components/ui/combobox.tsx";
import { RichTextInput } from "@/components/rich-text-input.tsx";
import { SimpleTextOutput } from "@/components/simple-text-output.tsx";
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
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const [output, setOutput] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    const container = editorContainerRef.current;
    let editor = editorRef.current;
    console.log("HEY", editor);
    if (!container || editor) return;

    console.log("BOOTING");

    editorRef.current = monaco.editor.create(container, {
      value: "The quick brown fox...",
      language: "plaintext",
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });
    editor = editorRef.current;

    return () => {
      if (editor) editor.dispose();
      editorRef.current = null;
    };
  }, []);

  const copyOutput = async () => {
    await writeText(output);
    toast({ title: "Copied output to clipboard.", duration: 3000 });
  };

  return (
    <div className="h-full overflow-hidden flex gap-3 p-3">
      <Card className="flex-1 flex flex-col h-full overflow-hidden">
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>Input to hash</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 border-b flex flex-col overflow-hidden">
          {/*<div className="bg-red-300 h-[3200px]"></div>*/}
          <div
            className="flex-1 overflow-hidden"
            ref={editorContainerRef}
          ></div>
        </CardContent>
        <CardFooter className="flex gap-x-3 justify-end p-3 shrink-0">
          <Combobox
            options={options}
            value={hashType}
            onValueChange={setHashType}
            placeholder="Algorithm..."
          />
          <Button
            variant="default"
            onClick={async () => {
              setOutput(
                await invoke(hashType, {
                  data: editorRef.current?.getValue() || "",
                }),
              );
            }}
          >
            Run <Play className="w-4 h-4 ml-2" />
          </Button>
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
  );
}
