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
  | "r-mission-edit";

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
  image: string;
  description: string;
  diplomas: string[];
  benefits: string[];
};

export type Mission = {
  id: number;
  title: string;
  dates: string;
  sortDate: Date;
  startDate: string;
  endDate: string;
  location: string;
  rate: number;
  shift: string;
  description: string;
  skills: string[];
  count: number;
  status: "open" | "filled" | "completed";
};

export type Applicant = {
  id: number;
  missionId: number;
  name: string;
  match: number;
  level: string;
  status: string;
  initials: string;
  availFrom: string;
  availTo: string;
};

export type Application = {
  id: number;
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