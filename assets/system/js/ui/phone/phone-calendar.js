/* ==========================================
   PHONE CALENDAR APP - Day view, appointments
========================================== */

window.PhoneApps = window.PhoneApps || {};
window.PhoneApps.calendar = {
    render: function (vars) {
        if (cleanupExpiredMeetups(vars)) persistPhoneChanges();
        var timeSys = vars.timeSys || { hour: 0, minute: 0, day: 1, month: 1, year: 2025, weekday: 1 };
        var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var offset = phoneViewState.calendarOffset;
        if (typeof offset !== 'number' || offset < 0) offset = 0;
        if (offset > 9) offset = 9;
        phoneViewState.calendarOffset = offset;
        var dateInfo = getDateWithOffset(timeSys, offset);
        var todayKey = (timeSys.year || 0) * 10000 + (timeSys.month || 0) * 100 + (timeSys.day || 0);
        var dateKey = (dateInfo.year || 0) * 10000 + (dateInfo.month || 0) * 100 + (dateInfo.day || 0);
        var isToday = dateKey === todayKey;
        var dayLabel = weekdays[dateInfo.weekday % 7] + ', ' + months[(dateInfo.month || 1) - 1] + ' ' + (dateInfo.day || 1);
        if (isToday) dayLabel = 'Today – ' + dayLabel;
        var canPrev = offset > 0;
        var canNext = offset < 9;
        var navHtml = '<div class="phone-calendar-nav">' +
            '<button type="button" class="phone-calendar-nav-btn' + (canPrev ? '' : ' phone-calendar-nav-btn-disabled') + '" id="phone-calendar-prev" aria-label="Previous day"' + (canPrev ? '' : ' disabled') + '><span class="icon icon-chevron-left icon-20"></span></button>' +
            '<span class="phone-calendar-nav-range">' + dayLabel + '</span>' +
            '<button type="button" class="phone-calendar-nav-btn' + (canNext ? '' : ' phone-calendar-nav-btn-disabled') + '" id="phone-calendar-next" aria-label="Next day"' + (canNext ? '' : ' disabled') + '><span class="icon icon-chevron-right icon-20"></span></button>' +
            '</div>';
        var appointments = vars.phoneAppointments || [];
        var dayEvents = appointments.filter(function (a) {
            if (!a || a.status !== 'pending' || !a.time) return false;
            var aptDate = ((a.time.year || 0) * 10000) + ((a.time.month || 0) * 100) + (a.time.day || 0);
            return aptDate === dateKey;
        }).sort(function (x, y) {
            var mx = (x.time.hour || 0) * 60 + (x.time.minute || 0);
            var my = (y.time.hour || 0) * 60 + (y.time.minute || 0);
            return mx - my;
        });
        var daysHtml = '<div class="phone-calendar-day' + (isToday ? ' phone-calendar-day-today' : '') + '">';
        daysHtml += '<div class="phone-calendar-day-title">' + dayLabel + '</div>';
        if (dayEvents.length === 0) {
            daysHtml += '<div class="phone-calendar-day-events phone-calendar-day-empty">No events</div>';
        } else {
            daysHtml += '<div class="phone-calendar-day-events">';
            dayEvents.forEach(function (a) {
                var timeStr = a.time ? (String(a.time.hour || 0).padStart(2, '0') + ':' + String(a.time.minute || 0).padStart(2, '0')) : '';
                var name = getPhoneContactName(a.charId, vars);
                var place = a.locationName || a.location || '';
                daysHtml += '<div class="phone-calendar-event"><span class="phone-calendar-event-time">' + timeStr + '</span> <span class="phone-calendar-event-desc">' + escapeHtml(name) + (place ? ' @ ' + escapeHtml(place) : '') + '</span></div>';
            });
            daysHtml += '</div>';
        }
        daysHtml += '</div>';
        return '<div class="phone-app-calendar">' + navHtml + '<div class="phone-calendar-days">' + daysHtml + '</div></div>';
    }
};
