// holidays.json 데이터를 기준으로 한 휴일 판별 함수 (대체공휴일 및 주말 포함)
import { addDays, toDateKey, toFixedKey } from './date-utils.js';

// data = holidays.json
export function isHoliday(date, data) {
    const dateKey = toDateKey(date);
    const fixedKey = toFixedKey(date);
    const previousDate = addDays(date, -1);
    const previousSaturday = addDays(date, -2);
    const previousFixedKey = toFixedKey(previousDate);
    const previousSaturdayKey = toFixedKey(previousSaturday);
    const isWeekendHoliday = data.fixed.includes(fixedKey) && !data.Excluded.includes(fixedKey) && date.getDay() >= 6;
    const isSubstituteHoliday = date.getDay() === 1 && (
        (data.fixed.includes(previousFixedKey) && !data.Excluded.includes(previousFixedKey) && previousDate.getDay() >= 6) ||
        (data.fixed.includes(previousSaturdayKey) && !data.Excluded.includes(previousSaturdayKey) && previousSaturday.getDay() === 6)
    );

    return date.getDay() === 0 || data.fixed.includes(fixedKey) || data.dynamic.includes(dateKey) || isWeekendHoliday || isSubstituteHoliday;
}
