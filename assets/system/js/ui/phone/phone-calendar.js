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
        });
        var workSynthetic = [];
        var bossMeetingSynthetic = [];
        var job = vars.job;
        var jobState = vars.jobState || {};
        var JobSched = window.JobSchedule;
        var jobsMap = (window.setup && window.setup.jobs) || {};
        var charDefs = (window.setup && window.setup.characterDefs) || {};
        var jdefForBoss = (job && job.id) ? jobsMap[job.id] : null;
        var needsBossTalkToday = !!(isToday && jdefForBoss && (jobState.bossMeetingRequired || jobState.bossWantsToSeePlayer || jobState.terminationPending || jobState.promotionPending));
        if (needsBossTalkToday) {
            var bossDef = jdefForBoss && jdefForBoss.bossCharId ? charDefs[jdefForBoss.bossCharId] : null;
            var bossName = (bossDef && bossDef.firstName) ? bossDef.firstName : 'Manager';
            var bossHour = (jdefForBoss.schedule && jdefForBoss.schedule.open != null) ? jdefForBoss.schedule.open : 10;
            bossMeetingSynthetic.push({
                isBossMeetingCalendar: true,
                text: bossName + ' wants to talk about absenteeism',
                time: {
                    year: dateInfo.year,
                    month: dateInfo.month,
                    day: dateInfo.day,
                    hour: bossHour,
                    minute: 0
                }
            });
        }
        if (job && job.id && JobSched && JobSched.isScheduledWorkDay) {
            var jdef = jobsMap[job.id];
            if (jdef && JobSched.isScheduledWorkDay(jdef, dateInfo.weekday)) {
                var sk = job.startedOn
                    ? ((job.startedOn.year || 0) * 10000 + (job.startedOn.month || 0) * 100 + (job.startedOn.day || 0))
                    : 0;
                if (dateKey >= sk) {
                    var wh = (jdef.schedule && jdef.schedule.open != null) ? jdef.schedule.open : 10;
                    workSynthetic.push({
                        isWorkCalendar: true,
                        workPlaceName: jdef.workplaceName || 'Work',
                        time: {
                            year: dateInfo.year,
                            month: dateInfo.month,
                            day: dateInfo.day,
                            hour: wh,
                            minute: 0
                        }
                    });
                }
            }
        }
        var dayEventsMerged = bossMeetingSynthetic.concat(workSynthetic).concat(dayEvents).sort(function (x, y) {
            var mx = (x.time.hour || 0) * 60 + (x.time.minute || 0);
            var my = (y.time.hour || 0) * 60 + (y.time.minute || 0);
            return mx - my;
        });
        var daysHtml = '<div class="phone-calendar-day' + (isToday ? ' phone-calendar-day-today' : '') + '">';
        daysHtml += '<div class="phone-calendar-day-title">' + dayLabel + '</div>';
        if (dayEventsMerged.length === 0) {
            daysHtml += '<div class="phone-calendar-day-events phone-calendar-day-empty">No events</div>';
        } else {
            daysHtml += '<div class="phone-calendar-day-events">';
            dayEventsMerged.forEach(function (a) {
                var timeStr = a.isBossMeetingCalendar
                    ? 'Today'
                    : (a.time ? (String(a.time.hour || 0).padStart(2, '0') + ':' + String(a.time.minute || 0).padStart(2, '0')) : '');
                var desc;
                if (a.isBossMeetingCalendar) {
                    desc = escapeHtml(a.text || 'Manager wants to talk today');
                } else if (a.isWorkCalendar) {
                    desc = 'Work — ' + escapeHtml(a.workPlaceName);
                } else {
                    var name = getPhoneContactName(a.charId, vars);
                    var place = a.locationName || a.location || '';
                    desc = escapeHtml(name) + (place ? ' @ ' + escapeHtml(place) : '');
                }
                daysHtml += '<div class="phone-calendar-event"><span class="phone-calendar-event-time">' + timeStr + '</span> <span class="phone-calendar-event-desc">' + desc + '</span></div>';
            });
            daysHtml += '</div>';
        }
        daysHtml += '</div>';
        return '<div class="phone-app-calendar">' + navHtml + '<div class="phone-calendar-days">' + daysHtml + '</div></div>';
    }
};
