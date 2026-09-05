// 날짜 이동, 주차 계산, 날짜 문자열 포맷팅 등 순수 날짜 계산 함수 모음

export function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

// date가 속한 주(월~일)의 월요일 00:00:00 반환
export function getMondayOf(date) {
    const result = new Date(date);
    const day = result.getDay() || 7; // 1=월 ... 7=일
    result.setDate(result.getDate() - day + 1);
    result.setHours(0, 0, 0, 0);
    return result;
}

export function getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);
}

// 0000-00-00(년-월-일) 형태로 변환
export function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 00-00(월-일) 형태로 변환
export function toFixedKey(date) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// weekly 화면 등에서 사용되는 월-일(숫자 형태) 반환 함수
export function formatDate(date) {
    return `${date.getMonth() + 1}-${date.getDate()}`;
}

// data = calendar.json의 month 배열
export function toMonthName(date, data) {
    return data[date.getMonth()];
}

// data = calendar.json의 days 배열
export function toDayName(date, data) {
    return data[(date.getDay() + 6) % 7];
}
