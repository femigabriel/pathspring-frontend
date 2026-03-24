"use client";

import type { AuthSchool, AuthUser } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface StudentProfileResponse {
  student?: {
    id?: string;
    username?: string;
    fullName?: string;
    isActive?: boolean;
    lastLoginAt?: string;
    school?: {
      id?: string;
      name?: string;
      schoolCode?: string;
      logo?: string | null;
    };
    profile?: {
      gradeLevel?: string;
      classroom?: {
        id?: string;
        name?: string;
        gradeLevel?: string;
      } | null;
    };
  };
}

const parseResponse = async (response: Response) => {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const extractMessage = (payload: Record<string, unknown> | null, fallback: string) => {
  const message = payload?.message ?? payload?.error ?? payload?.detail;
  return typeof message === "string" && message.trim() ? message : fallback;
};

export const getStudentProfile = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/students/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = (await parseResponse(response)) as StudentProfileResponse | null;

  if (!response.ok) {
    throw new Error(extractMessage(payload as Record<string, unknown> | null, "Failed to fetch student profile."));
  }

  const student = payload?.student;
  if (!student) {
    throw new Error("Student profile was not returned.");
  }

  const user: AuthUser = {
    id: student.id ?? "",
    role: "STUDENT",
    username: student.username,
    fullName: student.fullName,
    isActive: student.isActive,
    school: student.school?.name ?? null,
    schoolCode: student.school?.schoolCode ?? null,
    gradeLevel: student.profile?.gradeLevel ?? null,
    classroom: student.profile?.classroom
      ? {
          id: student.profile.classroom.id ?? "",
          name: student.profile.classroom.name ?? "",
          gradeLevel: student.profile.classroom.gradeLevel,
        }
      : null,
    lastLoginAt: student.lastLoginAt ?? null,
  };

  const school: AuthSchool | null = student.school
    ? {
        id: student.school.id ?? "",
        name: student.school.name ?? "PathSpring School",
        schoolCode: student.school.schoolCode ?? "",
        logo: student.school.logo ?? null,
      }
    : null;

  return { user, school };
};
