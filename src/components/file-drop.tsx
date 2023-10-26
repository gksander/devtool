import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { FileDown } from "lucide-react";

type FileDropProps = {
  fileExtensions?: string[];
  onFileDrop: (filepath: string) => void;
};

export function FileDrop({ fileExtensions, onFileDrop }: FileDropProps) {
  const [isDrag, setIsDrag] = React.useState(false);

  React.useEffect(() => {
    let u1: UnlistenFn = () => undefined;
    let u2: UnlistenFn = () => undefined;
    let u3: UnlistenFn = () => undefined;

    (async () => {
      u1 = await listen("tauri://file-drop-hover", () => {
        setIsDrag(true);
      });

      u2 = await listen("tauri://file-drop-cancelled", () => {
        setIsDrag(false);
      });

      u3 = await listen<string[]>("tauri://file-drop", (evt) => {
        const file = evt.payload[0];

        if (file) {
          const ext = file.split(".").pop()?.toLowerCase();
          if (!fileExtensions || (ext && fileExtensions.includes(ext)))
            onFileDrop?.(file);
        }

        setIsDrag(false);
      });
    })();

    return () => {
      [u1, u2, u3].forEach((u) => u());
    };
  }, []);

  return (
    <React.Fragment>
      <AnimatePresence>
        {isDrag && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col gap-5 items-center">
              <div className="text-2xl font-bold">Drop file</div>
              <FileDown className="w-10 h-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}
