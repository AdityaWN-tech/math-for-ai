"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, FolderOpen, Terminal } from "lucide-react";
import { cn } from "@/lib/cn";
import type { WorkspaceTemplate } from "@/lib/workspace-templates";
import { getWorkspaceFiles, saveWorkspaceFiles } from "@/lib/progress";

const CodeEditor = dynamic(() => import("@/components/shell/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[200px] items-center justify-center font-mono text-sm text-[var(--ink-mute)]">
      Loading editor…
    </div>
  ),
});

interface LocalWorkspaceProps {
  lessonId: string;
  template: WorkspaceTemplate;
  onPrimaryChange: (code: string) => void;
}

export function LocalWorkspace({ lessonId, template, onPrimaryChange }: LocalWorkspaceProps) {
  const [activePath, setActivePath] = useState(template.primary);
  const [terminal, setTerminal] = useState<string[]>(["$ m4ai workspace — T1 local sandbox"]);
  const [files, setFiles] = useState<Record<string, string>>(() => {
    const saved = getWorkspaceFiles(lessonId);
    const initial: Record<string, string> = {};
    for (const f of template.files) {
      initial[f.path] = saved?.[f.path] ?? f.starter;
    }
    return initial;
  });

  const paths = useMemo(() => template.files.map((f) => f.path), [template.files]);
  const activeFile = template.files.find((f) => f.path === activePath) ?? template.files[0];

  useEffect(() => {
    saveWorkspaceFiles(lessonId, files);
    const primary = files[template.primary] ?? "";
    onPrimaryChange(primary);
  }, [files, lessonId, onPrimaryChange, template.primary]);

  const updateFile = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
  }, []);

  const runShell = (cmd: string) => {
    setTerminal((t) => [...t, `$ ${cmd}`]);
    if (cmd.trim() === "ls") {
      setTerminal((t) => [...t, paths.join("  ")]);
    } else if (cmd.trim() === "cat STATE.json") {
      setTerminal((t) => [...t, files["STATE.json"] ?? "(missing)"]);
    } else {
      setTerminal((t) => [...t, "# Use Run in footer to execute tests on " + template.primary]);
    }
  };

  return (
    <div className="flex min-h-[400px] flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--rule-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
        <FolderOpen className="h-3.5 w-3.5" />
        T1 workspace · local files
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[140px_1fr]">
        <ul className="border-b border-[var(--rule-soft)] p-2 md:border-b-0 md:border-r">
          {paths.map((path) => (
            <li key={path}>
              <button
                type="button"
                onClick={() => setActivePath(path)}
                className={cn(
                  "flex w-full items-center gap-1 rounded px-2 py-1 text-left font-mono text-xs",
                  path === activePath
                    ? "bg-[var(--blueprint-tint)] text-[var(--blueprint)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--bg-surface)]",
                )}
              >
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate">{path}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex min-h-[240px] flex-col">
          <div className="border-b border-[var(--rule-soft)] px-3 py-1 font-mono text-xs text-[var(--ink-mute)]">
            {activePath}
            {activePath === template.primary && (
              <span className="ml-2 text-[var(--blueprint)]">← tests run here</span>
            )}
          </div>
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={files[activePath] ?? ""}
              onChange={(v) => updateFile(activePath, v)}
              filename={activePath}
            />
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--rule-soft)] bg-[var(--code-bg)] p-2">
        <div className="mb-1 flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--ink-mute)]">
          <Terminal className="h-3 w-3" />
          Shell (simulated)
        </div>
        <pre className="max-h-20 overflow-auto font-mono text-[10px] leading-relaxed text-[var(--ink-soft)]">
          {terminal.join("\n")}
        </pre>
        <div className="mt-1 flex gap-1">
          {["ls", "cat STATE.json"].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => runShell(cmd)}
              className="rounded border border-[var(--rule-soft)] px-2 py-0.5 font-mono text-[10px] hover:border-[var(--blueprint)]"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
