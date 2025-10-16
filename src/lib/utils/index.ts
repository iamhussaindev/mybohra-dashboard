import { clsx, type ClassValue } from 'clsx'
import moment from 'moment'
import { twMerge } from 'tailwind-merge'

const date = () => moment().toDate() // .set("hour", 22).set("minute", 55).add(-1, "day")

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const currentTime = () => new Date(date())
export const momentTime = (currentDate?: Date) => moment(currentDate ?? new Date(date()))
