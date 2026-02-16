// JS Module Configuration - Categorized Structure
window.SystemModules = {
  // Utils - Base systems and helpers (load first)
  utils: [
    "modal", // Base modal system (ModalTabSystem)
    "tooltip", // Tooltip helper
    "notification", // Toast notification helpers
    "accordion", // Event binding helper
  ],

  // UI - Passage render driven components
  ui: [
    "layout", // Passage content wrapper / layout (load first)
    "topbar", // Top navigation bar
    "rightbar", // Right sidebar
    "phone/utils",
    "phone/config",
    "phone/shared-contacts",
    "phone/shared-meetup",
    "phone/shared-topics",
    "phone/phone-messages",
    "phone/phone-contacts",
    "phone/phone-calendar",
    "phone/phone-fotogram",
    "phone/phone-finder",
    "phone/topic-system",
    "phone/phone-camera",
    "phone/phone-gallery",
    "phone/index", // Main entry – overlay, events (load last)
    "map", // Map overlay (injects into rightbar)
    "startscreen", // Start screen handler
    "mainmenu", // Main menu sliding panel
    "debug", // Debug floating panel
    "toggle", // Custom Toggle Switch
    "dropdown", // Custom Dropdown
  ],

  // Modal - Modal.create() based dialogs
  modal: [
    "saveload", // Save/Load modal
    "settings", // Settings modal (tabs)
    "stats", // Stats modal (tabs)
    "relations", // Relations modal
    "character", // Character modal (tabs)
    "journal", // Journal modal (tabs)
  ],

  // System - Core game logic
  system: [
    "wardrobe", // Wardrobe macro handler
    "location", // Location background handler
    "shopping", // Shop cart/checkout handler
    "restaurant", // Restaurant menu (food + drink, pay, effects)
  ],
};

// CSS Module Configuration - Load order matters!
window.SystemCSS = {
  // Base - Variables, reset, body styles (MUST load first)
  base: [
    "variables", // CSS custom properties (:root)
    "reset", // Body, links, scrollbars
    "icons", // Icon system (SVG masks)
  ],

  // Layout - Page structure, topbar, rightbar, passages
  layout: [
    "structure", // #passages, .page-wrapper, body states
    "topbar", // Top navigation bar
    "rightbar", // Right sidebar + stats
    "mainmenu", // Main menu sliding panel
  ],

  // UI - Reusable components
  ui: [
    "buttons", // All button variants
    "modals", // Modal/overlay system
    "dialog", // Dialog system
    "tabs", // Tab navigation
    "forms", // Inputs, selects, sliders
    "navigation", // Navigation cards (hover accordion)
    "settings", // Settings modal controls
    "toggle", // Custom toggle switch
    "dropdown", // Custom dropdown menu
  ],

  // Screens - Full page layouts
  screens: [
    "welcome", // Seductive landing + age modal
    "startscreen", // Start screen with logo
    "gamesetup", // Game setup accordion
    "prologue", // Prologue backstory system
  ],

  // Systems - Game feature modules
  systems: [
    "phone", // Phone mockup + full overlay
    "phone-camera", // Phone camera app styles
    "phone-gallery", // Phone gallery folders + grid
    "phone-fotogram", // Phone Fotogram app
    "map", // Map section + full modal
    "wardrobe", // Wardrobe system
    "shopping", // Shop system
    "restaurant", // Restaurant menu UI
    "inventory", // Inventory system
    "relations", // Relations modal
    "stats", // Stats modal styling
    "journal", // Journal modal styling
    "quest", // Quest prompt system
    "profile", // Profile system
    "character", // Character interaction
    "character-appearance", // Character modal – Appearance tab (body diagram, pointers, info panels)
    "character-outfit", // Character modal – Outfit display (outfit list, cards, tooltips)
    "saveload", // Save/load modal
    "alarm", // Alarm clock system
  ],

  // Utils - Helpers (load last)
  utils: [
    "debug", // Debug panel styling
    "notifications", // Toast notifications
    "tooltips", // Tooltip popups
    "animations", // @keyframes
    "utilities", // Utility classes (flex, spacing, text, etc.)
    "media", // Image and video containers
  ],
};
