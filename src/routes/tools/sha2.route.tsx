import * as React from "react";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button.tsx";

export function Sha2Route() {
  const [data, setData] = React.useState("");
  const [output, setOutput] = React.useState("");

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setOutput(await invoke("hash_sha256", { data }));
        }}
      >
        <Label>Input</Label>
        <Input type="text" onChange={(e) => setData(e.currentTarget.value)} />
        <Button type="submit">Hash</Button>
      </form>
      <div>{output}</div>
    </div>
  );
}
