document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('weekly-grid');
    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const themeNames = ['green', 'purple', 'pink', 'yellow', 'blue', 'orange'];
    const fixedHolidays = ['01-01', '03-01', '05-01', '05-05', '06-06', '07-17', '08-15', '10-03', '10-09', '12-25'];
    const dynamicHolidays = ['2026-02-16', '2026-02-17', '2026-02-18', '2026-03-02', '2026-05-24', '2026-05-25', '2026-06-03', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-28'];
    const substituteHolidayExcluded = '06-06';
    const today = new Date();
    let monday = new Date(today);
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1);

    // 🌟 월/주와 무관하게 항상 같은 개수인 정적 반복 요소(게이지 12칸, 투두 17줄, 하단 4행×7칸)는
    // HTML에 나열하지 않고 여기서 한 번만 생성한다. .weekly-wrapper 전체를 그대로 clone해서
    // 인쇄 페이지를 만들기 때문에, 여기서 채워두면 인쇄용 페이지도 자동으로 같은 구조를 갖는다.
    fillGaugeSegments(document.querySelector('.month-gauge'));
    fillWeeklyTodoRows(document.querySelector('.weekly-todo-rows'));
    fillBottomBoxRows(document.querySelector('.weekly-bottom-box'));

    function fillGaugeSegments(gauge) {
        const marker = gauge.querySelector('.gauge-marker');
        for (let i = 0; i < 12; i += 1) {
            const segment = document.createElement('div');
            segment.className = 'gauge-segment';
            gauge.insertBefore(segment, marker);
        }
    }

    function fillWeeklyTodoRows(container) {
        for (let i = 1; i <= 17; i += 1) {
            const row = document.createElement('div');
            row.className = 'weekly-todo-row';

            const number = document.createElement('span');
            number.className = 'weekly-todo-row-number';
            number.textContent = String(i).padStart(2, '0');

            row.appendChild(number);
            container.appendChild(row);
        }
    }

    function fillBottomBoxRows(container) {
        const rowLabels = ['수면 | 실제 - 계획', '분류 | 실제 - 계획', '분류 | 실제 - 계획', '분류 | 실제 - 계획'];

        rowLabels.forEach(label => {
            const row = document.createElement('div');
            row.className = 'weekly-bottom-row';

            const prefix = document.createElement('div');
            prefix.className = 'weekly-bottom-prefix';
            prefix.textContent = label;

            const columns = document.createElement('div');
            columns.className = 'weekly-bottom-columns';
            for (let i = 0; i < 7; i += 1) {
                const cell = document.createElement('div');
                cell.className = 'weekly-bottom-cell';
                columns.appendChild(cell);
            }

            row.appendChild(prefix);
            row.appendChild(columns);
            container.appendChild(row);
        });
    }

    // 🌟 한 주(weekStart)의 월~일 7개 day-column을 container 안에 렌더링
    // 화면용 renderWeek()과 인쇄용 populatePrintPage()가 이 함수 하나를 공유한다
    function renderWeekDays(container, weekStart) {
        container.innerHTML = '';
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

            container.appendChild(column);
        });
    }

    function updateGauge(root, monthIndex) {
        root.querySelectorAll('.gauge-segment').forEach((segment, index) => {
            segment.classList.toggle('is-filled', index <= monthIndex);
        });
        root.querySelector('.month-gauge').style.setProperty('--gauge-progress', `${((monthIndex + 1) / 12) * 100}%`);
    }

    function updateHeaderText(root, weekStart) {
        root.querySelector('#week-title').textContent = `${weekStart.getFullYear()} ${monthNames[weekStart.getMonth()]}`;
        root.querySelector('#week-range').textContent = `${formatDate(weekStart)} - ${formatDate(addDays(weekStart, 6))}`;
        root.querySelector('#week-number').textContent = getWeekNumber(weekStart);
    }

    function renderWeek() {
        document.body.className = `theme-${themeNames[monday.getMonth() % themeNames.length]}`;
        updateHeaderText(document, monday);
        updateGauge(document, monday.getMonth());
        renderWeekDays(grid, monday);
    }

    renderWeek();

    // 🌟 화면용 정렬과 인쇄 페이지별 정렬이 동일한 계산을 공유하도록 root를 인자로 받는다
    function alignGridToMonthTitle(root) {
        const monthTitle = root.querySelector('#week-title');
        const titleEnd = monthTitle.offsetLeft + monthTitle.offsetWidth;
        const todoWidth = Math.max(0, titleEnd - parseFloat(getComputedStyle(monthTitle).fontSize));
        root.querySelector('#weekly-stage').style.setProperty('--month-title-end', `${todoWidth}px`);
        const weeklyGrid = root.querySelector('#weekly-grid');
        const header = root.querySelector('.weekly-header');
        const mondayColumn = weeklyGrid.querySelector('.day-column');
        const weeklyGridLeft = mondayColumn.getBoundingClientRect().left - header.getBoundingClientRect().left;
        const gauge = root.querySelector('.month-gauge');
        gauge.style.setProperty('--weekly-grid-left', `${weeklyGridLeft}px`);
        gauge.style.setProperty('--weekly-column-width', `${weeklyGrid.clientWidth / 7}px`);
    }

    alignGridToMonthTitle(document);
    if (document.fonts) document.fonts.ready.then(() => alignGridToMonthTitle(document));
    window.addEventListener('resize', () => alignGridToMonthTitle(document));

    document.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        monday = addDays(monday, event.key === 'ArrowLeft' ? -7 : 7);
        renderWeek();
        alignGridToMonthTitle(document);
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
            alignGridToMonthTitle(page);
            page.style.display = ''; // 계산이 끝난 후 다시 원래 상태로 복구
        });

        // 래퍼 컨테이너 속성 복구
        printPages.style.display = '';
        printPages.style.visibility = '';
        printPages.style.position = '';
    }

    function populatePrintPage(page, weekStart) {
        const month = weekStart.getMonth();
        page.classList.add(`theme-${themeNames[month % themeNames.length]}`);
        // 인쇄 페이지마다 서로 다른 달의 테마를 element 단위로 갖기 때문에,
        // color 상속 지점을 body가 아니라 이 페이지 자신으로 다시 고정해줘야 한다.
        page.style.color = 'var(--line-color)';

        updateHeaderText(page, weekStart);
        updateGauge(page, month);
        renderWeekDays(page.querySelector('#weekly-grid'), weekStart);
    }

    createPrintWeeks();
});
