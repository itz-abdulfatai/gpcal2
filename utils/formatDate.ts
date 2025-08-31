// utils/formatDate.js

/**
 * Format a Firebase Timestamp or date string into "Oct 26, 2023"
 * @param {any} dateInput - Firebase Timestamp, JS Date, or string
 * @returns {string} formatted date
 */
export const formatDate = (dateInput: Date) => {
  if (!dateInput) return "";

  let dateObj;

  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    dateObj = new Date(dateInput); // handles ISO strings or timestamp numbers
  }

  if (isNaN(dateObj.getTime())) {
    return ""; // invalid date
  }

  return dateObj.toLocaleDateString("en-US", {
    month: "short", // "Oct"
    day: "numeric", // 26
    year: "numeric", // 2023
  });
};
// if i have firebase installed
// export const formatDate = (dateInput: Date | Timestamp) => {
//   if (!dateInput) return "";

//   let dateObj;

//   // Handle Firebase Timestamp (has toDate method)
//   if (dateInput.toDate) {
//     dateObj = dateInput.toDate();
//   } else if (typeof dateInput === "string" || typeof dateInput === "number") {
//     dateObj = new Date(dateInput);
//   } else if (dateInput instanceof Date) {
//     dateObj = dateInput;
//   } else {
//     return "";
//   }

//   return dateObj.toLocaleDateString("en-US", {
//     month: "short", // Oct
//     day: "numeric", // 26
//     year: "numeric", // 2023
//   });
// };
