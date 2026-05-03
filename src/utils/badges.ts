import type { HttpMethod } from "../types/openapi";

const METHOD_CLASSES: Record<HttpMethod | string, { bg: string; text: string }> = {
  get:     { bg: "bg-blue-50 dark:bg-blue-900/30",    text: "text-blue-700 dark:text-blue-400" },
  post:    { bg: "bg-green-50 dark:bg-green-900/30",  text: "text-green-700 dark:text-green-400" },
  put:     { bg: "bg-amber-50 dark:bg-amber-900/30",  text: "text-amber-700 dark:text-amber-400" },
  delete:  { bg: "bg-red-50 dark:bg-red-900/30",      text: "text-red-700 dark:text-red-400" },
  patch:   { bg: "bg-pink-50 dark:bg-pink-900/30",    text: "text-pink-700 dark:text-pink-400" },
  options: { bg: "bg-gray-100 dark:bg-gray-700",      text: "text-gray-600 dark:text-gray-400" },
  head:    { bg: "bg-gray-100 dark:bg-gray-700",      text: "text-gray-600 dark:text-gray-400" },
};

export function methodBadgeClasses(method: string): string {
  const c = METHOD_CLASSES[method.toLowerCase()] ?? METHOD_CLASSES.get;
  return `${c.bg} ${c.text}`;
}