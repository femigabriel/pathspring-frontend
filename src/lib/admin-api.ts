"use client";

import type { AuthUser } from "@/src/lib/auth";
import { getAccessToken } from "@/src/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface AdminStudent {
  id: string;
  fullName: string;
  gradeLevel?: string;
  classroom?: string;
  classroomName?: string;
  classroomDetails?: {
    id: string;
    name: string;
    gradeLevel?: string;
  } | null;
  age?: number;
  parentEmail?: string;
  parentPhone?: string;
  isActive?: boolean;
  storiesRead?: number;
  rating?: number;
  username?: string;
  progress?: number;
  completionRate?: number;
  [key: string]: unknown;
}

export interface AdminTeacher {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  specialization?: string;
  studentsCount?: number;
  rating?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminClassroom {
  id: string;
  name: string;
  gradeLevel?: string;
  teacher?: AdminTeacher | null;
  studentCount?: number;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminSchoolDetails {
  id?: string;
  name?: string;
  schoolCode?: string;
  location?: string;
  createdAt?: string;
  tier?: string;
  billingPlanKey?: string;
  billingStatus?: string;
  stripeStatus?: string;
  stripeCurrentPeriodEnd?: string;
  stripeCancelAtPeriodEnd?: boolean;
  studentCount?: number;
  activeStudentCount?: number;
  teacherCount?: number;
  activeTeacherCount?: number;
  classCount?: number;
  activeClassCount?: number;
  [key: string]: unknown;
}

const matchesTeacherIdentity = (
  teacher: AdminTeacher | null | undefined,
  user?: Pick<AuthUser, "id" | "email" | "fullName"> | null,
) => {
  if (!teacher || !user) return false;

  if (teacher.id && user.id && teacher.id === user.id) return true;
  if (teacher.email && user.email && teacher.email.toLowerCase() === user.email.toLowerCase()) {
    return true;
  }
  if (
    teacher.fullName &&
    user.fullName &&
    teacher.fullName.trim().toLowerCase() === user.fullName.trim().toLowerCase()
  ) {
    return true;
  }

  return false;
};

interface DashboardSnapshot {
  students: AdminStudent[];
  teachers: AdminTeacher[];
  classes: AdminClassroom[];
  school: AdminSchoolDetails | null;
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalStories: number;
    avgProgress: number;
  };
}

export interface TeacherAssignmentOverviewItem {
  id: string;
  contentId?: string;
  title?: string;
  classroomId?: string;
  classroomName?: string;
  dueAt?: string;
  status?: string;
  assignedCount?: number;
  completedCount?: number;
  inProgressCount?: number;
  overdueCount?: number;
  notStartedCount?: number;
  [key: string]: unknown;
}

export interface TeacherCompletionItem {
  id: string;
  studentId?: string;
  studentName?: string;
  contentId?: string;
  contentTitle?: string;
  score?: number;
  completedAt?: string;
  classroomName?: string;
  [key: string]: unknown;
}

export interface TeacherLowScoreItem {
  id: string;
  studentId?: string;
  studentName?: string;
  contentId?: string;
  contentTitle?: string;
  score?: number;
  classroomName?: string;
  submittedAt?: string;
  [key: string]: unknown;
}

export interface TeacherDashboardData {
  summary: {
    classCount: number;
    studentCount: number;
    activeAssignments: number;
    overdueAssignments: number;
    completionsThisWeek: number;
    lowScoreCount: number;
    unreadNotifications: number;
  };
  classes: AdminClassroom[];
  assignments: TeacherAssignmentOverviewItem[];
  recentCompletions: TeacherCompletionItem[];
  lowScoreStudents: TeacherLowScoreItem[];
}

export interface ParentMessageableContact {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  studentUserId?: string;
  studentName?: string;
  classroomName?: string;
  [key: string]: unknown;
}

export interface ParentMessageInput {
  toUserId: string;
  studentUserId?: string;
  subject: string;
  body: string;
}

export interface ParentMessage {
  id: string;
  subject?: string;
  body?: string;
  fromUserId?: string;
  toUserId?: string;
  studentUserId?: string;
  readAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface RequestResult<T> {
  data: T;
  path: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const extractMessage = (payload: unknown, fallback: string) => {
  if (!isRecord(payload)) return fallback;

  const message =
    payload.message ??
    payload.error ??
    payload.detail ??
    payload.title;

  return typeof message === "string" && message.trim() ? message : fallback;
};

const formatRetryAfterMessage = (retryAfter: string | null) => {
  if (!retryAfter) {
    return "Too many requests right now. Please wait a little and try again.";
  }

  const retryAfterSeconds = Number(retryAfter);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return `Too many requests right now. Please try again in ${retryAfterSeconds} seconds.`;
  }

  return `Too many requests right now. Please try again after ${retryAfter}.`;
};

const parseJsonSafely = (text: string) => {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const requestJson = async <T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<RequestResult<T>> => {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = parseJsonSafely(text) as T;

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(formatRetryAfterMessage(response.headers.get("Retry-After")));
    }

    if (response.status === 400) {
      throw new Error(
        extractMessage(payload, "Please check the request details and try again."),
      );
    }

    throw new Error(extractMessage(payload, `Request failed with status ${response.status}`));
  }

