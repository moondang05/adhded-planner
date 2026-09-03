// 앱 진입점: 상태/뷰 모듈을 불러와 초기 렌더링과 이벤트 바인딩을 수행
import { refreshCurrentView, setupSidebarEvents } from '../views/view-controller.js';
import { setupAdditionalModal } from '../views/additional-modal.js';

async function init() {
    refreshCurrentView(); // 초기 렌더링 시 가이드 화면 표시
    setupSidebarEvents();
    setupAdditionalModal();
}

document.addEventListener('DOMContentLoaded', init);
