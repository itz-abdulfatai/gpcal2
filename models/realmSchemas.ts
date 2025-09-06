export const CourseSchema = {
  name: "Course",
  primaryKey: "id",
  properties: {
    id: "objectId",
    name: "string",
    creditUnit: "int?",
    gradePoint: "string?",
    semesterId: "string",
    semester: "Semester",
    uid: "string",
  },
};

export const SemesterSchema = {
  name: "Semester",
  primaryKey: "id",
  properties: {
    id: "objectId",
    name: "string",
    gpa: "double?",
    lastUpdated: "date?",
    uid: "string",
    courses: "Course[]",
  },
};
