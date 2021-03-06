import $ from 'jquery';

import {
    basicData,
    ChineseNumber,
    formatValue,
} from './utils.js';

export default class {
    constructor($table) {
        console.log('now it is built.');

        this.$table = $table;
        this.$container = $table.parent();
        this.$prevm = $table.find('.prevm');
        this.$nextm = $table.find('.nextm');
        this.$tbody = this.$table.find('tbody.calendar');
        this.$title = this.$table.find('.title');
        this.$btnToday = this.$table.find('.btn.today');
        this.$btnOk = this.$table.find('.btn.ok');
        this.$btnClear = this.$table.find('.btn.clear');

        basicData(this);
        this.selectedDayNumber = this.todayNumber;

        this.generateDom(this.generateCalendar(this.currentYear, this.currentMonth));
        this.tableEventListener();
    }
    refresh(year = this.currentYear, month = this.currentMonth) {
        this.currentYear = year;
        this.currentMonth = month;

        this.clearDom();

        this.generateDom(this.generateCalendar(year, month));
    }
    prevMonth() {
        let year, month;
        if (this.currentMonth === 1) {
            year = this.currentYear - 1;
            month = 12;
        } else {
            year = this.currentYear;
            month = this.currentMonth - 1;
        }
        // this.refresh(year, month);
        this.sendData(year, month);
    }
    nextMonth() {
        let year, month;
        if (this.currentMonth === 12) {
            year = this.currentYear + 1;
            month = 1;
        } else {
            year = this.currentYear;
            month = this.currentMonth + 1;
        }
        // this.refresh(year, month);
        this.sendData(year, month);
    }
    getDaysInOneMonth(year, month) {
        const d = new Date(year, month, 0);

        return d.getDate();
    }
    getDayInOneMonth(year, month, dayNumber) {
        const d = new Date(year, month - 1, dayNumber);

        return d.getDay();
    }
    setConnection(vm) {
        this.vm = vm;
    }
    generateCalendar(year, month) {
        const monthDays = this.getDaysInOneMonth(year, month);
        const lastMonthDays = this.getDaysInOneMonth(year, month - 1);

        const firstDay = this.getDayInOneMonth(year, month, 1);
        const lastDay = this.getDayInOneMonth(year, month, monthDays);

        this.$title.text(`${ChineseNumber[month - 1]}月， ${year}`);

        const calendarArr = [];

        // add last month stuff
        for (let i = 0; i < firstDay; i++) {
            calendarArr.unshift({
                dayNumber: lastMonthDays - i,
                className: ['oday'],
            });
        }

        // add this month stuff
        for (let i = 1; i <= monthDays; i++) {
            // get things like Mon.
            const day = this.getDayInOneMonth(year, month, i);

            const className = ['day', 'btn'];

            if (day === 0 || day === 6) {
                className.push('weekend');
            }

            if (this.todayNumber === i && month === this.month) {
                className.push('today');
            }

            if (i === this.selectedDayNumber) {
                className.push('selected');
            }

            calendarArr.push({
                dayNumber: i,
                className,
            });
        }

        // next month stuff
        const currentLength = calendarArr.length;
        for (let i = 1; i <= 6 * 7 - currentLength; i++) {
            calendarArr.push({
                dayNumber: i,
                className: ['oday'],
            });
        }

        return calendarArr;
    }
    generateDom(calendarArr) {
        for (let i = 0; i < 6; i++) {
            const $tr = $('<tr></tr>');

            for (let j = 0; j < 7; j++) {
                const index = i * 7 + j;
                const $td = $(`<td>${calendarArr[index].dayNumber}</td>`);
                calendarArr[index].className.forEach(name => {
                    $td.addClass(name);
                });
                $td.data('timestamp', {
                    year: this.currentYear,
                    month: this.currentMonth,
                });
                $tr.append($td);
            }

            this.$tbody.append($tr);
        }

        this.tdEventListener();
    }
    clearDom() {
        this.$tbody.empty();
    }
    tdEventListener() {
        const $tds = this.$table.find('td.day');

        $tds.on('click', e => {
            const $td = $(e.currentTarget);
            this.selectedDayNumber = parseInt($td.text(), 10);
            $tds.removeClass('selected');
            $td.addClass('selected');

            this.sendData();
        });
    }
    tableEventListener() {
        this.$prevm.on('click', () => {
            this.prevMonth();
        });
        this.$nextm.on('click', () => {
            this.nextMonth();
        });
        this.$title.on('click', () => {
            const $mt = this.$table.parent().find('.mt');
            $mt.addClass('active');
        });
        this.$btnToday.on('click', () => {
            this.currentYear = this.year;
            this.currentMonth = this.month;
            this.selectedDayNumber = this.todayNumber;

            // this.refresh();
            this.sendData();
        });
        this.$btnClear.on('click', () => {
            this.$table.find('td.btn.day').removeClass('selected');
            this.$container.trigger('clearData');
        });
        this.$btnOk.on('click', () => {
            this.sendData();
        });
    }
    setValue(value) {
        const arr = value.split('-');
        const year = parseInt(arr[0], 10);
        const month = parseInt(arr[1], 10);
        const day = parseInt(arr[2], 10);

        if (!(month <= 12 && month > 0)) {
            console.log('input error');

            return;
        }

        this.selectedDayNumber = day;

        this.selectedYear = year;
        this.selectedMonth = month;
        this.sendData(year, month, day);
    }
    sendData(year = this.currentYear, month = this.currentMonth) {
        this.$container.trigger('changeData', [year, month]);
        this.$container.trigger('close');
    }
    getValue() {
        return `${this.currentYear}-${formatValue(this.currentMonth)}-${formatValue(this.selectedDayNumber)}`;
    }
}