  return { data: payload, path };
};

const requestJsonFromCandidates = async <T = unknown>(
  paths: string[],
  init?: RequestInit,
): Promise<RequestResult<T>> => {
  let lastError: Error | null = null;

  for (const path of paths) {
    try {
      return await requestJson<T>(path, init);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Request failed");
    }
  }

  throw lastError ?? new Error("Request failed");
};

const pickArray = <T>(
  payload: unknown,
  keys: string[],
): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of keys) {
    const directValue = payload[key];
    if (Array.isArray(directValue)) {
      return directValue as T[];
    }

    if (isRecord(directValue)) {
      for (const nestedKey of ["items", "results", "data", key]) {
        const nestedValue = directValue[nestedKey];
        if (Array.isArray(nestedValue)) {
          return nestedValue as T[];
        }
      }
    }
  }

  if (isRecord(payload.data)) {
    return pickArray<T>(payload.data, keys);
  }

  return [];
};

const pickSchool = (payload: unknown): AdminSchoolDetails | null => {
  if (!payload) return null;

  if (isRecord(payload)) {
    if (isRecord(payload.school)) {
      return payload.school as AdminSchoolDetails;
    }

    if (isRecord(payload.data) && isRecord(payload.data.school)) {
      return payload.data.school as AdminSchoolDetails;
    }

    if (typeof payload.name === "string" || typeof payload.schoolCode === "string") {
      return payload as AdminSchoolDetails;
    }
  }

  return null;
};

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const normalizeStudent = (student: AdminStudent) => {
  const classroomDetails =
    isRecord(student.classroom) &&
    typeof student.classroom.id === "string" &&
    typeof student.classroom.name === "string"
      ? {
          id: student.classroom.id,
          name: student.classroom.name,
          gradeLevel:
            typeof student.classroom.gradeLevel === "string"
              ? student.classroom.gradeLevel
              : undefined,
        }
      : null;

  return {
    ...student,
    id: student.id ?? "",
    fullName: student.fullName ?? "Unnamed Student",
    classroom: classroomDetails?.id ?? (typeof student.classroom === "string" ? student.classroom : undefined),
    classroomName: classroomDetails?.name,
    classroomDetails,
    isActive:
      typeof student.isActive === "boolean"
        ? student.isActive
        : typeof student.enrollmentStatus === "string"
          ? student.enrollmentStatus === "active"
          : true,
  };
};

const normalizeTeacher = (teacher: AdminTeacher) => ({
  ...teacher,
  id: teacher.id ?? "",
  fullName: teacher.fullName ?? "Unnamed Teacher",
  email: teacher.email ?? "",
  role: teacher.role ?? "TEACHER",
  studentsCount:
    typeof teacher.studentsCount === "number"
      ? teacher.studentsCount
      : Array.isArray(teacher.classrooms)
        ? teacher.classrooms.length
        : 0,
});

const normalizeClassroom = (classroom: AdminClassroom) => ({
  ...classroom,
  id: classroom.id ?? "",
  name: classroom.name ?? "Untitled Class",
  teacher:
    isRecord(classroom.teacher) && typeof classroom.teacher.id === "string"
      ? normalizeTeacher(classroom.teacher as AdminTeacher)
      : null,
  studentCount: typeof classroom.studentCount === "number" ? classroom.studentCount : 0,
  isActive: typeof classroom.isActive === "boolean" ? classroom.isActive : true,
});

