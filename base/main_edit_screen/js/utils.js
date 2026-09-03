// 날짜 이동 및 주차수 계산 함수, 휴일 판별 함수(대체공휴일 및 주말 포함)

export function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

export function getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);
}

// data = Holidays
export function isHoliday(date, data) {
    const dateKey = toDateKey(date);
    const fixedKey = toFixedKey(date);
    const previousDate = addDays(date, -1);
    const previousSaturday = addDays(date, -2);
    const previousFixedKey = toFixedKey(previousDate);
    const previousSaturdayKey = toFixedKey(previousSaturday);
    const isWeekendHoliday = data.fixed.includes(fixedKey) && fixedKey !== data.Excluded && date.getDay() >= 6;
    const isSubstituteHoliday = date.getDay() === 1 && (
        (data.fixed.includes(previousFixedKey) && previousFixedKey !== data.Excluded && previousDate.getDay() >= 6) ||
        (data.fixed.includes(previousSaturdayKey) && previousSaturdayKey !== data.Excluded && previousSaturday.getDay() === 6)
    );

    return date.getDay() === 0 || data.fixed.includes(fixedKey) || data.dynamic.includes(dateKey) || isWeekendHoliday || isSubstituteHoliday;
}


// 문자열 -> 날짜형 포멧팅
        // 0000-00-00(년, 월, 일) 형태로 변환
export function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
        // 00-00(월, 일) 형태로 변환
export function toFixedKey(date) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

        // weekly.js에서 사용되는 월-일(숫자 형태) 반환 함수
export function formatDate(date) {
    return `${date.getMonth() + 1}-${date.getDate()}`;
}

// json값 반환

// data = Calendar.month
export function toMonthName(date, data) {
    return data[date.getMonth()];
}

// data = Calendar.days
export function toDayName(date, data) {
    return data[(date.getDate() + 6) % 7];
}



// 필요한 함수들 : 컬러 테마 키 반환, 인용문 반환, 출력물 저장 함수, 키보드 좌우 방향키 조작 시 날짜 이동