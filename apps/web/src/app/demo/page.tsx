import { redirect } from "next/navigation";
import { DEFAULT_LESSON_ID } from "@/lib/lessons";

export default function DemoIndexPage() {
  redirect(`/demo/${DEFAULT_LESSON_ID}`);
}
