/* ==========================================
   PHONE TOPIC SYSTEM - Helper functions (window exports)
========================================== */

window.phoneGetTopicsByCategory = function(charId, category, vars) {
    if (!charId || !category) return [];
    var char = vars.characters && vars.characters[charId];
    if (!char || !char.stats) return [];
    var stat = char.stats[category] || 0;
    var setupTopics = (typeof setup !== 'undefined' && setup.phoneMessageTopics) ? setup.phoneMessageTopics[charId] : null;
    if (!setupTopics) return [];
    return setupTopics.filter(function(topic) {
        return topic.category === category && stat >= topic.tier;
    });
};

window.phonePickRandomReply = function(replies) {
    if (!replies || !Array.isArray(replies) || replies.length === 0) return "";
    return replies[Math.floor(Math.random() * replies.length)];
};

window.phonePickRandomImage = function(images) {
    if (!images || !Array.isArray(images) || images.length === 0) return null;
    return images[Math.floor(Math.random() * images.length)];
};

window.phoneApplyTopicEffects = function(charId, topic, vars) {
    if (!charId || !topic || !vars) return;
    var char = vars.characters && vars.characters[charId];
    if (!char || !char.stats) return;
    if (topic.statGain) {
        for (var stat in topic.statGain) {
            if (char.stats.hasOwnProperty(stat)) {
                var currentStat = char.stats[stat] || 0;
                var topicTier = topic.tier || 0;
                var maxCap = 100;
                if (topicTier === 0) maxCap = 20;
                else if (topicTier === 20) maxCap = 40;
                else if (topicTier === 40) maxCap = 60;
                else if (topicTier === 60) maxCap = 100;
                if (currentStat < maxCap) {
                    var gainVal = topic.statGain[stat] || 0;
                    char.stats[stat] = Math.min(maxCap, currentStat + gainVal);
                }
            }
        }
    }
    if (topic.timeAdvance && typeof Macro !== 'undefined' && Macro.has && Macro.has('advanceTime')) {
        var wiki = (typeof $ !== 'undefined' && $.wiki) ? $.wiki : null;
        if (wiki) wiki('<<advanceTime ' + topic.timeAdvance + '>>');
    }
};

window.phoneGetAvailableCategories = function(charId, vars) {
    if (!charId || !vars) return [];
    var categories = ['friendship', 'love', 'lust'];
    var available = [];
    categories.forEach(function(cat) {
        var topics = window.phoneGetTopicsByCategory(charId, cat, vars);
        if (topics && topics.length > 0) available.push(cat);
    });
    return available;
};
