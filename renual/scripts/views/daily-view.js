// 일간(Daily) 뷰 렌더링
import { isHoliday } from '../utils/holiday-utils.js';
import { getWeekNumber } from '../utils/date-utils.js';

// 요일 하나 분(날짜 칸 + 시간표 칸)의 day-wrapper 생성
function createDayWrapper(targetDate, dayName, monthNames, Holidays) {
    const wrapper = document.createElement('div');
    wrapper.className = 'day-wrapper';

    const dateDiv = document.createElement('div');
    dateDiv.className = isHoliday(targetDate, Holidays) ? 'daily-day-date highlight-date' : 'daily-day-date';
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

// 금~일(viewIndex 1) 4번째 칸: 미처 못 끝낸 일 / 자유 공간 박스
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

// monday = 기준 주의 월요일, viewIndex = 0(월~목) | 1(금~일)
export function renderDaily(container, monday, viewIndex, appState) {
    const { Calendar, Holidays, Designs } = appState.plannerData;
    const dayNames = Calendar.days;
    const monthNames = Calendar.month;

    document.body.className = Designs.Themes[monday.getMonth() % Designs.Themes.length];

    container.innerHTML = `
        <div class="daily-wrapper">
            <div class="daily-header">
                <div class="titles">
                    <span class="eyebrow">DAILY PLANNER</span>
                    <span class="day-title" id="day-title">WEEK ${getWeekNumber(monday)}</span>
                </div>

                <div class="mood-container">
                    <span class="eyebrow eyebrow-right">DAILY MOOD</span>
                    <div id="mood-circles" class="mood-circles"></div>
                </div>
            </div>

            <div class="daily-stage" id="daily-stage"></div>
        </div>
    `;

    const wrapper = container.querySelector('.daily-wrapper');
    const stage = wrapper.querySelector('#daily-stage');
    const moodCircles = wrapper.querySelector('#mood-circles');

    const startOffset = viewIndex === 0 ? 0 : 4;
    const dayCount = viewIndex === 0 ? 4 : 3;

    renderMoodCircles(moodCircles, dayCount);

    for (let i = 0; i < dayCount; i++) {
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + startOffset + i);
        stage.appendChild(createDayWrapper(targetDate, dayNames[startOffset + i], monthNames, Holidays));
    }

    if (viewIndex === 1) {
        stage.appendChild(createExtraWrapper());
    }
}
