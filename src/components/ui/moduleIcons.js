import { createElement } from "react";
import {
  Braces,
  Boxes,
  Repeat,
  SquareFunction,
  TriangleAlert,
  Shapes,
  Package,
  FileText,
  Workflow,
  Sparkles,
  Timer,
  Gem,
  Globe,
  BookOpen,
  Sprout,
  Layers,
  Zap,
  Crown,
} from "lucide-react";

const MODULE_ICONS = {
  syntax: Braces,
  collections: Boxes,
  loops: Repeat,
  functions: SquareFunction,
  gotchas: TriangleAlert,
  oop: Shapes,
  modules: Package,
  fileio: FileText,
  generators: Workflow,
  modern: Sparkles,
  "async-testing": Timer,
  pythonic: Gem,
  ecosystem: Globe,
};

export const moduleIcon = (id) => MODULE_ICONS[id] || BookOpen;

export const TIER_ICONS = { 1: Sprout, 2: Layers, 3: Zap, 4: Crown };

// Render helpers (static components, so React can keep their identity).
export function ModuleIcon({ id, ...props }) {
  return createElement(MODULE_ICONS[id] || BookOpen, props);
}

export function TierIcon({ tier, ...props }) {
  const icon = TIER_ICONS[tier];
  return icon ? createElement(icon, props) : null;
}
