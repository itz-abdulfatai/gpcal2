export const CourseSchema = {
  name: "Course",
  primaryKey: "id",
  properties: {
    id: "uuid",
    name: "string",
    creditUnit: "int?",
    gradePoint: "string?",
    semesterId: "uuid",
    semester: "Semester",
    uid: "string",
  },
};


export const AiInsightSchema = {
  name: "AiInsight",
  embedded: true,
  properties: {
    reply: "string",
    suggested_improvement: "string?",
  },
};

export const SemesterSchema = {
  name: "Semester",
  primaryKey: "id",
  properties: {
    id: "uuid",
    name: "string",
    gpa: "double?",
    lastUpdated: "date?",
    uid: "string",
    courses: "Course[]",
    linkedSemesters: "uuid[]",
    gradingSystem: "string",
    aiInsight: "AiInsight?",
  },
};
