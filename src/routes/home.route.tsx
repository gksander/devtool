import { Title } from "@/components/ui/title.tsx";
import { TOOLS } from "@/tools.ts";
import { ValueOf } from "@/types.ts";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Link } from "react-router-dom";

export function HomeRoute() {
  return (
    <div className="p-3">
      <Title>DevTool</Title>

      <div className="mb-3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Object.values(TOOLS).map((tool) => (
          <ToolCard tool={tool} key={tool.path} />
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: ValueOf<typeof TOOLS> }) {
  return (
    <Link to={`/tools/${tool.path}`}>
      <Card className="flex gap-x-3 hover:shadow-md transition-shadow duration-150 h-full">
        <div className="p-6 pr-0">
          <tool.icon className="w-6 h-6" />
        </div>
        <div>
          <CardHeader>
            <CardTitle>{tool.name}</CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </CardHeader>
        </div>
      </Card>
    </Link>
  );
}
