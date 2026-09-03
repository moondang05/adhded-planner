// 가이드 단계별 문구 데이터
const guideSteps = [
    "'additional'에서 출력 할 기간 및 표지 유무 등을 설정",
    "Monthly -> Weekly -> Daily 순으로 '수정' 버튼을 눌러 포함할 디자인을 설정",
    "'check & save'에서 최종 도안을 확인한 후 pdf파일로 저장",
    "인쇄소로 가서 출력"
];

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