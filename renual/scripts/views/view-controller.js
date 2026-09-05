// 사이드바 선택에 따라 monthly/weekly/daily/guide 화면을 전환하고,
// 미리보기 영역을 컨테이너 크기에 맞게 스케일링하는 뷰 전환 로직
// 분리 시켜둔 js 파일들을 호출
import { renderMonthly } from './monthly-view.js';
import { renderWeekly } from './weekly-view.js';
import { renderDaily } from './daily-view.js';
import { renderGuide } from './guide-view.js';
import { appState } from '../core/state.js';
import { toMonthName, toDayName, addDays } from '../utils/date-utils.js';
import { isHoliday } from '../utils/holiday-utils.js';

// 스케일 값 캐시 (번쩍거림 방지)
let cachedScale = 1;

function updateTimeBox() {
    const {
        Calendar: { month, days },
        Holidays
    } = appState.plannerData;

    const today = new Date(); // 항상 현재 날짜 사용 (방향키 영향 받지 않음)

    const timeBox = document.getElementById('time-box');
    const today_date = today.getDate();
    timeBox.innerHTML = `${toMonthName(today, month)} <span class="${isHoliday(today, Holidays) ? 'highlight' : ''}">${String(today_date).padStart(2, '0')} ${toDayName(today, days)}</span>`;
}

// 렌더링을 갱신하는 공통 함수
export function refreshCurrentView() {
    const container = document.getElementById('info-preview');
    updateTimeBox(); // 상단 시간 박스도 업데이트

    // 뷰 전환 시 이전 뷰가 남긴 정렬 클래스를 먼저 정리
    container.classList.remove('planner-view', 'weekly-view');

    if (appState.currentView === 'monthly') {
        renderMonthly(container, appState);
        container.classList.add('planner-view');

        // 렌더링 직후 캐시된 스케일 즉시 적용 (번쩍거림 방지, 중앙 기준으로 축소)
        const wrapper = container.querySelector('.calendar-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${cachedScale})`;
            wrapper.style.transformOrigin = 'center center';
        }
    }

    else if (appState.currentView === 'weekly') {
        renderWeekly(container, appState.weeklyState.monday, appState);
        // 주간 화면만 좌측 상단 기준 + 패딩으로 배치
        container.classList.add('planner-view', 'weekly-view');
        const wrapper = container.querySelector('.weekly-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${cachedScale})`;
            wrapper.style.transformOrigin = 'top left';
        }
    }

    else if (appState.currentView === 'daily') {
        renderDaily(container, appState.dailyState.monday, appState.dailyState.viewIndex, appState);
        container.classList.add('planner-view');
        const wrapper = container.querySelector('.daily-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${cachedScale})`;
            wrapper.style.transformOrigin = 'center center';
        }
    }

    else if (appState.currentView === 'guide') {
        renderGuide(container);
    }

    // 렌더링 후 스케일 정확히 조정
    scaleCalendarToFit();
}

// 달력을 컨테이너에 맞게 축소 (비율 유지)
function scaleCalendarToFit() {
    const container = document.getElementById('info-preview');
    let wrapper;

    if (appState.currentView === 'monthly') {
        wrapper = container.querySelector('.calendar-wrapper');
    } else if (appState.currentView === 'weekly') {
        wrapper = container.querySelector('.weekly-wrapper');
    } else if (appState.currentView === 'daily') {
        wrapper = container.querySelector('.daily-wrapper');
    }

    if (!wrapper) return;

    // 주간만 좌측 상단 기준 배치이므로 origin도 top left, 나머지는 정중앙 기준
    const origin = appState.currentView === 'weekly' ? 'top left' : 'center center';

    // 렌더링이 완료된 후 정확한 크기 계산
    requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // wrapper의 실제 크기 (mm 단위 CSS를 px로 변환)
        // 1mm ≈ 3.779px (96dpi 기준)
        const wrapperWidth = 210 * 3.779 + 16 * 3.779; // 210mm + 8mm padding*2
        const wrapperHeight = 148 * 3.779 + 16 * 3.779; // 148mm + 8mm padding*2

        if (wrapperWidth === 0 || wrapperHeight === 0 || containerWidth === 0 || containerHeight === 0) return;

        // 비율을 유지하면서 컨테이너에 맞게 scale 계산
        const scaleX = containerWidth / wrapperWidth;
        const scaleY = containerHeight / wrapperHeight;
        const scale = Math.min(scaleX, scaleY, 1); // 축소만 (1 이상 안됨)

        // 스케일값 캐시 업데이트
        cachedScale = scale;

        // 정확한 값으로 최종 업데이트
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = origin;
    });
}