const normalizeTeacherAssignmentOverview = (
  assignment: Record<string, unknown>,
): TeacherAssignmentOverviewItem => ({
  ...assignment,
  id: typeof (assignment.id ?? assignment._id) === "string" ? String(assignment.id ?? assignment._id) : "",
  contentId: typeof assignment.contentId === "string" ? assignment.contentId : undefined,
  title:
    typeof assignment.title === "string"
      ? assignment.title
      : typeof assignment.contentTitle === "string"
        ? assignment.contentTitle
        : typeof assignment.name === "string"
          ? assignment.name
          : undefined,
  classroomId: typeof assignment.classroomId === "string" ? assignment.classroomId : undefined,
  classroomName:
    typeof assignment.classroomName === "string"
      ? assignment.classroomName
      : typeof assignment.className === "string"
        ? assignment.className
        : undefined,
  dueAt: typeof assignment.dueAt === "string" ? assignment.dueAt : undefined,
  status: typeof assignment.status === "string" ? assignment.status : undefined,
  assignedCount: typeof assignment.assignedCount === "number" ? assignment.assignedCount : 0,
  completedCount: typeof assignment.completedCount === "number" ? assignment.completedCount : 0,
  inProgressCount: typeof assignment.inProgressCount === "number" ? assignment.inProgressCount : 0,
  overdueCount: typeof assignment.overdueCount === "number" ? assignment.overdueCount : 0,
  notStartedCount: typeof assignment.notStartedCount === "number" ? assignment.notStartedCount : 0,
});

const normalizeTeacherCompletion = (
  item: Record<string, unknown>,
): TeacherCompletionItem => ({
  ...item,
  id: typeof (item.id ?? item._id) === "string" ? String(item.id ?? item._id) : "",
  studentId: typeof item.studentId === "string" ? item.studentId : undefined,
  studentName:
    typeof item.studentName === "string"
      ? item.studentName
      : typeof item.fullName === "string"
        ? item.fullName
        : undefined,
  contentId: typeof item.contentId === "string" ? item.contentId : undefined,
  contentTitle:
    typeof item.contentTitle === "string"
      ? item.contentTitle
      : typeof item.title === "string"
        ? item.title
        : undefined,
  score: typeof item.score === "number" ? item.score : undefined,
  completedAt:
    typeof item.completedAt === "string"
      ? item.completedAt
      : typeof item.submittedAt === "string"
        ? item.submittedAt
        : undefined,
  classroomName:
    typeof item.classroomName === "string"
      ? item.classroomName
      : typeof item.className === "string"
        ? item.className
        : undefined,
});

const normalizeTeacherLowScore = (
  item: Record<string, unknown>,
): TeacherLowScoreItem => ({
  ...normalizeTeacherCompletion(item),
  submittedAt:
    typeof item.submittedAt === "string"
      ? item.submittedAt
      : typeof item.completedAt === "string"
        ? item.completedAt
        : undefined,
});

export const getAdminStudents = async () => {
  const { data } = await requestJsonFromCandidates<unknown>([
    "/api/v1/school/students",
    "/api/v1/auth/students",
  ]);

  return pickArray<AdminStudent>(data, ["students", "data", "results"]).map(normalizeStudent);
};

export const getAdminTeachers = async () => {
  const { data } = await requestJsonFromCandidates<unknown>([
    "/api/v1/school/teachers",
    "/api/v1/auth/teachers",
  ]);

  return pickArray<AdminTeacher>(data, ["teachers", "data", "results"]).map(normalizeTeacher);
};

export const getAdminClasses = async () => {
  const { data } = await requestJsonFromCandidates<unknown>([
    "/api/v1/classes",
    "/api/v1/auth/classes",
  ]);

  return pickArray<AdminClassroom>(data, ["classrooms", "classes", "data", "results"]).map(
    normalizeClassroom,
  );
};

