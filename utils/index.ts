import { CourseType } from "@/types";

export const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

export const gradeScale: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export const formatCoursesForDonut = (courses: CourseType[]) => {
  console.log("formatCoursesForDonut");

  return courses.map((course) => {
    const gradeValue = gradeScale[course.GradePoint!] ?? 0;
    const weightedValue = course.creditUnit! * gradeValue;

    return {
      value: weightedValue,
      color: getRandomColor(),
      text: `${course.name}`, // can be course.name, GradePoint, or whatever
    };
  });
};
