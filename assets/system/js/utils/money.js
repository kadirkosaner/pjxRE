/**
 * Money helpers
 * Avoids floating-point artifacts and keeps display consistent.
 */
(function () {
    function toNumber(value) {
        var n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }

    function roundMoney(value) {
        return Math.round(toNumber(value) * 100) / 100;
    }

    function formatMoney(value) {
        return roundMoney(value).toFixed(2);
    }

    window.roundMoney = roundMoney;
    window.formatMoney = formatMoney;
})();