export const getAdminSchoolDetails = async () => {
  const { data } = await requestJson<unknown>("/api/v1/school/details");

  if (!isRecord(data)) {
    return null;
  }

  const school = pickSchool(data);
  const stats = isRecord(data.stats) ? data.stats : null;

  if (!school) {
    return null;
  }

  return {
    ...school,
    tier:
      typeof school.tier === "string"
        ? school.tier
        : typeof school.planKey === "string"
          ? school.planKey
          : undefined,
    billingPlanKey:
      typeof school.billingPlanKey === "string"
        ? school.billingPlanKey
        : typeof school.planKey === "string"
          ? school.planKey
          : undefined,
    billingStatus:
      typeof school.billingStatus === "string"
        ? school.billingStatus
        : typeof school.subscriptionStatus === "string"
          ? school.subscriptionStatus
          : typeof school.stripeStatus === "string"
            ? school.stripeStatus
            : undefined,
    stripeStatus: typeof school.stripeStatus === "string" ? school.stripeStatus : undefined,
    stripeCurrentPeriodEnd:
      typeof school.stripeCurrentPeriodEnd === "string"
        ? school.stripeCurrentPeriodEnd
        : typeof school.currentPeriodEnd === "string"
          ? school.currentPeriodEnd
          : undefined,
    stripeCancelAtPeriodEnd:
      typeof school.stripeCancelAtPeriodEnd === "boolean"
        ? school.stripeCancelAtPeriodEnd
        : typeof school.cancelAtPeriodEnd === "boolean"
          ? school.cancelAtPeriodEnd
          : undefined,
    studentCount: typeof stats?.studentCount === "number" ? stats.studentCount : undefined,
    activeStudentCount:
      typeof stats?.activeStudentCount === "number" ? stats.activeStudentCount : undefined,
    teacherCount: typeof stats?.teacherCount === "number" ? stats.teacherCount : undefined,
    activeTeacherCount:
      typeof stats?.activeTeacherCount === "number" ? stats.activeTeacherCount : undefined,
    classCount: typeof stats?.classCount === "number" ? stats.classCount : undefined,
    activeClassCount:
      typeof stats?.activeClassCount === "number" ? stats.activeClassCount : undefined,
  };
};

export const isTeacherClassOwner = (
  classroom: AdminClassroom,
  user?: Pick<AuthUser, "id" | "email" | "fullName"> | null,
) => matchesTeacherIdentity(classroom.teacher, user);

export const filterClassesForTeacher = (
  classrooms: AdminClassroom[],
  user?: Pick<AuthUser, "id" | "email" | "fullName"> | null,
) => classrooms.filter((classroom) => isTeacherClassOwner(classroom, user));

export const filterStudentsForTeacher = (
  students: AdminStudent[],
  classrooms: AdminClassroom[],
  user?: Pick<AuthUser, "id" | "email" | "fullName"> | null,
) => {
  const teacherClassIds = new Set(filterClassesForTeacher(classrooms, user).map((classroom) => classroom.id));
  return students.filter((student) => {
    const classroomId =
      student.classroomDetails?.id ??
      (typeof student.classroom === "string" ? student.classroom : "");
    return classroomId ? teacherClassIds.has(classroomId) : false;
  });
};

export const filterTeachersForTeacher = (
  teachers: AdminTeacher[],
  user?: Pick<AuthUser, "id" | "email" | "fullName"> | null,
) => teachers.filter((teacher) => matchesTeacherIdentity(teacher, user));

export const getAdminDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  const [students, teachers, classes, school] = await Promise.all([
    getAdminStudents(),
    getAdminTeachers(),
    getAdminClasses(),
    getAdminSchoolDetails().catch(() => null),
  ]);

  const totalStories = students.reduce((sum, student) => {
    const storiesRead =
      typeof student.storiesRead === "number"
        ? student.storiesRead
        : typeof student.storiesRead === "string"
          ? Number(student.storiesRead)
          : 0;

    return sum + (Number.isFinite(storiesRead) ? storiesRead : 0);
  }, 0);

  const avgProgress = average(
    students
      .map((student) => {
        if (typeof student.progress === "number") return student.progress;
        if (typeof student.completionRate === "number") return student.completionRate;
        return null;
      })
      .filter((value): value is number => value !== null),
  );

  return {
    students,
    teachers,
    classes,
    school,
    stats: {
      totalStudents: school?.studentCount ?? students.length,
      totalTeachers: school?.teacherCount ?? teachers.length,
      totalStories,
      avgProgress,
    },
  };
};

