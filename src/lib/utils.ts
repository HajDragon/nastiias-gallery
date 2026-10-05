// ponytail: plain join is enough for the two class strings we pass today;
// swap for `twMerge(clsx(...))` (clsx + tailwind-merge) once classes conflict
export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ")
}
