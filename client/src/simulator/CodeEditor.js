import Editor from "@monaco-editor/react";

export default function CodeEditor({ onCode, value }) {
  return (
    <Editor
      height="100vh"
      defaultLanguage="java"
      language="java"
      value={value}
      onChange={(v) => onCode(v)}
      theme="vs-dark"
    />
  );
}
