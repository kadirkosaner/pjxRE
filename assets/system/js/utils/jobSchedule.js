/**
 * Job weekly schedule helpers. schedule.offWeekdays uses JS weekday: 0=Sun … 6=Sat.
 * If offWeekdays is missing or empty, every day is a work day (backward compatible).
 */
window.JobSchedule = {
    isScheduledOffDay: function (jobDef, weekday) {
        var off = jobDef && jobDef.schedule && jobDef.schedule.offWeekdays;
        if (!off || !off.length) return false;
        return off.indexOf(weekday) !== -1;
    },

    isScheduledWorkDay: function (jobDef, weekday) {
        return !!(jobDef && jobDef.schedule) && !this.isScheduledOffDay(jobDef, weekday);
    },

    /** Comma-separated weekday names for days the player works (inverse of offWeekdays).
     *  Order is Monday → Sunday (not JS 0=Sun order) for readable “Shift days” labels. */
    formatWorkDayNames: function (jobDef, weekdayNames) {
        var names = weekdayNames || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var off = (jobDef && jobDef.schedule && jobDef.schedule.offWeekdays) || [];
        var parts = [];
        var order = [1, 2, 3, 4, 5, 6, 0];
        for (var i = 0; i < 7; i++) {
            var w = order[i];
            if (off.indexOf(w) === -1) parts.push(names[w]);
        }
        return parts.join(', ');
    }
};
