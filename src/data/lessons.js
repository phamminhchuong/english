import rawLessons from "./lessons.json";

export const lessons = rawLessons;
export const categories = [...new Set(lessons.map((l) => l.level))];
export const levels = ["All", ...new Set(lessons.map((l) => l.level))];
