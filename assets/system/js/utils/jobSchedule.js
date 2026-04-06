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

    /** Comma-separated weekday names for days the player works (inverse of offWeekdays). */
    formatWorkDayNames: function (jobDef, weekdayNames) {
        var names = weekdayNames || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var off = (jobDef && jobDef.schedule && jobDef.schedule.offWeekdays) || [];
        var parts = [];
        for (var w = 0; w < 7; w++) {
            if (off.indexOf(w) === -1) parts.push(names[w]);
        }
        return parts.join(', ');
    }
};
