import { KeyCode, KeyMod } from "monaco-editor";
import { type editor } from "monaco-editor";

export function enableSearchFromEditor(editor: editor.IStandaloneCodeEditor) {
  editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyK, () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true }),
    );
  });
}
