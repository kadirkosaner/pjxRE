/**
 * ========================================
 * NOTIFICATION SYSTEM
 * ========================================
 * Global notification system for displaying toast messages
 * 
 * USAGE:
 * 
 * // Simple usage
 * notifySuccess("Success!")
 * notifyError("Error occurred!")
 * notifyWarning("Warning!")
 * notifyInfo("Info message")
 * notifyTimebox("Time changed")
 * notifyPhone("New message")
 * 
 * // With duration and position
 * notifySuccess("Message", 5000)                        // 5 seconds
 * notifyError("Message", 3000, "top-left")             // Top left corner
 * notifyWarning("Message", 2000, "bottom-right")       // Bottom right corner
 * 
 * // Advanced usage
 * showNotification({
 *   type: 'success',        // success | error | warning | info | phone
 *   message: 'Your message',
 *   icon: 'check',          // Icon name
 *   duration: 3000,         // Milliseconds (0 = persistent)
 *   position: 'top-right'   // top-right | top-left | bottom-right | bottom-left | timebox-bottom | phone-area | custom
 * })
 * 
 * // Custom position (below specific element)
 * showNotification({
 *   type: 'info',
 *   message: 'Custom message',
 *   icon: 'star',
 *   duration: 3000,
 *   position: 'custom',
 *   target: 'element-id',   // Element ID
 *   offsetY: 20
 * })
 * 
 * POSITIONS:
 * - top-right: Top right corner (default)
 * - top-left: Top left corner
 * - bottom-right: Bottom right corner
 * - bottom-left: Bottom left corner
 * - timebox-bottom: Below timebox (top to bottom animation)
 * - phone-area: From phone section (right to left animation)
 * - custom: Next to custom element
 * 
 * ANIMATIONS:
 * - Top/Bottom positions: Slide from right/left
 * - Timebox: Top to bottom fade + slide
 * - Phone: Right to left slide (attached to rightbar)
 * 
 * SUGARCUBE USAGE:
 * <<run notifySuccess("Game saved!")>>
 * <<run notifyTimebox("Evening arrived")>>
 * <<set $notificationPush = 1>>  // Phone notification trigger
 */

let NotificationAPI = null;

// Initialize 
window.NotificationInit = function (API) {
  NotificationAPI = API;
};

// Public API
window.showNotification = function (options) {
  const defaults = {
    type: 'info',              
    message: 'Notification',
    icon: 'bell',
    duration: 3000,            
    position: 'rightbar-left',     
    target: null,              
    offsetX: 0,
    offsetY: 10
  };
  const config = Object.assign({}, defaults, options);

  if (!NotificationAPI || !NotificationAPI.$) return null;

  const id = 'notif-' + Date.now();
  const $el = NotificationAPI.$(`
    <div class="notification notification-${config.type}" id="${id}"
         role="status" aria-live="polite" style="visibility:hidden;">
      <span class="notification-text">${config.message}</span>
    </div>
  `);

  NotificationAPI.$('body').append($el);

  positionNotification($el, config);

  setTimeout(() => {
    $el.css('visibility', 'visible');
    // reflow
    // eslint-disable-next-line no-unused-expressions
    $el[0] && $el[0].offsetHeight;
    $el.addClass('active');
  }, 10);

  // Auto close
  const closeAfter = Math.max(0, Number(config.duration) || 0);
  if (closeAfter > 0) {
    setTimeout(() => closeNotification($el), closeAfter);
  }

  return id;
};

window.notifySuccess = (message, duration = 3000, position = 'rightbar-left') =>
  showNotification({ type: 'success', message, duration, position });

window.notifyError = (message, duration = 3000, position = 'rightbar-left') =>
  showNotification({ type: 'error', message, duration, position });

window.notifyWarning = (message, duration = 3000, position = 'rightbar-left') =>
  showNotification({ type: 'warning', message, duration, position });

window.notifyInfo = (message, duration = 3000, position = 'rightbar-left') =>
  showNotification({ type: 'info', message, duration, position });

window.notifyTimebox = (message, duration = 3000) =>
  showNotification({ type: 'info', message, icon: 'alarm', duration, position: 'timebox-bottom' });

