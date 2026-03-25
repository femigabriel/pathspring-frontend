export const selFocusOptions = [
  "self-awareness",
  "self-management",
  "social-awareness",
  "relationship-skills",
  "responsible-decision-making",
  "optimistic-thinking",
] as const;

export type SelFocusOption = (typeof selFocusOptions)[number];

export const prettifySelFocus = (value: string) =>
  value
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

export const selFocusDescriptions: Record<SelFocusOption, string> = {
  "self-awareness": "Stories that help students notice feelings, thoughts, and personal strengths.",
  "self-management": "Stories that encourage calm choices, focus, patience, and healthy habits.",
  "social-awareness": "Stories that build empathy, respect, and care for people around us.",
  "relationship-skills": "Stories that support teamwork, friendship, listening, and speaking kindly.",
  "responsible-decision-making":
    "Stories that guide students toward thoughtful choices and better problem-solving.",
  "optimistic-thinking": "Stories that grow courage, hope, and a positive way of facing challenges.",
};