// additional 설정 팝업에서 확인한 항목(monthly/weekly/daily)만 사이드바 버튼 잠금을 해제
export function setSidebarLock(include) {
    const sidebar = document.getElementById('sidebar');

    ['monthly', 'weekly', 'daily'].forEach((key) => {
        const btn = sidebar.querySelector(`button.${key}.action-btn`);
        if (btn) btn.disabled = !include[key];
    });
}

export function setupSidebarEvents() {
    const sidebar = document.getElementById('sidebar');

    sidebar.addEventListener('click', (event) => {
        const targetBtn = event.target.closest('button.action-btn');
        if (!targetBtn) return;

        if (targetBtn.classList.contains('monthly')) {
            appState.currentView = 'monthly';
            refreshCurrentView();
        } else if (targetBtn.classList.contains('weekly')) {
            appState.currentView = 'weekly';
            refreshCurrentView();
        } else if (targetBtn.classList.contains('daily')) {
            appState.currentView = 'daily';
            refreshCurrentView();
        }
    });
}

// 좌우방향키로 이전, 다음달 넘어가기(guide 화면일 때는 변동 x)
document.addEventListener('keydown', (e) => {
    const target = e.target;
    const isTextInput = target instanceof HTMLElement && (
        target.matches('input, textarea, select') || target.isContentEditable
    );

    if (isTextInput || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    // 가이드 화면일 때는 날짜 이동 안 함
    if (appState.currentView === 'guide') return;

    if (appState.currentView === 'monthly') {
        e.preventDefault();
        const monthOffset = e.key === 'ArrowLeft' ? -1 : 1;

        // monthlyState만 변경 (weekly/daily의 탐색 위치에는 영향 없음)
        appState.monthlyState.baseDate.setMonth(appState.monthlyState.baseDate.getMonth() + monthOffset);

        // 변경된 날짜로 화면 다시 그리기
        refreshCurrentView();
    }

    else if (appState.currentView === 'weekly') {
        e.preventDefault();
        const weekOffset = e.key === 'ArrowLeft' ? -7 : 7;

        // weeklyState만 변경 (monthly/daily의 탐색 위치에는 영향 없음)
        appState.weeklyState.monday = addDays(appState.weeklyState.monday, weekOffset);

        // 변경된 날짜로 화면 다시 그리기
        refreshCurrentView();
    }

    else if (appState.currentView === 'daily') {
        e.preventDefault();
        const daily = appState.dailyState;

        // dailyState만 변경 (monthly/weekly의 탐색 위치에는 영향 없음)
        if (e.key === 'ArrowLeft') {
            if (daily.viewIndex === 1) {
                daily.viewIndex = 0; // 현주 후반부 → 현주 전반부
            } else {
                daily.monday.setDate(daily.monday.getDate() - 7);
                daily.viewIndex = 1; // 현주 전반부 → 전주 후반부
            }
        } else if (e.key === 'ArrowRight') {
            if (daily.viewIndex === 0) {
                daily.viewIndex = 1; // 현주 전반부 → 현주 후반부
            } else {
                daily.monday.setDate(daily.monday.getDate() + 7);
                daily.viewIndex = 0; // 현주 후반부 → 다음주 전반부
            }
        }

        // 변경된 날짜로 화면 다시 그리기
        refreshCurrentView();
    }

    // focus 제거하여 버튼 테두리 방지
    if (document.activeElement) {
        document.activeElement.blur();
    }

});
