// additional 버튼으로 열리는 출력 설정 모달(포함 항목 / 출력 범위 / 표지)의 상태와 이벤트 처리
import { appState } from '../core/state.js';
import { toDateKey } from '../utils/date-utils.js';
import { setSidebarLock, refreshCurrentView } from './view-controller.js';

const DEFAULT_OPTIONS = {
    include: { monthly: true, weekly: true, daily: true },
    range: { start: '', end: '' },
    cover: 'none'
};

// 마지막으로 '확인'을 눌러 저장된 값 (취소 시 이 값으로 되돌아감)
let savedOptions = JSON.parse(JSON.stringify(DEFAULT_OPTIONS));

function todayKey() {
    return toDateKey(new Date());
}

// 모달을 열 때마다 마지막 저장값 기준으로 폼을 다시 채움
function applyOptionsToForm(overlay) {
    overlay.querySelectorAll('.toggle-btn').forEach((btn) => {
        btn.classList.toggle('active', savedOptions.include[btn.dataset.include]);
    });

    overlay.querySelectorAll('.cover-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.cover === savedOptions.cover);
    });

    const startInput = overlay.querySelector('#range-start');
    const endInput = overlay.querySelector('#range-end');

    // 시작일은 당일 이전으로 갈 수 없음
    startInput.min = todayKey();
    startInput.value = savedOptions.range.start || todayKey();

    // 종료일은 시작일 이후만 선택 가능
    endInput.min = startInput.value;
    endInput.value = savedOptions.range.end || startInput.value;
}

export function setupAdditionalModal() {
    const overlay = document.getElementById('additional-modal');
    const openBtn = document.getElementById('additional-btn');
    const cancelBtn = overlay.querySelector('.modal-cancel-btn');
    const confirmBtn = overlay.querySelector('.modal-confirm-btn');
    const startInput = overlay.querySelector('#range-start');
    const endInput = overlay.querySelector('#range-end');

    function openModal() {
        applyOptionsToForm(overlay);
        overlay.classList.add('open');
    }

    function closeModal() {
        overlay.classList.remove('open');
    }

    openBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);

    // 패널 바깥(어두워진 배경) 클릭 시 취소와 동일하게 닫기
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('open')) {
            closeModal();
        }
    });

    // 월/주/일간 포함 여부: 다중 선택 토글
    overlay.querySelectorAll('.toggle-btn').forEach((btn) => {
        btn.addEventListener('click', () => btn.classList.toggle('active'));
    });

    // 표지 시안: 단일 선택
    overlay.querySelectorAll('.cover-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            overlay.querySelectorAll('.cover-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 시작일이 바뀌면 종료일의 선택 가능 범위(시작일 이후)도 함께 갱신
    startInput.addEventListener('change', () => {
        // 브라우저 min 속성을 우회해 당일 이전 값이 들어오는 경우를 대비한 보정
        if (startInput.value < startInput.min) {
            startInput.value = startInput.min;
        }

        endInput.min = startInput.value;
        if (endInput.value < startInput.value) {
            endInput.value = startInput.value;
        }
    });

    confirmBtn.addEventListener('click', () => {
        const include = {};
        overlay.querySelectorAll('.toggle-btn').forEach((btn) => {
            include[btn.dataset.include] = btn.classList.contains('active');
        });

        const activeCoverBtn = overlay.querySelector('.cover-btn.active');

        savedOptions = {
            include,
            range: { start: startInput.value, end: endInput.value },
            cover: activeCoverBtn ? activeCoverBtn.dataset.cover : 'none'
        };

        appState.exportOptions = savedOptions;
        appState.additionalConfirmed = true; // 가이드 1번(additional 설정) 완료 표시
        setSidebarLock(savedOptions.include); // 설정에서 포함시킨 항목만 사이드바 버튼 잠금 해제
        closeModal();

        // 가이드 화면에 있을 때만 즉시 다시 그려서 1번 dashed 표시를 반영
        if (appState.currentView === 'guide') {
            refreshCurrentView();
        }
    });
}
