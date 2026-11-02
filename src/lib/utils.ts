import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
export const formatDate = (date: Date) => dateFormat.format(date);
