export interface WorkspaceFileTemplate {
  path: string;
  language: string;
  starter: string;
}

export interface WorkspaceTemplate {
  primary: string;
  files: WorkspaceFileTemplate[];
}

export function getWorkspaceTemplate(lessonId: string, primaryStarter: string, primaryName: string): WorkspaceTemplate | null {
  const templates: Record<string, WorkspaceTemplate> = {
    "32-minimal-agent-workbench": {
      primary: primaryName,
      files: [
        {
          path: "INSTRUCTIONS.md",
          language: "markdown",
          starter: `# Agent router\n\n1. Read STATE.json\n2. Run agent loop in ${primaryName}\n3. Update TASKS.md when done\n`,
        },
        {
          path: "STATE.json",
          language: "json",
          starter: '{\n  "phase": "observe",\n  "last_tool": null\n}\n',
        },
        {
          path: "TASKS.md",
          language: "markdown",
          starter: "- [ ] Return three loop steps from agent_loop_steps()\n",
        },
        { path: primaryName, language: "python", starter: primaryStarter },
      ],
    },
    "41-workbench-for-real-repos": {
      primary: primaryName,
      files: [
        {
          path: "INSTRUCTIONS.md",
          language: "markdown",
          starter: `# Repo workbench\n\nRoute the agent to docs/ only when needed.\n`,
        },
        {
          path: "STATE.json",
          language: "json",
          starter: '{\n  "repo": "example",\n  "open_files": []\n}\n',
        },
        {
          path: "docs/ARCHITECTURE.md",
          language: "markdown",
          starter: "## Layout\n\nsrc/ · tests/ · deploy/\n",
        },
        { path: primaryName, language: "python", starter: primaryStarter },
      ],
    },
    "42-agent-workbench-capstone": {
      primary: primaryName,
      files: [
        {
          path: "INSTRUCTIONS.md",
          language: "markdown",
          starter: `# Capstone workbench\n\nShip: state + tasks + passing tests.\n`,
        },
        {
          path: "STATE.json",
          language: "json",
          starter: '{\n  "capstone": "in_progress"\n}\n',
        },
        {
          path: "TASKS.md",
          language: "markdown",
          starter: "- [ ] Pass all tests\n- [ ] Document artifact\n",
        },
        { path: primaryName, language: "python", starter: primaryStarter },
      ],
    },
  };

  return templates[lessonId] ?? null;
}

export function isT1Lesson(exercise?: { plugin?: string; runtimeTier?: string }): boolean {
  if (!exercise) return false;
  return exercise.runtimeTier === "T1" || exercise.plugin === "monaco-ts";
}
