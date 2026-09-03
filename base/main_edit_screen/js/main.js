// 분리 시켜둔 js 파일들을 호출
// import { renderMonthly } from './monthly.js';
// import { renderWeekly } from './weekly.js';
// import { renderDaily } from './daily.js';
import { renderGuide } from './preview-guide.js';
import { toMonthName, isHoliday, toDayName, formatDate, getWeekNumber, addDays } from './utils.js';
import data from '../planner-data.json' with { type: 'json' };

// 최소한의 기본 정보들 저장
let appState = {
    currentDate: new Date(),
    plannerData: data,
    currentView: 'guide'
};

let monday = new Date(appState.currentDate);
const day = monday.getDay() || 7;
monday.setDate(monday.getDate() - day + 1);
monday.setHours(0, 0, 0, 0);
let viewIndex = (day >= 1 && day <= 4) ? 0 : 1;


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
function refreshCurrentView() {
    const container = document.getElementById('info-preview');
    updateTimeBox(); // 상단 시간 박스도 업데이트

    if (appState.currentView === 'monthly') {
        // renderMonthly(container, appState, {isHoliday});
        container.classList.add('planner-view');
        
        // 렌더링 직후 캐시된 스케일 즉시 적용 (번쩍거림 방지)
        const wrapper = container.querySelector('.calendar-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${cachedScale})`;
            wrapper.style.transformOrigin = 'top left';
        }
    } 
    
    else if (appState.currentView === 'weekly') {
        // renderWeekly(container, appState, {isHoliday, formatDate, getWeekNumber, addDays});
        container.classList.add('planner-view');
        const wrapper = container.querySelector('.weekly-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${cachedScale})`;
            wrapper.style.transformOrigin = 'top left';
        }
    } 
    
    else if (appState.currentView === 'daily') {
        // renderDaily(container, appState, {getWeekNumber, isHoliday});
        container.classList.add('planner-view');
        const wrapper = container.querySelector('.daily-wrapper');
        if (wrapper) {
            wrapper.style.transform = `scale(${cachedScale})`;
            wrapper.style.transformOrigin = 'top left';
        }
    } 
    
    else if (appState.currentView === 'guide') {
        renderGuide(container);
        container.classList.remove('planner-view');
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
        wrapper.style.transformOrigin = 'top left';
    });
}

function setupSidebarEvents(Container) {
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
        
        // appState의 날짜 변경
        appState.currentDate.setMonth(appState.currentDate.getMonth() + monthOffset);
        
        // 변경된 날짜로 화면 다시 그리기
        refreshCurrentView();
    }

    else if (appState.currentView === 'weekly') {
        e.preventDefault();
        const weekOffset = e.key === 'ArrowLeft' ? -7 : 7;
        monday = addDays(monday, weekOffset);

        // appState의 날짜 변경
        appState.currentDate.setDate(appState.currentDate.getDate() + weekOffset);
        
        // 변경된 날짜로 화면 다시 그리기
        refreshCurrentView();
    }
    
    else if (appState.currentView === 'daily') {
        e.preventDefault();
        const dayOffset = e.key === 'ArrowLeft' ? -1 : 1;
        
        // viewIndex와 주 정보 업데이트
        if (e.key === 'ArrowLeft') {
            if (viewIndex === 1) {
                viewIndex = 0; // 현주 후반부 → 현주 전반부
            } else {
                monday.setDate(monday.getDate() - 7);
                viewIndex = 1; // 현주 전반부 → 전주 후반부
            }
        } else if (e.key === 'ArrowRight') {
            if (viewIndex === 0) {
                viewIndex = 1; // 현주 전반부 → 현주 후반부
            } else {
                monday.setDate(monday.getDate() + 7);
                viewIndex = 0; // 현주 후반부 → 다음주 전반부
            }
        }

        // appState.currentDate 업데이트 (뷰에 표시될 대표 날짜)
        appState.currentDate = new Date(monday);
        if (viewIndex === 0) {
            // 전반부(월~목): 왼쪽 화살표면 전주 마지막 날, 오른쪽 화살표면 현주 목요일
            appState.currentDate.setDate(monday.getDate() + (dayOffset === -1 ? -1 : 4));
        } else {
            // 후반부(금~일): 왼쪽 화살표면 현주 월요일, 오른쪽 화살표면 다음주 월요일
            appState.currentDate.setDate(monday.getDate() + (dayOffset === -1 ? 0 : 7));
        }

        // 변경된 날짜로 화면 다시 그리기
        refreshCurrentView();
    }

    // focus 제거하여 버튼 테두리 방지
    if (document.activeElement) {
        document.activeElement.blur();
    }
    
});


async function init() {
    // 가이드 렌더링
    const guideContainer = document.getElementById('info-preview');
    refreshCurrentView(); // 초기 렌더링 시 가이드 화면 표시
    setupSidebarEvents(guideContainer);
}
    


document.addEventListener('DOMContentLoaded', init);