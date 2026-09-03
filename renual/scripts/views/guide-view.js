// 초기 화면(사용 방법 안내) 렌더링
import guideSteps from '../../data/guide-steps.json' with { type: 'json' };

export function renderGuide(container) {
    if (!container) return;

    // 번호 동그라미 목록 생성
    const circlesHTML = guideSteps
        .map((_, index) => `<p class="circle">${index + 1}</p>`)
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
