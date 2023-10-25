import * as React from "react";
import { invoke } from "@tauri-apps/api/tauri";

export const useInvokedQuery = <T>(fnName: string) => {
  const [data, setData] = React.useState<T | null>(null);
  const [status, setStatus] = React.useState(
    "idle" as "idle" | "loading" | "error" | "success",
  );

  const execute = React.useCallback(async (arg: any) => {
    setStatus("loading");
    return invoke(fnName, arg)
      .then((res) => {
        setData(res as T);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  return { data, status, execute };
};
