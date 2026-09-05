// 주간(Weekly) 뷰 렌더링
import { isHoliday } from '../utils/holiday-utils.js';
import { addDays, formatDate, getWeekNumber, getWeekThemeDate } from '../utils/date-utils.js';

function fillGaugeSegments(gauge) {
    const marker = gauge.querySelector('.gauge-marker');
    for (let i = 0; i < 12; i += 1) {
        const segment = document.createElement('div');
        segment.className = 'gauge-segment';
        gauge.insertBefore(segment, marker);
    }
}

function fillWeeklyTodoRows(container) {
    for (let i = 1; i <= 10; i += 1) {
        const row = document.createElement('div');
        row.className = 'weekly-todo-row';

        const number = document.createElement('span');
        number.className = 'weekly-todo-row-number';
        number.textContent = String(i).padStart(2, '0');

        row.appendChild(number);
        container.appendChild(row);
    }
}

function fillHabitTrackerRows(container) {
    for (let i = 1; i <= 5; i += 1) {
        const row = document.createElement('div');
        row.className = 'habit-tracker-row';

        const number = document.createElement('span');
        number.className = 'habit-tracker-row-number';
        number.textContent = String(i).padStart(2, '0');

        row.appendChild(number);
        container.appendChild(row);
    }
}

// Habit Tracker 옆 그리드: weekly-grid와 동일한 day-column/day-body를 재사용하되
// 요일 헤더 없이 5개 행만 채운다 (헤더는 위쪽 weekly-grid와 겹치므로 생략)
function fillHabitGrid(grid) {
    grid.innerHTML = '';
    for (let day = 0; day < 7; day += 1) {
        const column = document.createElement('div');
        column.className = 'day-column habit-day-column';

        for (let row = 0; row < 5; row += 1) {
            const body = document.createElement('div');
            body.className = 'day-body';
            column.appendChild(body);
        }

        grid.appendChild(column);
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

// 한 주(weekStart)의 월~일 7개 day-column을 grid 안에 렌더링
function renderWeekDays(grid, weekStart, dayNames, Holidays) {
    grid.innerHTML = '';
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
        if (isHoliday(date, Holidays)) dateLabel.classList.add('highlight-date');
        heading.append(dayLabel, dateLabel);
        column.appendChild(heading);

        for (let row = 0; row < 10; row += 1) {
            const body = document.createElement('div');
            body.className = 'day-body';
            column.appendChild(body);
        }

        grid.appendChild(column);
    });
}

function updateGauge(wrapper, monthIndex) {
    wrapper.querySelectorAll('.gauge-segment').forEach((segment, index) => {
        segment.classList.toggle('is-filled', index <= monthIndex);
    });
    wrapper.querySelector('.month-gauge').style.setProperty('--gauge-progress', `${((monthIndex + 1) / 12) * 100}%`);
}

// offsetLeft 체인을 직접 합산해서 ancestor 기준 상대 위치를 구한다.
// (미리보기 화면에서는 wrapper 전체가 transform: scale로 축소되는데,
//  getBoundingClientRect는 그 축소된 값을 반환해 offsetWidth 등 레이아웃 값과 어긋나므로 사용하지 않는다)
function offsetLeftFrom(el, ancestor) {
    let x = 0;
    let node = el;
    while (node && node !== ancestor) {
        x += node.offsetLeft;
        node = node.offsetParent;
    }
    return x;
}

function alignGridToMonthTitle(wrapper) {
    const monthTitle = wrapper.querySelector('#week-title');
    const titleEnd = monthTitle.offsetLeft + monthTitle.offsetWidth;
    const todoWidth = Math.max(0, titleEnd - parseFloat(getComputedStyle(monthTitle).fontSize));
    wrapper.querySelector('#weekly-stage').style.setProperty('--month-title-end', `${todoWidth}px`);

    const weeklyGrid = wrapper.querySelector('#weekly-grid');
    const header = wrapper.querySelector('.weekly-header');
    const mondayColumn = weeklyGrid.querySelector('.day-column');
    const weeklyGridLeft = offsetLeftFrom(mondayColumn, wrapper) - offsetLeftFrom(header, wrapper);
    const gauge = wrapper.querySelector('.month-gauge');
    gauge.style.setProperty('--weekly-grid-left', `${weeklyGridLeft}px`);
    gauge.style.setProperty('--weekly-column-width', `${weeklyGrid.clientWidth / 7}px`);
}

