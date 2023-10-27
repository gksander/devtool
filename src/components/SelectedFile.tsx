import { File, XSquare } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

type SelectedFileProps = { path: string; onClear: () => void };

export function SelectedFile({ path, onClear }: SelectedFileProps) {
  const filename = path.split("/").pop();
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-gray-50 w-full max-w-[400px] p-3 rounded-lg flex flex-col items-center">
        <div className="flex items-center justify-center py-3 text-gray-600">
          <File className="w-10 h-10" />
        </div>
        <div className="flex-1 flex items-end font-mono text-sm text-gray-600 max-w-full py-3 overflow-auto whitespace-nowrap text-center">
          {filename}
        </div>
        <Button onClick={onClear} className="w-full">
          Clear
          <XSquare className="w-4 h-4 ml-3" />
        </Button>
      </div>
    </div>
  );
}
