import { BSON } from "realm";

export const CourseSchema = {
  name: "Course",
  primaryKey: "id",
  properties: {
    id: "string",
    name: "string",
    creditUnit: "int?",
    GradePoint: "string?",
    semesterId: "string",
    uid: "string",
  },
};

export const SemesterSchema = {
  name: "Semester",
  primaryKey: "id",
  properties: {
    id: "string",
    name: "string",
    gpa: "float?",
    lastUpdated: "date?",
    uid: "string",
    courses: "Course[]",
  },
};
