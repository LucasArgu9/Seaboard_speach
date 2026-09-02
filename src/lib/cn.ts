import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** className merge helper: clsx para condicionales + tailwind-merge para conflictos. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
