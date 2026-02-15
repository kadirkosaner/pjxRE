/* ==========================================
   PHONE TOPIC SYSTEM - Helper functions (window exports)
   Stats: friendship, love, lust only.
========================================== */

var PHONE_TOPIC_STATS = ["friendship", "love", "lust"];

window.phoneGetTopicsByCategory = function (charId, category, vars) {
  if (!charId || !category || PHONE_TOPIC_STATS.indexOf(category) === -1)
    return [];
  var char = vars.characters && vars.characters[charId];
  if (!char || !char.stats) return [];
  var stat = char.stats[category] || 0;
  var setupTopics =
    typeof setup !== "undefined" && setup.phoneMessageTopics
      ? setup.phoneMessageTopics[charId]
      : null;
  if (!setupTopics) return [];
  return setupTopics.filter(function (topic) {
    if (topic.category !== category || stat < (topic.tier || 0)) return false;
    var required = topic.requiredStats;
    if (required && typeof required === "object") {
      for (var key in required) {
        if (
          required.hasOwnProperty(key) &&
          PHONE_TOPIC_STATS.indexOf(key) !== -1
        ) {
          var need = required[key];
          var have = char.stats[key];
          if (have == null || have < need) return false;
        }
      }
    }
    return true;
  });
};

window.phonePickRandomReply = function (replies) {
  if (!replies || !Array.isArray(replies) || replies.length === 0) return "";
  return replies[Math.floor(Math.random() * replies.length)];
};

/**
 * Pick one image path for a topic. Uses:
 * - topic.imagePool: key in setup.phoneSelfiePaths (e.g. "mother", "player") – variablesPhoneSelfiePaths.twee
 * - topic.images: fallback array of paths
 */
window.phonePickRandomImage = function (imagesOrTopic) {
  var paths = [];
  var isTopic =
    imagesOrTopic &&
    typeof imagesOrTopic === "object" &&
    !Array.isArray(imagesOrTopic);
  if (isTopic) {
    var topic = imagesOrTopic;
    var setupRef =
      typeof PhoneAPI !== "undefined" && PhoneAPI.setup && PhoneAPI.setup.phoneSelfiePaths
        ? PhoneAPI.setup
        : typeof setup !== "undefined" && setup && setup.phoneSelfiePaths
          ? setup
          : typeof window !== "undefined" && window.setup && window.setup.phoneSelfiePaths
            ? window.setup
            : null;
    var pool =
      setupRef && setupRef.phoneSelfiePaths && topic.imagePool
        ? setupRef.phoneSelfiePaths[topic.imagePool]
        : null;
    if (pool && Array.isArray(pool) && pool.length > 0) paths = pool;
    else if (topic.images && Array.isArray(topic.images)) paths = topic.images;
  } else if (imagesOrTopic && Array.isArray(imagesOrTopic)) {
    paths = imagesOrTopic;
  }
  if (!paths.length) return null;
  return paths[Math.floor(Math.random() * paths.length)];
};

window.phoneApplyTopicEffects = function (charId, topic, vars) {
  if (!charId || !topic) return;
  window._phoneApplyTopicEffectsActive = true;
  try {
    applyTopicEffectsCore(charId, topic, vars);
  } finally {
    window._phoneApplyTopicEffectsActive = false;
  }
};

function applyTopicEffectsCore(charId, topic, vars) {
  /* Prefer PhoneAPI (story-passed) so state and wiki are always the right reference */
  var api = typeof PhoneAPI !== "undefined" && PhoneAPI ? PhoneAPI : null;
  var stateVars = (api && api.State && api.State.variables) ? api.State.variables : (typeof State !== "undefined" && State && State.variables) ? State.variables : (vars || null);
  if (!stateVars || !stateVars.characters) return;
  var char = stateVars.characters[charId];
  if (!char) return;
  if (!char.stats) char.stats = {};
  var gainMessages = [];
  if (topic.statGain) {
    for (var stat in topic.statGain) {
      if (PHONE_TOPIC_STATS.indexOf(stat) === -1) continue;
      if (char.stats[stat] == null) char.stats[stat] = 0;
      var currentStat = Number(char.stats[stat]) || 0;
      var topicTier = topic.tier || 0;
      var maxCap = 100;
      if (topicTier === 0) maxCap = 20;
      else if (topicTier === 20) maxCap = 40;
      else if (topicTier === 40) maxCap = 60;
      else if (topicTier === 60) maxCap = 100;
      if (currentStat < maxCap) {
        var gainVal = topic.statGain[stat] || 0;
        char.stats[stat] = Math.min(maxCap, currentStat + gainVal);
        var label = stat.charAt(0).toUpperCase() + stat.slice(1);
        gainMessages.push(label + " +" + gainVal);
      }
    }
  }
  /* When phone is open, always advance time by mutating State directly (widget often doesn't run in phone context) */
  var timeAdvanced = false;
  var mins = (topic.timeAdvance != null) ? Number(topic.timeAdvance) : 0;
  if (mins > 0 && stateVars.timeSys) {
    stateVars.timeSys.minute = (parseInt(stateVars.timeSys.minute, 10) || 0) + mins;
    while (stateVars.timeSys.minute >= 60) {
      stateVars.timeSys.minute -= 60;
      stateVars.timeSys.hour = (parseInt(stateVars.timeSys.hour, 10) || 0) + 1;
    }
    if (stateVars.timeSys.hour >= 24) stateVars.timeSys.hour = stateVars.timeSys.hour % 24;
    timeAdvanced = true;
  }
  /* Update phone status bar clock so it shows current time */
  if (stateVars.timeSys) {
    var jq = (api && api.$) ? api.$ : (typeof $ !== "undefined" ? $ : null);
    if (jq) {
      var h = parseInt(stateVars.timeSys.hour, 10) || 0;
      var m = parseInt(stateVars.timeSys.minute, 10) || 0;
      var timeStr = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
      jq("#phone-overlay .status-time").text(timeStr);
    }
  }
  /* Notify – format: "time passed" then "x gain" (two lines) */
  if (gainMessages.length > 0 || timeAdvanced) {
    var lines = [];
    if (timeAdvanced && topic.timeAdvance) lines.push(topic.timeAdvance + " min passed");
    if (gainMessages.length > 0) {
      var charName = (char.firstName || char.name || charId);
      lines.push(charName + " " + gainMessages.join(", "));
    }
    var msg = lines.join("\n");
    if (msg && typeof window.showNotification === "function") {
      window.showNotification({ type: "success", message: msg, duration: 3000, position: "rightbar-left" });
    }
  }
  /* Force UI refresh (topbar time, rightbar, stats) – especially after fallback time advance */
  try {
    var jq = (api && api.$) ? api.$ : (typeof $ !== "undefined" ? $ : null);
    if (jq && jq(document).trigger) jq(document).trigger(":passagerender");
  } catch (e) {}
};

window.phoneGetAvailableCategories = function (charId, vars) {
  if (!charId || !vars) return [];
  var categories = ["friendship", "love", "lust"];
  var available = [];
  categories.forEach(function (cat) {
    var topics = window.phoneGetTopicsByCategory(charId, cat, vars);
    if (topics && topics.length > 0) available.push(cat);
  });
  return available;
};
