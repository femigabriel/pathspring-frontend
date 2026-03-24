"use client";

import type { AuthUser } from "@/src/lib/auth";
import type { SchoolStoryContent } from "@/src/lib/school-content-api";

const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();

const getStudentGrade = (user: AuthUser | null) =>
  normalize(user?.classroom?.gradeLevel ?? user?.gradeLevel ?? null);

export const isBookAllowedForStudent = (
  content: Pick<SchoolStoryContent, "gradeLevels"> | null | undefined,
  user: AuthUser | null,
) => {
  if (!content) return false;

  const studentGrade = getStudentGrade(user);
  const contentGrades = (content.gradeLevels ?? []).map((grade) => normalize(grade)).filter(Boolean);

  if (!studentGrade) {
    return true;
  }

  if (contentGrades.length === 0) {
    return true;
  }

  return contentGrades.includes(studentGrade);
};

export const filterBooksForStudent = <T extends Pick<SchoolStoryContent, "gradeLevels">>(
  contents: T[],
  user: AuthUser | null,
) => contents.filter((content) => isBookAllowedForStudent(content, user));
