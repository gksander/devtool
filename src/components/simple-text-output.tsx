import * as React from "react";
import { clsx } from "clsx";
import { SectionTitle } from "@/components/ui/section-title.tsx";
import { TooltipButton } from "@/components/ui/tooltip-button.tsx";
import { Clipboard } from "lucide-react";
import { writeText } from "@tauri-apps/api/clipboard";
import { useToast } from "@/components/ui/use-toast.ts";

type SimpleTextOutputProps = {
  value: string;
  className?: string;
  title: string;
};

export function SimpleTextOutput({
  value,
  className,
  title,
}: React.PropsWithChildren<SimpleTextOutputProps>) {
  const { toast } = useToast();

  const copyOutput = async () => {
    await writeText(value);
    toast({ title: "Copied output to clipboard.", duration: 3000 });
  };

  return (
    <div
      className={clsx("w-full overflow-hidden flex flex-col p-2", className)}
    >
      <div className="pb-2 flex items-center justify-between">
        <SectionTitle>{title}</SectionTitle>
        <TooltipButton tooltip="Copy output" onClick={copyOutput} size="sm">
          <Clipboard className="w-4 h-4" />
        </TooltipButton>
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 p-3 rounded break-all block h-full">
          <p className="break-all">{value}</p>
        </div>
      </div>
    </div>
  );
}
