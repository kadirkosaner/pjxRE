// Modal Init
window.ModalInit = function (API) {
    window.ModalTabSystem = {
        currentModal: null,
        activeTab: null,
        API: API,

        create: function (config) {
            // config = { id, title, tabs: [{id, label, content}], width, maxHeight }
            this.close();

            const hasTabs = config.tabs && config.tabs.length > 1;

            const tabHeaders = hasTabs ? config.tabs.map((tab, index) =>
                `<div class="modal-tab" data-tab="${tab.id}" ${index === 0 ? 'data-active="true"' : ''}>${tab.label}</div>`
            ).join('') : '';

            const tabContents = config.tabs.map((tab, index) =>
                `<div class="modal-tab-content" data-tab-content="${tab.id}" ${index === 0 ? 'data-active="true"' : ''}>${tab.content}</div>`
            ).join('');

            const styleParts = [`width: ${config.width || '800px'}`, `max-height: ${config.maxHeight || '90vh'}`];
            if (config.borderRadius) styleParts.push(`border-radius: ${config.borderRadius}`);
            const modalStyle = styleParts.join('; ');
            const modalHTML = `
                <div class="overlay overlay-dark modal-overlay active" data-modal="${config.id}">
                    <div class="modal" style="${modalStyle}">
                        <div class="modal-header">
                            <div class="modal-title">${config.title}</div>
                            ${hasTabs ? `<div class="modal-tabs">${tabHeaders}</div>` : ''}
                                <button class="close-btn" id="main-menu-close">
                                    <span class="icon icon-close icon-18"></span>
                                </button>
                        </div>
                        <div class="modal-content">
                            ${tabContents}
                        </div>
                    </div>
                </div>
            `;

            this.API.$('body').append(modalHTML);
            this.API.$('body').addClass('modal-open');
            this.currentModal = config.id;
            this.activeTab = config.tabs[0].id;
            this.attachEvents();
        },

        attachEvents: function () {
            const self = this;

            this.API.$('.modal-tab').on('click', function () {
                const tabId = self.API.$(this).data('tab');
                self.switchTab(tabId);
            });

            this.API.$(`.modal-overlay[data-modal="${this.currentModal}"] .close-btn`).on('click', () => this.close());

            this.API.$('.modal-overlay').on('click', function (e) {
                if (self.API.$(e.target).hasClass('modal-overlay')) {
                    self.close();
                }
            });
        },

        switchTab: function (tabId) {
            this.API.$('.modal-tab').removeAttr('data-active');
            this.API.$(`.modal-tab[data-tab="${tabId}"]`).attr('data-active', 'true');

            this.API.$('.modal-tab-content').removeAttr('data-active');
            this.API.$(`.modal-tab-content[data-tab-content="${tabId}"]`).attr('data-active', 'true');

            this.activeTab = tabId;
        },

        updateTabContent: function (tabId, content) {
            this.API.$(`.modal-tab-content[data-tab-content="${tabId}"]`).html(content);
        },

        close: function () {
            // Only remove current modal if it exists
            if (this.currentModal) {
                this.API.$(`.modal-overlay[data-modal="${this.currentModal}"]`).remove();
            }
            this.API.$('body').removeClass('modal-open');
            this.currentModal = null;
            this.activeTab = null;
        },

        // Generic Confirmation Logic
        confirm: function (title, message, onConfirm, onCancel, type = 'warning') {
            this.close(); // Close any existing modal

            let iconClass = 'icon-alert';
            if (type === 'danger') iconClass = 'icon-alert';
            if (type === 'info') iconClass = 'icon-info';

            // Create modal content (matching SaveLoad structure)
            const content = `
                <div class="confirmation-content">
                    <div class="confirmation-icon">
                        <span class="icon ${iconClass}"></span>
                    </div>
                    <div class="confirmation-message">${message}</div>
                    <div class="confirmation-actions">
                        <button class="btn" id="confirm-cancel">CANCEL</button>
                        <button class="btn btn-danger" id="confirm-ok">CONFIRM</button>
                    </div>
                </div>
            `;

            // Create modal HTML directly (like SaveLoad does)
            const modalHTML = `
                <div class="overlay overlay-dark modal-overlay active" id="confirmation-overlay">
                    <div class="modal" style="width: 500px; max-width: 90vw;">
                        <div class="modal-header">
                            <span class="modal-title">${title}</span>
                            <button class="close-btn" id="confirmation-close">
                                <span class="icon icon-close icon-18"></span>
                            </button>
                        </div>
                        <div class="modal-content">
                            ${content}
                        </div>
                    </div>
                </div>
            `;

            this.API.$('body').append(modalHTML);
            this.currentModal = 'confirmation-modal';

            // Attach events
            const self = this;

            // Helper function to close confirmation modal
            const closeConfirmation = function () {
                self.API.$('#confirmation-overlay').remove();
                self.currentModal = null;
            };

            this.API.$('#confirm-ok').on('click', function () {
                if (onConfirm) onConfirm();
                closeConfirmation();
            });

            this.API.$('#confirm-cancel').on('click', function () {
                if (onCancel) onCancel();
                closeConfirmation();
            });

            this.API.$('#confirmation-close').on('click', function () {
                if (onCancel) onCancel();
                closeConfirmation();
            });

            // Click outside to close
            this.API.$('#confirmation-overlay').on('click', function (e) {
                if (e.target === this) {
                    if (onCancel) onCancel();
                    closeConfirmation();
                }
            });
        },

        // Prompt with Input Field
        prompt: function (title, message, placeholder, onConfirm, onCancel) {
            this.close(); // Close any existing modal

            // Create modal content with input
            const content = `
                <div class="confirmation-content">
                    <div class="confirmation-message">${message}</div>
                    <input type="text" class="prompt-input" id="prompt-input" placeholder="${placeholder || ''}" autocomplete="off">
                    <div class="confirmation-actions">
                        <button class="btn" id="prompt-cancel">CANCEL</button>
                        <button class="btn btn-primary" id="prompt-ok">OK</button>
                    </div>
                </div>
            `;

            // Create modal HTML
            const modalHTML = `
                <div class="overlay overlay-dark modal-overlay active" id="prompt-overlay">
                    <div class="modal" style="width: 500px; max-width: 90vw;">
                        <div class="modal-header">
                            <span class="modal-title">${title}</span>
                            <button class="close-btn" id="prompt-close">
                                <span class="icon icon-close icon-18"></span>
                            </button>
                        </div>
                        <div class="modal-content">
                            ${content}
                        </div>
                    </div>
                </div>
            `;

            this.API.$('body').append(modalHTML);
            this.currentModal = 'prompt-modal';

            // Focus input
            setTimeout(() => this.API.$('#prompt-input').focus(), 100);

            // Attach events
            const self = this;

            const closePrompt = function () {
                self.API.$('#prompt-overlay').remove();
                self.currentModal = null;
            };

            const submitValue = function () {
                const value = self.API.$('#prompt-input').val().trim();
                if (value && onConfirm) onConfirm(value);
                closePrompt();
            };

            this.API.$('#prompt-ok').on('click', submitValue);

            this.API.$('#prompt-input').on('keypress', function (e) {
                if (e.which === 13) submitValue(); // Enter key
            });

            this.API.$('#prompt-cancel').on('click', function () {
                if (onCancel) onCancel();
                closePrompt();
            });

            this.API.$('#prompt-close').on('click', function () {
                if (onCancel) onCancel();
                closePrompt();
            });

            // Click outside to close
            this.API.$('#prompt-overlay').on('click', function (e) {
                if (e.target === this) {
                    if (onCancel) onCancel();
                    closePrompt();
                }
            });
        }
    };
};