window.notifyPhone = (message, duration = 3000) =>
  showNotification({ type: 'phone', message, icon: 'alert', duration, position: 'phone-area' });

function closeNotification($el) {
  if (!$el || !$el.length) return;

  $el.addClass('closing').removeClass('active');

  const onEnd = (e) => {
    if (e.propertyName === 'transform' && !$el.hasClass('active')) {
      $el.off('transitionend', onEnd);
      $el.remove();
    }
  };
  $el.on('transitionend', onEnd);

  setTimeout(() => {
    if ($el && $el.length) {
      $el.off('transitionend', onEnd);
      $el.remove();
    }
  }, 700);
}

// Positioning 
function positionNotification($el, config) {
  const base = { position: 'fixed' };

  if (config.position === 'timebox-bottom') {
    const timebox = document.querySelector('.timebox');
    let topPx, leftPx;

    if (timebox) {
      const r = timebox.getBoundingClientRect();
      topPx = r.bottom + (config.offsetY || 10);

      const w = $el.outerWidth ? $el.outerWidth() : $el[0].offsetWidth;
      leftPx = (r.left + r.width / 2) - (w / 2);
    } else {
      topPx = 80; // ~5rem
      const w = $el.outerWidth ? $el.outerWidth() : $el[0].offsetWidth;
      leftPx = (window.innerWidth / 2) - (w / 2);
    }

    $el.css({ ...base, top: `${topPx}px`, left: `${leftPx}px` });
    $el.attr('data-position', 'timebox-bottom');

  } else if (config.position === 'phone-area') {
    const phoneSection = document.getElementById('phone-section');
    const rightBar = document.querySelector('.right-bar');

    if (phoneSection && rightBar) {
      const pr = phoneSection.getBoundingClientRect();
      const rr = rightBar.getBoundingClientRect();
      const centerY = pr.top + pr.height / 2;
      const rightPx = window.innerWidth - rr.left + 2;
      $el.css({ ...base, top: `${centerY}px`, right: `${rightPx}px` });
    } else {
      $el.css({ ...base, top: '50%', right: '280px' });
    }
    $el.attr('data-position', 'phone-area');

  } else if (config.position === 'custom' && config.target) {
    const target = document.getElementById(config.target);
    if (target) {
      const r = target.getBoundingClientRect();
      $el.css({
        ...base,
        top: `${r.bottom + (config.offsetY || 0)}px`,
        left: `${r.left + (config.offsetX || 0)}px`
      });
      $el.attr('data-position', 'custom');
    }

  } else if (config.position === 'top-right') {
    $el.css({ ...base, top: '2rem', right: '2rem' });
    $el.attr('data-position', 'top-right');

  } else if (config.position === 'rightbar-left') {
    // Position to the left of rightbar with stacking
    const rightBar = document.querySelector('.right-bar');
    const existingNotifs = document.querySelectorAll('.notification[data-position="rightbar-left"]');
    const stackOffset = existingNotifs.length * 50; // 50px per notification
    
    if (rightBar) {
      const rr = rightBar.getBoundingClientRect();
      $el.css({ 
        ...base, 
        top: `${80 + stackOffset}px`, 
        right: `${window.innerWidth - rr.left + 10}px` 
      });
    } else {
      $el.css({ ...base, top: `${80 + stackOffset}px`, right: '280px' });
    }
    $el.attr('data-position', 'rightbar-left');

  } else if (config.position === 'top-left') {
    $el.css({ ...base, top: '2rem', left: '2rem' });
    $el.attr('data-position', 'top-left');

  } else if (config.position === 'bottom-right') {
    $el.css({ ...base, bottom: '2rem', right: '2rem' });
    $el.attr('data-position', 'bottom-right');

  } else if (config.position === 'bottom-left') {
    $el.css({ ...base, bottom: '2rem', left: '2rem' });
    $el.attr('data-position', 'bottom-left');

  } else {
    $el.css({ ...base, top: '2rem', right: '2rem' });
    $el.attr('data-position', 'top-right');
  }
}
