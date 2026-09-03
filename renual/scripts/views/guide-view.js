// 초기 화면(사용 방법 안내) 렌더링
import guideSteps from '../../data/guide-steps.json' with { type: 'json' };
import { appState } from '../core/state.js';

export function renderGuide(container) {
    if (!container) return;

    // 번호 동그라미 목록 생성 (1번은 additional 설정을 확인하면 dashed로 표시, 이후 계속 유지)
    const circlesHTML = guideSteps
        .map((_, index) => {
            const isDone = index === 0 && appState.additionalConfirmed;
            return `<p class="circle${isDone ? ' circle-done' : ''}">${index + 1}</p>`;
        })
        .join('');

    // 가이드 텍스트 목록 생성
    const textHTML = guideSteps
        .map(step => `<p>${step}</p>`)
        .join('');

    // 컨테이너 내부에 템플릿 렌더링
    container.innerHTML = `
        <h1>Making Guide</h1>
        <div class="guide-frame">
            <div class="circles">
                ${circlesHTML}
            </div>
            <div class="guide">
                ${textHTML}
            </div>
        </div>
    `;
}
