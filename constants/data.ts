import { calculationType } from "@/types";

export const dummyCalculations: calculationType[] = [
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
];