// monday = 화면에 표시할 주의 시작일(월요일), appState.weeklyState.monday에서 전달됨.
// monthly/daily와는 독립적인 값이라 이 화면의 방향키 이동은 다른 화면에 영향을 주지 않는다.
export function renderWeekly(container, monday, appState) {
    const { Calendar, Holidays, Designs } = appState.plannerData;
    const dayNames = Calendar.days;
    const monthNames = Calendar.month;
    const themeDate = getWeekThemeDate(monday);

    document.body.className = Designs.Themes[themeDate.getMonth() % Designs.Themes.length];

    container.innerHTML = `
        <main class="weekly-wrapper">
            <header class="weekly-header">
                <div>
                    <p class="eyebrow">WEEKLY PLANNER</p>
                    <h1 class="week-title" id="week-title"></h1>
                </div>
                <div class="month-gauge" id="month-gauge" aria-label="Month progress">
                    <div class="gauge-marker" aria-hidden="true">
                        <div class="gauge-marker-inner"></div>
                    </div>
                    <div class="gauge-scale" aria-hidden="true">
                        <span class="gauge-scale-start">0</span>
                        <span class="gauge-scale-first">4</span>
                        <span class="gauge-scale-second">8</span>
                        <span class="gauge-scale-end">12</span>
                    </div>
                </div>

                <div class="week-info">
                    <span id="week-range"></span>
                    <span class="week-number" id="week-number"></span>
                </div>
            </header>

            <section class="weekly-stage" id="weekly-stage">
                <aside class="weekly-todo" aria-label="Weekly to do list">
                    <div class="weekly-todo-title">할 일 목록</div>
                    <div class="weekly-todo-rows"></div>
                </aside>
                <aside class="habit-tracker" aria-label="Habit tracker">
                    <div class="habit-tracker-title">해빗 트래커</div>
                    <div class="habit-tracker-rows"></div>
                </aside>
                <div class="weekly-grid" id="weekly-grid" aria-label="Weekly schedule"></div>
                <div class="habit-grid" id="habit-grid" aria-label="Habit tracker grid"></div>
                <div class="weekly-bottom-box" aria-label="Weekly notes"></div>
            </section>
        </main>
    `;

    const wrapper = container.querySelector('.weekly-wrapper');

    // 주/월과 무관하게 항상 같은 개수인 정적 반복 요소
    fillGaugeSegments(wrapper.querySelector('.month-gauge'));
    fillWeeklyTodoRows(wrapper.querySelector('.weekly-todo-rows'));
    fillHabitTrackerRows(wrapper.querySelector('.habit-tracker-rows'));
    fillHabitGrid(wrapper.querySelector('#habit-grid'));
    fillBottomBoxRows(wrapper.querySelector('.weekly-bottom-box'));

    wrapper.querySelector('#week-title').textContent = `${themeDate.getFullYear()} ${monthNames[themeDate.getMonth()]}`;
    wrapper.querySelector('#week-range').textContent = `${formatDate(monday)} - ${formatDate(addDays(monday, 6))}`;
    wrapper.querySelector('#week-number').textContent = getWeekNumber(monday);
    updateGauge(wrapper, themeDate.getMonth());
    renderWeekDays(wrapper.querySelector('#weekly-grid'), monday, dayNames, Holidays);

    alignGridToMonthTitle(wrapper);
    if (document.fonts) document.fonts.ready.then(() => alignGridToMonthTitle(wrapper));
}
