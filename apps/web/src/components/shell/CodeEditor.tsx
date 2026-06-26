"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  filename: string;
}

export default function CodeEditor({ value, onChange, filename }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      defaultLanguage="python"
      path={filename}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme="vs-light"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        padding: { top: 12 },
        automaticLayout: true,
      }}
    />
  );
}
