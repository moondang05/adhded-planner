document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('daily-stage');
    const dayTitle = document.getElementById('day-title');
    const moodCircles = document.getElementById('mood-circles'); // 🌟 무드 서클

    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const themeColors = ['green', 'purple', 'pink', 'yellow', 'blue', 'orange'];

    const fixedHolidays = ['01-01', '03-01', '05-01', '05-05', '06-06', '07-17', '08-15', '10-03', '10-09', '12-25'];
    const dynamicHolidays = ['2026-02-16', '2026-02-17', '2026-02-18', '2026-03-02', '2026-05-24', '2026-05-25', '2026-06-03', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-28'];
    const substituteHolidayExcluded = '06-06';

    const today = new Date();
    let currentMonday = new Date(today);
    const currentDayOfWeek = currentMonday.getDay() || 7;

    currentMonday.setDate(currentMonday.getDate() - currentDayOfWeek + 1);
    currentMonday.setHours(0, 0, 0, 0);

    let viewIndex = (currentDayOfWeek >= 1 && currentDayOfWeek <= 4) ? 0 : 1;

    // 🌟 요일 하나 분(날짜 칸 + 시간표 칸)의 day-wrapper 생성
    // 화면 렌더링과 인쇄용 렌더링이 동일한 구조를 필요로 하므로 공통 함수로 분리
    function createDayWrapper(targetDate, dayName) {
        const wrapper = document.createElement('div');
        wrapper.className = 'day-wrapper';

        const dateDiv = document.createElement('div');
        dateDiv.className = isHoliday(targetDate) ? 'date highlight-date' : 'date';
        dateDiv.innerHTML = `<span>${monthNames[targetDate.getMonth()]}</span><span>${targetDate.getDate()}</span><span>${dayName}</span>`;

        const todoDiv = document.createElement('div');
        todoDiv.className = 'daily-todo';
        todoDiv.innerHTML = `
            <div class="daily-todo-title"><span class="daily-todo-title-cell">시작시간</span><a class="daily-todo-title-cell" href="#">할 일</a><p class="daily-todo-title-cell">소요시간/성취도</p></div>
            <div class="daily-todo-rows">
                ${Array.from({ length: 9 }, () => `
                    <div class="daily-todo-row"><div class="row-col-start"></div><div class="row-col-task"></div><div class="row-col-time"></div></div>
                `).join('')}
            </div>
        `;

        wrapper.appendChild(dateDiv);
        wrapper.appendChild(todoDiv);
        return wrapper;
    }

    // 🌟 금~일(viewIndex 1) 4번째 칸: 미처 못 끝낸 일 / 자유 공간 박스
    function createExtraWrapper() {
        const extraWrapper = document.createElement('div');
        extraWrapper.className = 'day-wrapper';
        extraWrapper.innerHTML = `
            <div class="extra-box">
                <div class="extra-box-title"><span class="extra-box-title-cell">미처 못 끝낸 일</span><span class="extra-box-title-cell">자유 공간</span></div>
                <div class="extra-box-content">
                    <div class="extra-col-left"></div>
                    <div class="extra-col-right"></div>
                </div>
            </div>
        `;
        return extraWrapper;
    }

    function renderMoodCircles(container, count) {
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const circle = document.createElement('div');
            circle.className = 'mood-circle';
            container.appendChild(circle);
        }
    }

    // 🌟 한 주(weekStart)의 월~목 또는 금~일 뷰를 targetStage/targetMoodCircles 안에 렌더링
    // 화면용 renderDays()와 인쇄용 createPrintPage()가 이 함수 하나를 공유한다
    function renderWeekView(weekStart, index, targetStage, targetMoodCircles) {
        const startOffset = index === 0 ? 0 : 4;
        const dayCount = index === 0 ? 4 : 3;

        renderMoodCircles(targetMoodCircles, dayCount);

        targetStage.innerHTML = '';
        for (let i = 0; i < dayCount; i++) {
            const targetDate = new Date(weekStart);
            targetDate.setDate(weekStart.getDate() + startOffset + i);
            targetStage.appendChild(createDayWrapper(targetDate, dayNames[startOffset + i]));
        }

        if (index === 1) {
            targetStage.appendChild(createExtraWrapper());
        }
    }

    function renderDays() {
        dayTitle.textContent = `WEEK ${getWeekNumber(currentMonday)}`;
        document.body.className = `theme-${themeColors[currentMonday.getMonth() % 6]}`;
        renderWeekView(currentMonday, viewIndex, stage, moodCircles);
    }

    renderDays();

    document.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();

        if (event.key === 'ArrowLeft') {
            if (viewIndex === 1) {
                viewIndex = 0;
            } else {
                currentMonday.setDate(currentMonday.getDate() - 7);
                viewIndex = 1;
            }
        } else if (event.key === 'ArrowRight') {
            if (viewIndex === 0) {
                viewIndex = 1;
            } else {
                currentMonday.setDate(currentMonday.getDate() + 7);
                viewIndex = 0;
            }
        }
        renderDays();
    });

    function getWeekNumber(date) {
        const firstDay = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);
    }

    function addDays(date, amount) {
        const result = new Date(date);
        result.setDate(result.getDate() + amount);
        return result;
    }

    function isHoliday(date) {
        const dateKey = toDateKey(date);
        const fixedKey = toFixedKey(date);
        const previousDate = addDays(date, -1);
        const previousSaturday = addDays(date, -2);
        const previousFixedKey = toFixedKey(previousDate);
        const previousSaturdayKey = toFixedKey(previousSaturday);

        const isWeekendHoliday = fixedHolidays.includes(fixedKey) && fixedKey !== substituteHolidayExcluded && date.getDay() >= 6;
        const isSubstituteHoliday = date.getDay() === 1 && (
            (fixedHolidays.includes(previousFixedKey) && previousFixedKey !== substituteHolidayExcluded && previousDate.getDay() >= 6) ||
            (fixedHolidays.includes(previousSaturdayKey) && previousSaturdayKey !== substituteHolidayExcluded && previousSaturday.getDay() === 6)
        );

        return date.getDay() === 0 || fixedHolidays.includes(fixedKey) || dynamicHolidays.includes(dateKey) || isWeekendHoliday || isSubstituteHoliday;
    }

    function toDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function toFixedKey(date) {
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }


    // 🌟 31~53주차 대량 생성 함수
    function createPrintDays() {
        if (new URLSearchParams(window.location.search).get('print') !== 'days') return;

        const original = document.querySelector('.daily-wrapper');
        const printPages = document.createElement('div');
        printPages.className = 'print-pages';

        // 31주차(2026-07-27) ~ 53주차(2026-12-28) 설정
        const firstMonday = new Date(2026, 6, 27);
        const lastMonday = new Date(2026, 11, 28);

        for (let weekStart = new Date(firstMonday); weekStart <= lastMonday; weekStart = addDays(weekStart, 7)) {
            // 1장: 월~목, 2장: 금~일
            printPages.appendChild(createPrintPage(original, weekStart, 0));
            printPages.appendChild(createPrintPage(original, weekStart, 1));
        }

        document.body.className = 'print-all-days'; // 기존 단일 테마 제거
        document.body.appendChild(printPages);
    }

    // 인쇄용 페이지 한 장을 만드는 함수 (renderWeekView를 그대로 재사용)
    function createPrintPage(original, weekStart, index) {
        const page = original.cloneNode(true);
        page.classList.add('print-page');
        page.classList.add(`theme-${themeColors[weekStart.getMonth() % 6]}`);
        page.querySelector('#day-title').textContent = `WEEK ${getWeekNumber(weekStart)}`;

        renderWeekView(weekStart, index, page.querySelector('.daily-stage'), page.querySelector('.mood-circles'));

        return page;
    }

    createPrintDays();
});
