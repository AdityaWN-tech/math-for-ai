"use client";

import type { ComponentType } from "react";
import { AttentionFigure } from "@/components/figure/AttentionFigure";
import { AgentLoopFigure } from "@/components/figure/AgentLoopFigure";
import { CalculusDerivativeFigure } from "@/components/figure/CalculusDerivativeFigure";
import { MatrixMultiplyFigure } from "@/components/figure/MatrixMultiplyFigure";
import { MatrixTransformFigure } from "@/components/figure/MatrixTransformFigure";
import { VectorProjectionFigure } from "@/components/figure/VectorProjectionFigure";
import type { LessonStep } from "@/lib/lesson-types";

export type FigureId = NonNullable<LessonStep["figure"]>;

export interface FigureComponentProps {
  onInteract: () => void;
}

const FIGURES: Record<FigureId, ComponentType<FigureComponentProps>> = {
  "vector-projection": VectorProjectionFigure,
  "matrix-multiply": MatrixMultiplyFigure,
  "matrix-transform": MatrixTransformFigure,
  attention: AttentionFigure,
  "agent-loop": AgentLoopFigure,
  "calculus-derivative": CalculusDerivativeFigure,
};

export function getFigureComponent(id: FigureId): ComponentType<FigureComponentProps> | null {
  return FIGURES[id] ?? null;
}

export function listFigureIds(): FigureId[] {
  return Object.keys(FIGURES) as FigureId[];
}
