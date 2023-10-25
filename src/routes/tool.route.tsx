import { useParams } from "react-router-dom";
import { TOOLS } from "@/tools.ts";

export function ToolRoute() {
  const toolId = useParams()?.toolId || "";

  const tool = TOOLS[toolId as keyof typeof TOOLS];
  if (!tool) return null;

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden">
        <tool.component />
      </div>
      <div className="bg-gray-100 text">
        <div className="py-2 px-3 text-sm">{tool.name}</div>
      </div>
    </div>
  );
}
