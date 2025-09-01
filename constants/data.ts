import { SemesterType, CourseType } from "@/types";

export const dummySemesters: SemesterType[] = [
  {
    id: "1",
    name: "Semester 1 GPA",
    gpa: 3.85,
    lastUpdated: new Date("2023-10-26"),
    uid: "user123",
  },
  {
    id: "2",
    name: "Semester 2 GPA",
    gpa: 3.6,
    lastUpdated: new Date("2023-04-15"),
    uid: "user123",
  },
  {
    id: "3",
    name: "Expected Final GPA",
    gpa: null,
    lastUpdated: new Date("2023-12-20"),
    uid: "user123",
  },
  {
    id: "4",
    name: "Summer Session GPA",
    gpa: 4.0,
    lastUpdated: new Date("2023-08-01"),
    uid: "user123",
  },
  {
    id: "5",
    name: "Semester 3 GPA",
    gpa: 3.75,
    lastUpdated: new Date("2024-01-10"),
    uid: "user123",
  },
  {
    id: "6",
    name: "Semester x GPA",
    gpa: 3.75,
    lastUpdated: new Date("2024-01-10"),
    uid: "user123",
  },
  {
    id: "7",
    name: "Semester y GPA",
    gpa: 3.05,
    lastUpdated: new Date("2024-01-10"),
    uid: "user123",
  },
];

export const dummyCourses: CourseType[] = [
  {
    id: "1",
    name: "Mathematics 101",
    creditUnit: 3,
    GradePoint: "A",
    uid: "user123",
    semesterId: "1",
  },
  {
    id: "2",
    name: "English Literature 202",
    creditUnit: 2,
    uid: "user123",
    semesterId: "1",
    GradePoint: "B",
  },
  {
    id: "3",
    name: "Computer Science 305",
    semesterId: "1",
    uid: "user123",
    creditUnit: 4,
    GradePoint: "C",
  },
  {
    id: "4",
    name: "Economics 210",
    uid: "user123",
    creditUnit: 3,
    semesterId: "1",
    GradePoint: "A",
  },
];
