import { Link } from "react-router-dom";
import { TOOLS } from "@/tools.ts";

export function HomeRoute() {
  return (
    <div>
      <h1>Home route</h1>
      <ul>
        {Object.values(TOOLS).map((tool) => (
          <Link to={`/tools/${tool.path}`}>{tool.name}</Link>
        ))}
      </ul>
    </div>
  );
}
