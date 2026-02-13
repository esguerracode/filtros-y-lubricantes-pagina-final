import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function para combinar clases de Tailwind
 * Usa clsx para condicionales y twMerge para evitar conflictos
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
