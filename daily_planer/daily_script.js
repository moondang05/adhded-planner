document.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('daily-stage');
    const dayTitle = document.getElementById('day-title');
    const moodCircles = document.getElementById('mood-circles'); // 🌟 무드 서클

    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    const fixedHolidays = ['01-01', '03-01', '05-01', '05-05', '06-06', '07-17', '08-15', '10-03', '10-09', '12-25'];
    const dynamicHolidays = ['2026-02-16', '2026-02-17', '2026-02-18', '2026-03-02', '2026-05-24', '2026-05-25', '2026-06-03', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-28'];
    const substituteHolidayExcluded = '06-06';

    const today = new Date();
    let currentMonday = new Date(today);
    const currentDayOfWeek = currentMonday.getDay() || 7;

    currentMonday.setDate(currentMonday.getDate() - currentDayOfWeek + 1);
    currentMonday.setHours(0, 0, 0, 0);

    let viewIndex = (currentDayOfWeek >= 1 && currentDayOfWeek <= 4) ? 0 : 1;

    function renderDays() {
        dayTitle.textContent = `WEEK ${getWeekNumber(currentMonday)}`;

        const themeColors = ['green', 'purple', 'pink', 'yellow', 'blue', 'orange'];
        document.body.className = `theme-${themeColors[currentMonday.getMonth() % 6]}`;

        stage.innerHTML = '';
        moodCircles.innerHTML = ''; // 🌟 렌더링 시 기존 무드 서클 초기화

        const startOffset = viewIndex === 0 ? 0 : 4;
        const dayCount = viewIndex === 0 ? 4 : 3;

        // 🌟 1. 페이지 날짜 수(4개 or 3개)만큼 DAILY MOOD 점선 원 생성
        for (let i = 0; i < dayCount; i++) {
            const circle = document.createElement('div');
            circle.className = 'mood-circle';
            moodCircles.appendChild(circle);
        }

        // 🌟 2. 요일별 메인 플래너 박스 렌더링
        for (let i = 0; i < dayCount; i++) {
            const targetDate = new Date(currentMonday);
            targetDate.setDate(currentMonday.getDate() + startOffset + i);

            const month = monthNames[targetDate.getMonth()];
            const dateNum = targetDate.getDate();
            const dayName = dayNames[startOffset + i];

            const wrapper = document.createElement('div');
            wrapper.className = 'day-wrapper';

            const dateDiv = document.createElement('div');
            if (isHoliday(targetDate)) {
                dateDiv.className = 'date highlight-date';
            } else {
                dateDiv.className = 'date';
            }
            dateDiv.innerHTML = `<span>${month}</span><span>${dateNum}</span><span>${dayName}</span>`;

            const todoDiv = document.createElement('div');
            todoDiv.className = 'daily-todo';

            const todoTitle = document.createElement('div');
            todoTitle.className = 'daily-todo-title';
            todoTitle.innerHTML = `<span>시작시간</span><a href="#">할 일</a><p>소요시간/성취도</p>`;
            todoDiv.appendChild(todoTitle);

            const todoRows = document.createElement('div');
            todoRows.className = 'daily-todo-rows';

            for (let r = 0; r < 9; r++) {
                const row = document.createElement('div');
                row.className = 'daily-todo-row';

                const colStart = document.createElement('div');
                colStart.className = 'row-col-start';
                const colTask = document.createElement('div');
                colTask.className = 'row-col-task';
                const colTime = document.createElement('div');
                colTime.className = 'row-col-time';

                row.appendChild(colStart);
                row.appendChild(colTask);
                row.appendChild(colTime);
                todoRows.appendChild(row);
            }
            todoDiv.appendChild(todoRows);

            wrapper.appendChild(dateDiv);
            wrapper.appendChild(todoDiv);
            stage.appendChild(wrapper);
        }

        // 🌟 3. 금~일(viewIndex 1)일 때 4번째 칸에 미처 못 끝낸 일 / 자유 공간 박스 추가
        if (viewIndex === 1) {
            const extraWrapper = document.createElement('div');
            extraWrapper.className = 'day-wrapper';

            const extraBox = document.createElement('div');
            extraBox.className = 'extra-box';

            const extraTitle = document.createElement('div');
            extraTitle.className = 'extra-box-title';
            extraTitle.innerHTML = `<span>미처 못 끝낸 일</span><span>자유 공간</span>`;
            extraBox.appendChild(extraTitle);

            const extraContent = document.createElement('div');
            extraContent.className = 'extra-box-content';

            const colLeft = document.createElement('div');
            colLeft.className = 'extra-col-left'; // 중앙 세로 점선

            const colRight = document.createElement('div');
            colRight.className = 'extra-col-right'; // 오른쪽 빈 공간

            extraContent.appendChild(colLeft);
            extraContent.appendChild(colRight);

            extraBox.appendChild(extraContent);
            extraWrapper.appendChild(extraBox);
            stage.appendChild(extraWrapper);
        }
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
            // 1장: 월~목 생성
            const page1 = original.cloneNode(true);
            page1.classList.add('print-page');
            populatePrintDaily(page1, weekStart, 0);
            printPages.appendChild(page1);

            // 2장: 금~일 생성
            const page2 = original.cloneNode(true);
            page2.classList.add('print-page');
            populatePrintDaily(page2, weekStart, 1);
            printPages.appendChild(page2);
        }

        document.body.classList.add('print-all-days');
        document.body.className = 'print-all-days'; // 기존 단일 테마 제거
        document.body.appendChild(printPages);

        
    }

    // 인쇄용 페이지 내부를 그리는 함수
    function populatePrintDaily(page, weekStart, viewIndex) {
        const themeColors = ['green', 'purple', 'pink', 'yellow', 'blue', 'orange'];
        const month = weekStart.getMonth();
        page.classList.add(`theme-${themeColors[month % 6]}`);

        page.querySelector('#day-title').textContent = `WEEK ${getWeekNumber(weekStart)}`;

        const moodCircles = page.querySelector('.mood-circles');
        moodCircles.innerHTML = '';
        const stage = page.querySelector('.daily-stage');
        stage.innerHTML = '';

        const startOffset = viewIndex === 0 ? 0 : 4;
        const dayCount = viewIndex === 0 ? 4 : 3;

        // 무드 서클
        for (let i = 0; i < dayCount; i++) {
            const circle = document.createElement('div');
            circle.className = 'mood-circle';
            moodCircles.appendChild(circle);
        }

        // 데일리 박스
        for (let i = 0; i < dayCount; i++) {
            const targetDate = new Date(weekStart);
            targetDate.setDate(weekStart.getDate() + startOffset + i);

            const wrapper = document.createElement('div');
            wrapper.className = 'day-wrapper';

            const dateDiv = document.createElement('div');
            dateDiv.className = isHoliday(targetDate) ? 'date highlight-date' : 'date';
            dateDiv.innerHTML = `<span>${monthNames[targetDate.getMonth()]}</span><span>${targetDate.getDate()}</span><span>${dayNames[startOffset + i]}</span>`;

            // innerHTML로 빠르고 깔끔하게 9줄 생성
            const todoDiv = document.createElement('div');
            todoDiv.className = 'daily-todo';
            todoDiv.innerHTML = `
                <div class="daily-todo-title"><span>시작시간</span><a href="#">할 일</a><p>소요시간/성취도</p></div>
                <div class="daily-todo-rows">
                    ${Array(9).fill().map(() => `
                        <div class="daily-todo-row"><div class="row-col-start"></div><div class="row-col-task"></div><div class="row-col-time"></div></div>
                    `).join('')}
                </div>
            `;

            wrapper.appendChild(dateDiv);
            wrapper.appendChild(todoDiv);
            stage.appendChild(wrapper);
        }

        // 금~일 페이지의 엑스트라 박스
        if (viewIndex === 1) {
            const extraWrapper = document.createElement('div');
            extraWrapper.className = 'day-wrapper';
            extraWrapper.innerHTML = `
                <div class="extra-box">
                    <div class="extra-box-title"><span>미처 못 끝낸 일</span><span>자유 공간</span></div>
                    <div class="extra-box-content">
                        <div class="extra-col-left"></div>
                        <div class="extra-col-right"></div>
                    </div>
                </div>
            `;
            stage.appendChild(extraWrapper);
        }
    }

    createPrintDays();
});