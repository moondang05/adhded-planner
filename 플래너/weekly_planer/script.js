document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('weekly-grid');
    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const fixedHolidays = ['01-01', '03-01', '05-01', '05-05', '06-06', '07-17', '08-15', '10-03', '10-09', '12-25'];
    const dynamicHolidays = ['2026-02-16', '2026-02-17', '2026-02-18', '2026-03-02', '2026-05-24', '2026-05-25', '2026-06-03', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-28'];
    const substituteHolidayExcluded = '06-06';
    const today = new Date();
    let monday = new Date(today);
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1);
    function renderWeek() {
        grid.innerHTML = '';
        document.getElementById('week-title').textContent = `${monday.getFullYear()} ${monthNames[monday.getMonth()]}`;

        document.body.className = `theme-${['green', 'purple', 'pink', 'yellow', 'blue', 'orange'][monday.getMonth() % 6]}`;
        document.getElementById('week-range').textContent = `${formatDate(monday)} - ${formatDate(addDays(monday, 6))}`;
        document.getElementById('week-number').textContent = getWeekNumber(monday);
        const gaugeSegments = document.querySelectorAll('.gauge-segment');
        gaugeSegments.forEach((segment, index) => {
            segment.classList.toggle('is-filled', index <= monday.getMonth());
        });
        document.getElementById('month-gauge').style.setProperty('--gauge-progress', `${((monday.getMonth() + 1) / 12) * 100}%`);

        dayNames.forEach((name, index) => {
            const date = addDays(monday, index);
            const column = document.createElement('article');
            column.className = 'day-column';

            const heading = document.createElement('div');
            heading.className = 'day-heading';
            const dayLabel = document.createElement('span');
            dayLabel.textContent = name;
            const dateLabel = document.createElement('span');
            dateLabel.className = 'day-date';
            dateLabel.textContent = date.getDate();
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const fixedKey = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (isHoliday(date)) {
                dateLabel.classList.add('highlight-date');
            }
            heading.append(dayLabel, dateLabel);
            column.appendChild(heading);

            for (let row = 0; row < 17; row += 1) {
                const body = document.createElement('div');
                body.className = 'day-body';
                column.appendChild(body);
            }

            grid.appendChild(column);
        });
    }

    renderWeek();

    const alignGridToMonthTitle = () => {
        const monthTitle = document.getElementById('week-title');
        const titleEnd = monthTitle.offsetLeft + monthTitle.offsetWidth;
        const todoWidth = Math.max(0, titleEnd - parseFloat(getComputedStyle(monthTitle).fontSize));
        document.getElementById('weekly-stage').style.setProperty('--month-title-end', `${todoWidth}px`);
        const weeklyGrid = document.getElementById('weekly-grid');
        const header = document.querySelector('.weekly-header');
        const mondayColumn = weeklyGrid.querySelector('.day-column');
        const weeklyGridLeft = mondayColumn.getBoundingClientRect().left - header.getBoundingClientRect().left;
        const gauge = document.getElementById('month-gauge');
        const eyebrow = document.querySelector('.eyebrow');
        const headerRect = header.getBoundingClientRect();
        const eyebrowRect = eyebrow.getBoundingClientRect();
        const gaugeTop = eyebrowRect.bottom - headerRect.top + (2 * 96 / 25.4);
        gauge.style.setProperty('--weekly-grid-left', `${weeklyGridLeft}px`);
        gauge.style.setProperty('--weekly-gauge-top', `${gaugeTop}px`);
        document.getElementById('month-gauge').style.setProperty('--weekly-column-width', `${weeklyGrid.clientWidth / 7}px`);
    };

    alignGridToMonthTitle();
    if (document.fonts) document.fonts.ready.then(alignGridToMonthTitle);
    window.addEventListener('resize', alignGridToMonthTitle);

    document.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        monday = addDays(monday, event.key === 'ArrowLeft' ? -7 : 7);
        renderWeek();
        alignGridToMonthTitle();
    });

    function addDays(date, amount) {
        const result = new Date(date);
        result.setDate(result.getDate() + amount);
        return result;
    }

    function formatDate(date) {
        return `${date.getMonth() + 1}.${date.getDate()}`;
    }

    function getWeekNumber(date) {
        const firstDay = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);
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

    function createPrintWeeks() {
        if (new URLSearchParams(window.location.search).get('print') !== 'weeks') return;

        const original = document.querySelector('.weekly-wrapper');
        const printPages = document.createElement('div');
        printPages.className = 'print-pages';
        const firstMonday = new Date(2026, 6, 27);
        const lastMonday = new Date(2026, 11, 28);

        for (let weekStart = firstMonday; weekStart <= lastMonday; weekStart = addDays(weekStart, 7)) {
            const page = original.cloneNode(true);
            page.classList.add('print-page');
            populatePrintPage(page, weekStart);
            printPages.appendChild(page);
        }

        document.body.classList.add('print-all-weeks');
        document.body.appendChild(printPages);

        // 크기 계산을 위해 임시로 display 속성을 block으로 변경 (화면에 보이지 않도록 visibility 조절)
        printPages.style.display = 'block';
        printPages.style.visibility = 'hidden';
        printPages.style.position = 'absolute';

        printPages.querySelectorAll('.print-page').forEach(page => {
            page.style.display = 'block'; // 개별 페이지도 블록 요소로 변경

            const title = page.querySelector('#week-title');
            const stage = page.querySelector('#weekly-stage');
            
            // 1. 할 일 목록(Todo List) 너비 정확히 재계산 (offsetLeft 포함)
            const titleEnd = title.offsetLeft + title.offsetWidth;
            const fontSize = parseFloat(getComputedStyle(title).fontSize);
            const todoWidth = Math.max(0, titleEnd - fontSize);
            stage.style.setProperty('--month-title-end', `${todoWidth}px`);

            // 2. 게이지 바(Month Gauge) 위치 재계산
            const header = page.querySelector('.weekly-header');
            const mondayColumn = page.querySelector('.day-column');
            const weeklyGrid = page.querySelector('#weekly-grid');
            const gauge = page.querySelector('.month-gauge');
            const eyebrow = page.querySelector('.eyebrow');
            
            const weeklyGridLeft = mondayColumn.getBoundingClientRect().left - header.getBoundingClientRect().left;
            const headerRect = header.getBoundingClientRect();
            const eyebrowRect = eyebrow.getBoundingClientRect();
            const gaugeTop = eyebrowRect.bottom - headerRect.top + (2 * 96 / 25.4);
            
            gauge.style.setProperty('--weekly-grid-left', `${weeklyGridLeft}px`);
            gauge.style.setProperty('--weekly-gauge-top', `${gaugeTop}px`);
            gauge.style.setProperty('--weekly-column-width', `${weeklyGrid.clientWidth / 7}px`);

            // 계산이 끝난 후 다시 원래 상태로 복구
            page.style.display = ''; 
        });

        // 래퍼 컨테이너 속성 복구
        printPages.style.display = '';
        printPages.style.visibility = '';
        printPages.style.position = '';
    }

    function populatePrintPage(page, weekStart) {
        const year = weekStart.getFullYear();
        const month = weekStart.getMonth();
        const themeNames = ['green', 'purple', 'pink', 'yellow', 'blue', 'orange'];
        const themeValues = [
            ['#2D5A27', '#F4A261'], ['#6A4C93', '#E76F51'], ['#D90429', '#FFB703'],
            ['#C49428', '#2A9D8F'], ['#1D3557', '#E63946'], ['#F4A261', '#264653']
        ];
        const [lineColor, pointColor] = themeValues[month % themeValues.length];
        page.classList.add(`theme-${themeNames[month % themeNames.length]}`);
        page.style.setProperty('--line-color', lineColor);
        page.style.setProperty('--point-color', pointColor);

        page.style.color = 'var(--line-color)';
        
        page.querySelector('#week-title').textContent = `${year} ${monthNames[month]}`;
        page.querySelector('#week-range').textContent = `${formatDate(weekStart)} - ${formatDate(addDays(weekStart, 6))}`;
        page.querySelector('#week-number').textContent = getWeekNumber(weekStart);

        page.querySelectorAll('.gauge-segment').forEach((segment, index) => {
            segment.classList.toggle('is-filled', index <= month);
        });
        page.querySelector('.month-gauge').style.setProperty('--gauge-progress', `${((month + 1) / 12) * 100}%`);

        const pageGrid = page.querySelector('#weekly-grid');
        pageGrid.innerHTML = '';
        dayNames.forEach((name, index) => {
            const date = addDays(weekStart, index);
            const column = document.createElement('article');
            column.className = 'day-column';
            const heading = document.createElement('div');
            heading.className = 'day-heading';
            const dayLabel = document.createElement('span');
            dayLabel.textContent = name;
            const dateLabel = document.createElement('span');
            dateLabel.className = 'day-date';
            dateLabel.textContent = date.getDate();
            if (isHoliday(date)) dateLabel.classList.add('highlight-date');
            heading.append(dayLabel, dateLabel);
            column.appendChild(heading);
            for (let row = 0; row < 17; row += 1) {
                const body = document.createElement('div');
                body.className = 'day-body';
                column.appendChild(body);
            }
            pageGrid.appendChild(column);
        });
    }

    createPrintWeeks();
});
