// 화면 전체가 공유하는 상태와, 항목별로 분리된 데이터를 한 곳에서 조립
import calendarData from '../../data/calendar.json' with { type: 'json' };
import holidaysData from '../../data/holidays.json' with { type: 'json' };
import designData from '../../data/design.json' with { type: 'json' };
import { getMondayOf } from '../utils/date-utils.js';

const today = new Date();
const todayWeekday = today.getDay() || 7; // 1=월 ... 7=일

export const appState = {
    plannerData: {
        Calendar: calendarData,
        Holidays: holidaysData,
        Designs: designData
    },
    currentView: 'guide',
    additionalConfirmed: false, // additional 설정 팝업에서 확인을 누르면 true (가이드 1번 표시에 사용)

    // 월/주/일 화면은 각자 방향키로 탐색하는 기준이 다르므로 독립된 상태로 분리
    // (하나의 값을 공유하면 한 화면에서 이동한 뒤 다른 화면으로 넘어갈 때 엉뚱한 날짜가 표시됨)
    monthlyState: {
        baseDate: new Date(today)
    },
    weeklyState: {
        monday: getMondayOf(today)
    },
    dailyState: {
        monday: getMondayOf(today),
        viewIndex: (todayWeekday >= 1 && todayWeekday <= 4) ? 0 : 1
    }
};
