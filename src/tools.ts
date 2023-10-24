import { Sha2Route } from "@/routes/tools/sha2.route.tsx";
import { DiffRoute } from "@/routes/tools/diff.route.tsx";

type Tag = {
  name: string;
};
const TAGS = {
  HASHING: { name: "Hashing" },
} satisfies Record<string, Tag>;

type Tool = {
  name: string;
  description: string;
  tag: Tag[];
  path: string;
  component: typeof Sha2Route;
};

export const TOOLS = {
  sha2: {
    name: "SHA2 Hashing",
    description: "SHA256 and SHA512 hashing",
    tag: [TAGS.HASHING],
    path: "sha2",
    component: Sha2Route,
  },
  diff: {
    name: "Diff",
    description: "Diff two files",
    tag: [],
    path: "diff",
    component: DiffRoute,
  },
} satisfies Record<string, Tool>;
