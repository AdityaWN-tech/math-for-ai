import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { LearningShell } from "@/components/shell/LearningShell";
import { INTERACTIVE_LESSONS } from "@/lib/lessons";
import type { Lesson } from "@/lib/lesson-types";
import catalog from "@/content/lessons/catalog.json";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

async function loadLesson(lessonId: string): Promise<Lesson | null> {
  if (INTERACTIVE_LESSONS[lessonId]) {
    return INTERACTIVE_LESSONS[lessonId];
  }

  try {
    const file = path.join(
      process.cwd(),
      "src/content/lessons/compiled",
      `${lessonId}.json`,
    );
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as Lesson;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return catalog.lessons.map((l) => ({ lessonId: l.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = await loadLesson(lessonId);
  return {
    title: lesson ? `${lesson.title} — Math for AI` : "Lesson — Math for AI",
  };
}

export default async function LessonDemoPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = await loadLesson(lessonId);
  if (!lesson) notFound();

  return <LearningShell lesson={lesson} />;
}