export const getTeacherDashboard = async (): Promise<TeacherDashboardData> => {
  const { data } = await requestJson<unknown>("/api/v1/school/teacher-dashboard");
  const record = isRecord(data) ? data : {};
  const summaryRecord = isRecord(record.summary)
    ? record.summary
    : isRecord(record.cards)
      ? record.cards
      : {};

  return {
    summary: {
      classCount: typeof summaryRecord.classCount === "number" ? summaryRecord.classCount : 0,
      studentCount: typeof summaryRecord.studentCount === "number" ? summaryRecord.studentCount : 0,
      activeAssignments:
        typeof summaryRecord.activeAssignments === "number" ? summaryRecord.activeAssignments : 0,
      overdueAssignments:
        typeof summaryRecord.overdueAssignments === "number" ? summaryRecord.overdueAssignments : 0,
      completionsThisWeek:
        typeof summaryRecord.completionsThisWeek === "number" ? summaryRecord.completionsThisWeek : 0,
      lowScoreCount: typeof summaryRecord.lowScoreCount === "number" ? summaryRecord.lowScoreCount : 0,
      unreadNotifications:
        typeof summaryRecord.unreadNotifications === "number" ? summaryRecord.unreadNotifications : 0,
    },
    classes: pickArray<AdminClassroom>(record, ["classes", "classrooms"]).map(normalizeClassroom),
    assignments: pickArray<Record<string, unknown>>(record, [
      "assignments",
      "assignmentOverview",
    ]).map(normalizeTeacherAssignmentOverview),
    recentCompletions: pickArray<Record<string, unknown>>(record, [
      "recentCompletions",
      "completions",
    ]).map(normalizeTeacherCompletion),
    lowScoreStudents: pickArray<Record<string, unknown>>(record, [
      "lowScoreStudents",
      "lowScores",
    ]).map(normalizeTeacherLowScore),
  };
};

export const getSchoolStudentProgress = async (studentId: string) => {
  const { data } = await requestJson<unknown>(`/api/v1/school/students/${studentId}/progress`);
  return isRecord(data) ? data : {};
};

export const getSchoolReadingReport = async (params?: {
  classroomId?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const search = new URLSearchParams();
  if (params?.classroomId?.trim()) search.set("classroomId", params.classroomId.trim());
  if (params?.fromDate?.trim()) search.set("fromDate", params.fromDate.trim());
  if (params?.toDate?.trim()) search.set("toDate", params.toDate.trim());
  const query = search.toString();

  const { data } = await requestJson<unknown>(
    `/api/v1/school/reports/reading${query ? `?${query}` : ""}`,
  );
  return isRecord(data) ? data : {};
};

export const getMessageableParents = async (params?: { classroomId?: string }) => {
  const search = new URLSearchParams();
  if (params?.classroomId?.trim()) search.set("classroomId", params.classroomId.trim());
  const query = search.toString();
  const { data } = await requestJson<unknown>(
    `/api/v1/parents/messageable${query ? `?${query}` : ""}`,
  );

  const items = pickArray<Record<string, unknown>>(data, ["contacts", "parents", "data", "results"]);
  return items.map((item) => ({
    ...item,
    id: typeof (item.id ?? item._id) === "string" ? String(item.id ?? item._id) : "",
    fullName:
      typeof item.fullName === "string"
        ? item.fullName
        : typeof item.name === "string"
          ? item.name
          : "",
    email: typeof item.email === "string" ? item.email : undefined,
    phone: typeof item.phone === "string" ? item.phone : undefined,
    studentUserId:
      typeof item.studentUserId === "string"
        ? item.studentUserId
        : typeof item.studentId === "string"
          ? item.studentId
          : undefined,
    studentName: typeof item.studentName === "string" ? item.studentName : undefined,
    classroomName: typeof item.classroomName === "string" ? item.classroomName : undefined,
  })) as ParentMessageableContact[];
};

export const sendParentMessage = async (input: ParentMessageInput) => {
  const { data } = await requestJson<unknown>("/api/v1/parents/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return isRecord(data) ? data : {};
};

export const getParentMessages = async (params?: { limit?: number; skip?: number }) => {
  const search = new URLSearchParams();
  if (typeof params?.limit === "number") search.set("limit", String(params.limit));
  if (typeof params?.skip === "number") search.set("skip", String(params.skip));
  const query = search.toString();

  const { data } = await requestJson<unknown>(
    `/api/v1/parents/messages${query ? `?${query}` : ""}`,
  );

  const items = pickArray<Record<string, unknown>>(data, ["messages", "data", "results"]);
  return items.map((item) => ({
    ...item,
    id: typeof (item.id ?? item._id) === "string" ? String(item.id ?? item._id) : "",
    subject: typeof item.subject === "string" ? item.subject : undefined,
    body: typeof item.body === "string" ? item.body : undefined,
    fromUserId: typeof item.fromUserId === "string" ? item.fromUserId : undefined,
    toUserId: typeof item.toUserId === "string" ? item.toUserId : undefined,
    studentUserId: typeof item.studentUserId === "string" ? item.studentUserId : undefined,
    readAt: typeof item.readAt === "string" ? item.readAt : undefined,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
  })) as ParentMessage[];
};

export const markParentMessageRead = async (messageId: string) =>
  requestJson<unknown>(`/api/v1/parents/messages/${messageId}/read`, {
    method: "PATCH",
  });
