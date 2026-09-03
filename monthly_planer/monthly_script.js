// 달력 다시 그리기용 변수를 위로 빼서 onSnapshot이 접근 가능하도록 수정 필요
let renderCalendarFunc;

document.addEventListener('DOMContentLoaded', () => {

    const fixedHolidays = {
        '01-01': true, '03-01': true, '05-01': true,
        '05-05': true, '06-06': true, '07-17': true,
        '08-15': true, '10-03': true, '10-09': true,
        '12-25': true
    };

    const dynamicHolidays2026 = {
        '2026-02-16': true, '2026-02-17': true, '2026-02-18': true,
        '2026-03-02': true,
        '2026-05-24': true, '2026-05-25': true,
        '2026-06-03': true,
        '2026-08-17': true,
        '2026-09-24': true, '2026-09-25': true, '2026-09-26': true,
        '2026-09-28': true,
        '2026-10-05': true
    };
    const substituteHolidayExcluded = '06-06';

    const themes = ['', 'theme-green', 'theme-purple', 'theme-pink', 'theme-yellow', 'theme-blue', 'theme-orange'];
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthlyQuotes = [
        '조용한 삶의 단조로움과 고독은 창조적 사고를 자극한다. <알버트 아인슈타인>',
        '내가 조용하다고 나를 과소평가하지 마라. 나는 말하는 것 보다 더 많이 알고, 말하는 것 보다 더 생각하며, 네가 깨닫는 것 보다 더 많은 것을 알아차린다. <미카엘라 청>',
        '정말 어렵고 놀라운 것은 완벽함을 포기하고 자신이 되기 위해 노력하기 시작하는 것입니다. <안나 퀸들렌>',
        '조용한 사람들이 가장 시끄러운 마음을 가진다. <스티븐 호킹>',
        '평화를 빼앗겼을 때 분노가 해결 방법이 될 수 있다. <앤 해서웨이>',
        '깨어지고 부서진 틈이 있기에, 그 사이로 빛이 새어 들어오기 시작한다. <래너드 코헨>',
        '다른 사람을 따뜻하게 해주려고 내 몸에 불을 지를 필요는 없다. <페니 레이드>',
        '몸이 쉴 시간을 주지 않으면, 몸이 알아서 병을 만들어 쉴 시간을 빼앗아 간다. <무명>',
        '당신의 평화를 위협하는 것들로부터 멀어지는 연습을 하라. 그것이 비록 사람일지라도. <무명>'
    ];

    // currentDate를 전역 개체(window)에 저장하여 onSnapshot에서도 현재 보고 있는 달을 유지할 수 있도록 함
    window.currentDate = new Date();

    renderCalendarFunc = function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        // 🌟 핵심: '월(month)' 숫자를 기준으로 테마를 고정 배정!
        // 이렇게 하면 같은 달 안에서 점을 찍을 땐 색상이 안 변하고 고정되지만, 
        // ◀ ▶ 버튼을 눌러서 '다음 달'로 넘어가면 테마가 확 달마다 바뀌게 됩니다.
        const themeIndex = month % themes.length;
        document.body.className = themes[themeIndex];

        document.getElementById('year-display').textContent = year;
        document.getElementById('month-display').textContent = monthNames[month];
        document.getElementById('month-num-display').textContent = String(month + 1).padStart(2, '0');
        document.getElementById('monthly-quote').textContent = monthlyQuotes[month % monthlyQuotes.length]
            .replace(/\s*(?=<)/, '\n');

        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        weekdays.forEach(day => {
            const div = document.createElement('div');
            div.className = 'cal-cell weekday';
            div.textContent = day;
            grid.appendChild(div);
        });

        let firstDay = new Date(year, month, 1).getDay();
        let emptyDays = firstDay === 0 ? 6 : firstDay - 1;

        const prevLastDate = new Date(year, month, 0).getDate();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // 이전 달 빈칸
        for (let i = emptyDays - 1; i >= 0; i--) {
            const div = document.createElement('div');
            div.className = 'cal-cell dimmed';
            const number = document.createElement('span');
            number.className = 'date-number';
            number.textContent = prevLastDate - i;
            if (prevLastDate - i >= 10) number.classList.add('double-digit');
            div.appendChild(number);
            grid.appendChild(div);
        }

        // 이번 달 날짜
        for (let i = 1; i <= lastDate; i++) {
            const div = document.createElement('div');
            div.className = 'cal-cell';
            const number = document.createElement('span');
            number.className = 'date-number';
            number.textContent = i;
            if (i >= 10) number.classList.add('double-digit');
            div.appendChild(number);


            if (isHoliday(new Date(year, month, i))) {
                div.classList.add('selected');
            }


            grid.appendChild(div);
        }

        // 다음 달 빈칸 (딱 필요한 줄까지만!)
        const currentMonthCells = emptyDays + lastDate;
        const totalRows = Math.ceil(currentMonthCells / 7);
        const totalCells = totalRows * 7;

        let nextDays = totalCells - currentMonthCells;

        if (nextDays > 0) {
            for (let i = 1; i <= nextDays; i++) {
                const div = document.createElement('div');
                div.className = 'cal-cell dimmed';
                const number = document.createElement('span');
                number.className = 'date-number';
                number.textContent = i;
                if (i >= 10) number.classList.add('double-digit');
                div.appendChild(number);
                grid.appendChild(div);
            }
        }
    }

    function isHoliday(date) {
        const dateKey = toDateKey(date);
        const fixedKey = toFixedKey(date);
        const substituteHolidays = getSubstituteHolidays(date.getFullYear());
        const previousDate = addDays(date, -1);
        const previousFixedKey = toFixedKey(previousDate);
        const isFollowingSundayHoliday = date.getDay() === 1 && previousDate.getDay() === 0 &&
            isFixedHoliday(previousFixedKey) && previousFixedKey !== substituteHolidayExcluded;

        return date.getDay() === 0 || isFixedHoliday(fixedKey) || dynamicHolidays2026[dateKey] || substituteHolidays.has(dateKey) || isFollowingSundayHoliday;
    }

    function isFixedHoliday(fixedKey) {
        return Object.prototype.hasOwnProperty.call(fixedHolidays, fixedKey);
    }

    function getSubstituteHolidays(year) {
        const substituteHolidays = new Set();

        Object.keys(fixedHolidays).forEach(fixedKey => {
            if (fixedKey === substituteHolidayExcluded) return;

            const [month, day] = fixedKey.split('-').map(Number);
            const holiday = new Date(year, month - 1, day);
            if (holiday.getDay() >= 6) {
                const daysUntilMonday = holiday.getDay() === 6 ? 2 : 1;
                substituteHolidays.add(toDateKey(addDays(holiday, daysUntilMonday)));
            }
        });

        return substituteHolidays;
    }

    function addDays(date, amount) {
        const result = new Date(date);
        result.setDate(result.getDate() + amount);
        return result;
    }

    function toDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function toFixedKey(date) {
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    renderCalendarFunc(window.currentDate);

    document.addEventListener('keydown', (e) => {
        const target = e.target;
        const isTextInput = target instanceof HTMLElement && (
            target.matches('input, textarea, select') || target.isContentEditable
        );

        if (isTextInput || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;

        e.preventDefault();
        const monthOffset = e.key === 'ArrowLeft' ? -1 : 1;
        window.currentDate.setMonth(window.currentDate.getMonth() + monthOffset);
        renderCalendarFunc(window.currentDate);
    });

});