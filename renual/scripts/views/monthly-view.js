// 월간(Monthly) 뷰 렌더링
import { isHoliday } from '../utils/holiday-utils.js';

function fillRepeatedRows(container, count, className) {
    for (let i = 0; i < count; i++) {
        const row = document.createElement('div');
        row.className = className;
        container.appendChild(row);
    }
}

// cal-grid의 둥근 모서리를 4개 모서리 칸에 class로 표시 (칸 수는 달마다 달라짐)
function markGridCorners(grid) {
    const cells = Array.from(grid.children);
    cells[0].classList.add('cal-cell-corner-tl');
    cells[6].classList.add('cal-cell-corner-tr');
    cells[cells.length - 7].classList.add('cal-cell-corner-bl');
    cells[cells.length - 1].classList.add('cal-cell-corner-br');
}

function createDateCell(dayNumber, className) {
    const div = document.createElement('div');
    div.className = className;
    const number = document.createElement('span');
    number.className = 'date-number';
    number.textContent = dayNumber;
    if (dayNumber >= 10) number.classList.add('double-digit');
    div.appendChild(number);
    return div;
}

export function renderMonthly(container, appState) {
    const { Calendar, Holidays, Designs } = appState.plannerData;
    const date = appState.monthlyState.baseDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    document.body.className = Designs.Themes[month % Designs.Themes.length];

    container.innerHTML = `
        <div class="calendar-wrapper">
            <div class="cal-header">
                <div class="cal-month" id="month-display">${Calendar.month[month]}</div>
                <div class="monthly-goal">
                    <div class="monthly-goal-title">- 자기 주의적 이기심(p)</div>
                    <div class="monthly-goal-body">
                        <div class="monthly-quote" id="monthly-quote"></div>
                    </div>
                </div>
                <div class="cal-year-info">
                    <div class="cal-month-num" id="month-num-display">${String(month + 1).padStart(2, '0')}</div>
                    <div class="cal-year" id="year-display">${year}</div>
                </div>
            </div>
            <div class="calendar-content">
                <div class="cal-grid" id="calendar-grid"></div>
                <aside class="todo-panel" aria-label="Monthly To do list">
                    <div class="todo-title">Monthly To do</div>
                    <div class="todo-rows"></div>
                </aside>
            </div>
        </div>
    `;

    const wrapper = container.querySelector('.calendar-wrapper');

    // 월과 무관하게 항상 같은 개수인 정적 반복 요소(목표란 구분선 3줄, 투두 17줄)
    fillRepeatedRows(wrapper.querySelector('.monthly-goal-body'), 3, 'quote-row');
    fillRepeatedRows(wrapper.querySelector('.todo-rows'), 17, 'todo-row');

    wrapper.querySelector('#monthly-quote').textContent = Designs.Quotes[month % Designs.Quotes.length]
        .replace(/\s*(?=<)/, '\n');

    const grid = wrapper.querySelector('#calendar-grid');

    Calendar.weekdays.forEach(day => {
        const div = document.createElement('div');
        div.className = 'cal-cell weekday';
        div.textContent = day;
        grid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const emptyDays = firstDay === 0 ? 6 : firstDay - 1;

    const prevLastDate = new Date(year, month, 0).getDate();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 이전 달 빈칸
    for (let i = emptyDays - 1; i >= 0; i--) {
        grid.appendChild(createDateCell(prevLastDate - i, 'cal-cell dimmed'));
    }

    // 이번 달 날짜
    for (let i = 1; i <= lastDate; i++) {
        const cell = createDateCell(i, 'cal-cell');
        if (isHoliday(new Date(year, month, i), Holidays)) {
            cell.classList.add('selected');
        }
        grid.appendChild(cell);
    }

    // 다음 달 빈칸 (딱 필요한 줄까지만)
    const currentMonthCells = emptyDays + lastDate;
    const totalRows = Math.ceil(currentMonthCells / 7);
    const totalCells = totalRows * 7;
    const nextDays = totalCells - currentMonthCells;

    for (let i = 1; i <= nextDays; i++) {
        grid.appendChild(createDateCell(i, 'cal-cell dimmed'));
    }

    markGridCorners(grid);
}
