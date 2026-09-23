export type Screen =
  | "role-select"
  | "auth"
  | "onboarding1"
  | "cv-upload"
  | "manual-entry"
  | "onboarding2"
  | "feed"
  | "job-detail"
  | "c-dashboard"
  | "r-dashboard"
  | "r-create"
  | "r-mission-edit"
  | "legal";

export type UserMode = "candidate" | "recruiter";
export type AuthTab = "login" | "signup";
export type DashTab = "applications" | "favorites" | "profile";
export type RecTab = "missions" | "applicants";

export type Job = {
  id: number | string;
  title: string;
  salon: string;
  location: string;
  rate: number;
  shift: string;
  contract: string;
  match: number;
  tags: string[];
  skills?: string[];
  image: string;
  description: string;
  dates?: string;
  sortDate?: Date | string;
  diplomas?: string[];
  benefits?: string[];
  urlOrigine?: string;
  isInternal?: boolean;
  recruiterEmail?: string;
};

export type Mission = {
  id: number | string;
  title: string;
  dates: string;
  sortDate?: Date | string;
  startDate?: string;
  endDate?: string;
  location: string;
  rate: number;
  shift: string;
  description: string;
  skills: string[];
  count?: number;
  status: "open" | "filled" | "completed" | "closed" | "paused" | string;
};

export type Applicant = {
  id: number | string;
  missionId: number | string;
  name: string;
  match: number;
  level: string;
  status: string;
  initials: string;
  availFrom: string;
  availTo: string;
};

export type Application = {
  id: number | string;
  title: string;
  salon: string;
  date: string;
  status: string;
};

export type Filters = {
  contract: string;
  location: string;
  rateMin: number;
  matchMin: number;
};