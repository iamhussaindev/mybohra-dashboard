import { momentTime } from '@lib/utils'
import { DailyDuaWithLibrary } from '@type/dailyDua'
import { Miqaat } from '@type/miqaat'
import moment from 'moment'

import HijriDate from './HijriDate'

const MIN_CALENDAR_YEAR = 1000
const MAX_CALENDAR_YEAR = 3000

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// https://api.itsmedan.net/media/v1/album/daily-duas

export interface CalendarDay {
  date: HijriDate
  gregorian: moment.Moment
  isCurrentMonth: boolean
  isToday: boolean
  filler: boolean
  hasMiqaats: boolean
  miqaats?: Miqaat[]
  hasDailyDuas: boolean
  dailyDuas?: DailyDuaWithLibrary[]
}

export class Calendar {
  minYear: number = MIN_CALENDAR_YEAR
  maxYear: number = MAX_CALENDAR_YEAR
  month: number
  year: number
  iso8601 = false
  date: HijriDate
  miqaats: Miqaat[] = []
  dailyDuas: DailyDuaWithLibrary[] = []

  constructor({ year, month, iso8601, miqaats, dailyDuas }: { year?: number; month?: number; iso8601?: boolean; miqaats?: Miqaat[]; dailyDuas?: DailyDuaWithLibrary[] }) {
    const now = new HijriDate()
    this.year = year ?? now.year
    this.month = month ?? now.month
    this.iso8601 = iso8601 || false
    this.date = new HijriDate(year, month, 1)
    this.miqaats = miqaats ?? []
    this.dailyDuas = dailyDuas ?? []
  }

  dayOfWeek(day: number): number {
    this.date.day = day
    const offset = this.iso8601 ? 0.5 : 1.5
    return (this.date.toAJD() + offset) % 7
  }

  getToday: CalendarDay = {
    date: new HijriDate(),
    gregorian: momentTime(),
    isCurrentMonth: true,
    isToday: true,
    filler: false,
    hasMiqaats: false,
    hasDailyDuas: false,
  }

  days(): CalendarDay[] {
    const daysLength = this.date.daysInMonth()
    const array = Array.from({ length: daysLength }, (_, i) => i + 1).map(day => {
      const date = new HijriDate(this.year, this.month, day)

      const hasMiqaats = this.miqaats.some(miqaat => {
        const matches = miqaat.date === date.day && miqaat.month === date.month + 1
        if (matches) {
          console.log(`Found miqaat match: ${miqaat.name} on ${date.day}/${date.month}`)
        }
        return matches
      })

      const hasDailyDuas = this.dailyDuas.some(dailyDua => {
        const matches = dailyDua.date === date.day && dailyDua.month === date.month
        if (matches) {
          console.log(`Found daily dua match: ${dailyDua.library?.name} on ${date.day}/${date.month}`)
        }
        return matches
      })

      const gregorian = date.toGregorian()
      return {
        date,
        gregorian: moment(gregorian),
        isCurrentMonth: true,
        isToday: this.getToday.date.day === day && this.getToday.date.month === this.month && this.getToday.date.year === this.year,
        filler: false,
        hasMiqaats,
        miqaats: this.miqaats.filter(miqaat => miqaat.date === date.day && miqaat.month === date.month + 1),
        hasDailyDuas,
        dailyDuas: this.dailyDuas.filter(dailyDua => dailyDua.date === date.day && dailyDua.month === date.month),
      }
    })
    return array
  }

  previousMonth(): Calendar {
    const year = this.month === 0 && this.year > this.minYear ? this.year - 1 : this.year
    const month = this.month === 0 && this.year === this.minYear ? this.month : this.month === 0 ? 11 : this.month - 1

    return new Calendar({
      year,
      month,
      iso8601: this.iso8601,
      miqaats: this.miqaats,
      dailyDuas: this.dailyDuas,
    })
  }

  nextMonth(): Calendar {
    const year = this.month === 11 && this.year < this.maxYear ? this.year + 1 : this.year
    const month = this.month === 11 && this.year === this.maxYear ? this.month : this.month === 11 ? 0 : this.month + 1

    return new Calendar({
      year,
      month,
      iso8601: this.iso8601,
      miqaats: this.miqaats,
      dailyDuas: this.dailyDuas,
    })
  }

  previousDays(): CalendarDay[] {
    const previousMonth = this.previousMonth()

    if (this.month === 0 && this.year === this.minYear) {
      return []
    }

    const days = previousMonth.days()
    const filler = days.map(day => {
      day.filler = true
      day.isCurrentMonth = false
      return day
    })

    return filler.reverse().slice(0, this.dayOfWeek(1)).reverse()
  }

  nextDays(): CalendarDay[] {
    const nextMonth = this.nextMonth()
    if (this.month === 11 && this.year === this.maxYear) {
      return []
    }

    const days = nextMonth.days()
    const filler = days.map(day => {
      day.filler = true
      day.isCurrentMonth = false
      return day
    })

    return filler.slice(0, 6 - this.dayOfWeek(this.days().length))
  }

  getDays(): CalendarDay[] {
    return this.previousDays().concat(this.days(), this.nextDays())
  }

  getWeeks(): CalendarDay[][] {
    const days = this.getDays()

    const chunkSize = 7
    const weeks = []
    for (let i = 0; i < days.length; i += chunkSize) {
      const chunk = days.slice(i, i + chunkSize)
      weeks.push(chunk)
    }

    return weeks
  }

  previousYear(): Calendar {
    return new Calendar({
      year: this.year - 1,
      month: this.month,
      iso8601: this.iso8601,
      miqaats: this.miqaats,
      dailyDuas: this.dailyDuas,
    })
  }

  nextYear(): Calendar {
    return new Calendar({
      year: this.year + 1,
      month: this.month,
      iso8601: this.iso8601,
      miqaats: this.miqaats,
      dailyDuas: this.dailyDuas,
    })
  }

  get monthName(): string {
    return this.date.getMonthName()
  }

  get gregMonth(): string {
    const gregorianMonths = this.days().map(day => day.gregorian.format('MMMM'))
    const uniqueGregorianMonths = [...new Set(gregorianMonths)]

    const gregYears = this.days().map(day => day.gregorian.format('YYYY'))
    const uniqueGregorianYears = [...new Set(gregYears)]

    const m = uniqueGregorianMonths
    const y = uniqueGregorianYears

    if (uniqueGregorianYears.length > 1) {
      return `${m[0]} ${y[0]} / ${m[1]} ${y[1]}`
    } else if (uniqueGregorianMonths.length > 1) {
      return `${m[0]} / ${m[1]}  ${y[0]}`
    } else {
      return `${m[0]} ${y[0]}`
    }
  }
}
