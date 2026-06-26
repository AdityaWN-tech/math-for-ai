"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  filename: string;
  language?: string;
}

function langFromFilename(filename: string): string {
  if (filename.endsWith(".py")) return "python";
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) return "typescript";
  if (filename.endsWith(".json")) return "json";
  if (filename.endsWith(".md")) return "markdown";
  return "plaintext";
}

export default function CodeEditor({ value, onChange, filename, language }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      defaultLanguage={language ?? langFromFilename(filename)}
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
