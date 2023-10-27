import { HashingRoute } from "@/routes/tools/hashing.route.tsx";
import { DiffRoute } from "@/routes/tools/diff.route.tsx";
import { CsvToJsonRoute } from "@/routes/tools/csv-to-json.route.tsx";
import { Hash, Sheet } from "lucide-react";

type Tag = {
  name: string;
};
const TAGS = {
  HASHING: { name: "Hashing" },
  CSV: { name: "CSV" },
} satisfies Record<string, Tag>;

type Tool = {
  name: string;
  description: string;
  tag: Tag[];
  path: string;
  component: typeof HashingRoute;
  icon: typeof Hash;
};

export const TOOLS = {
  sha2: {
    name: "Hash Content",
    description: "SHA Hashing of content.",
    tag: [TAGS.HASHING],
    path: "sha2",
    component: HashingRoute,
    icon: Hash,
  },
  // diff: {
  //   name: "Diff",
  //   description: "Diff two files",
  //   tag: [],
  //   path: "diff",
  //   component: DiffRoute,
  // },
  csv2json: {
    name: "CSV to JSON",
    description: "Convert CSV to JSON.",
    tag: [TAGS.CSV],
    path: "csv2json",
    component: CsvToJsonRoute,
    icon: Sheet,
  },
} satisfies Record<string, Tool>;
