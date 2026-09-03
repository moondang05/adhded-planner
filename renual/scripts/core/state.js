// 화면 전체가 공유하는 상태와, 항목별로 분리된 데이터를 한 곳에서 조립
import calendarData from '../../data/calendar.json' with { type: 'json' };
import holidaysData from '../../data/holidays.json' with { type: 'json' };
import designData from '../../data/design.json' with { type: 'json' };

export const appState = {
    currentDate: new Date(),
    plannerData: {
        Calendar: calendarData,
        Holidays: holidaysData,
        Designs: designData
    },
    currentView: 'guide',
    additionalConfirmed: false // additional 설정 팝업에서 확인을 누르면 true (가이드 1번 표시에 사용)
};
