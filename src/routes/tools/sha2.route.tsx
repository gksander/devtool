import * as React from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button.tsx";
import { PageContainer } from "@/components/ui/page-container.tsx";
import { LabeledInput } from "@/components/ui/labeled-input.tsx";

export function Sha2Route() {
  const [data, setData] = React.useState("");
  const [output, setOutput] = React.useState("");

  return (
    <PageContainer>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setOutput(await invoke("hash_sha256", { data }));
        }}
        className="flex gap-x-2 items-end"
      >
        <LabeledInput
          label="Input"
          type="text"
          onChange={(e) => setData(e.currentTarget.value)}
          containerClassName="flex-1"
        />
        <Button type="submit">Hash</Button>
      </form>
      <div className="mt-2">{output}</div>
    </PageContainer>
  );
}
