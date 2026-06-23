export function clampYear(y, min = 2000, max = 2100) {
  return Math.min(max, Math.max(min, y));
}
export function isoYear(date) {
  var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3); // Thursday decides the year
  return t.getFullYear();
}

export function isoWeek(d) {
  var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3);
  var firstThu = t.valueOf();
  t.setMonth(0, 1);
  if (t.getDay() !== 4) {
    t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThu - t.valueOf()) / 604800000);
}

export function weeksInIsoYear(y) {
  return isoWeek(new Date(y, 11, 28));
}

export function mondayOf(week, year) {
  var jan4 = new Date(year, 0, 4);
  var j = (jan4.getDay() + 6) % 7;
  var firstMon = new Date(year, 0, 4 - j);
  var m = new Date(firstMon);
  m.setDate(firstMon.getDate() + (week - 1) * 7);
  return m;
}

// Simple short date formatter helper
export function dShort(d) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return d.getDate() + " " + months[d.getMonth()];
}
export var WD = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export var M_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export var M_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export function dWritten(d) {
  return d.getDate() + " " + M_FULL[d.getMonth()] + " " + d.getFullYear();
}
export function dFull(d) {
  return d.getDate() + " " + M_SHORT[d.getMonth()] + " " + d.getFullYear();
}

export function formatShort(date) {
  // console.log(date.getDate() + "." + (date.getMonth() + 1) + ".");
  return date.getDate() + "." + (date.getMonth() + 1) + ".";
}
export function formatLong(date) {
  return (
    date.getDate() +
    ". " +
    date.toLocaleString("default", { month: "long" }) +
    ", " +
    date.getFullYear()
  );
}
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getWeekdayName(date) {
  return WEEKDAYS[date.getDay()];
}
export function getDate(date) {
  return formatLong(date);
}
