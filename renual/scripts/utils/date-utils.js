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

// 한 주가 두 달에 걸칠 때(1일이 포함된 주) 테마/월 표시 기준이 되는 날짜를 고른다.
// 월요일이 속한 달을 그대로 쓰는 monthly와 달리, 주 안의 7일 중 일(day-of-month) 값이 가장 작은 날짜를 고르면
// 새로 시작하는 달(1, 2, 3...)이 이전 달의 말일(28~31)보다 항상 작으므로 자연히 뒤쪽 달이 선택된다.
// 한 달 안에서만 이루어진 주는 월요일과 같은 달이 그대로 남는다.
export function getWeekThemeDate(monday) {
    let result = monday;
    for (let i = 1; i < 7; i += 1) {
        const candidate = addDays(monday, i);
        if (candidate.getDate() < result.getDate()) result = candidate;
    }
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
