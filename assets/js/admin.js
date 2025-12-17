/**
 * Spa Configurator Admin JavaScript
 */

(function($) {
    'use strict';

    class SpaAdmin {
        constructor() {
            this.init();
        }

        init() {
            this.bindEvents();
            this.initSortable();
        }

        bindEvents() {
            // Image upload handling
            $(document).on('click', '.spa-upload-image', this.handleImageUpload.bind(this));
            $(document).on('click', '.spa-remove-image', this.handleImageRemove.bind(this));
            
            // Option management
            $(document).on('click', '.spa-add-option', this.handleAddOption.bind(this));
            $(document).on('click', '.spa-remove-option', this.handleRemoveOption.bind(this));
            
            // Form submission
            $('#spa-config-form').on('submit', this.handleFormSubmit.bind(this));
            
            // Delete configuration
            $(document).on('click', '.spa-delete-config', this.handleDeleteConfig.bind(this));
        }

        initSortable() {
            $('.spa-options-container').sortable({
                handle: '.spa-option-handle',
                placeholder: 'spa-option-placeholder',
                axis: 'y',
                update: (event, ui) => {
                    this.updateOptionIndexes($(event.target));
                }
            });
        }

        handleImageUpload(e) {
            e.preventDefault();
            
            const button = $(e.currentTarget);
            const targetInput = button.data('target') ? 
                $('#' + button.data('target')) : 
                button.siblings('input[type="hidden"]');
            const preview = button.siblings('.spa-image-preview');
            const removeButton = button.siblings('.spa-remove-image');

            // Create media frame
            const frame = wp.media({
                title: spaAdmin.strings.selectImage,
                button: {
                    text: spaAdmin.strings.useImage
                },
                multiple: false,
                library: {
                    type: 'image'
                }
            });

            // When image is selected
            frame.on('select', () => {
                const attachment = frame.state().get('selection').first().toJSON();
                
                targetInput.val(attachment.url);
                preview.html(`<img src="${attachment.url}" alt="">`);
                removeButton.show();
            });

            // Open media frame
            frame.open();
        }

        handleImageRemove(e) {
            e.preventDefault();
            
            const button = $(e.currentTarget);
            const targetInput = button.data('target') ? 
                $('#' + button.data('target')) : 
                button.siblings('input[type="hidden"]');
            const preview = button.siblings('.spa-image-preview');

            targetInput.val('');
            preview.empty();
            button.hide();
        }

        handleAddOption(e) {
            e.preventDefault();
            
            const button = $(e.currentTarget);
            const type = button.data('type');
            const container = $(`#${type}-options`);
            const template = $('#option-row-template').html();
            const index = container.children('.spa-option-row').length;
            
            // Replace placeholders in template
            const newRow = template
                .replace(/{TYPE}/g, type)
                .replace(/{INDEX}/g, index);
            
            const $newRow = $(newRow);
            container.append($newRow);
            
            // Re-initialize sortable
            this.initSortable();
        }

        handleRemoveOption(e) {
            e.preventDefault();
            
            const button = $(e.currentTarget);
            const row = button.closest('.spa-option-row');
            const container = row.parent();
            
            row.fadeOut(300, () => {
                row.remove();
                this.updateOptionIndexes(container);
            });
        }

        updateOptionIndexes(container) {
            container.children('.spa-option-row').each((index, element) => {
                const $element = $(element);
                const type = container.attr('id').replace('-options', '');
                
                $element.attr('data-index', index);
                
                // Update input names
                $element.find('input').each((i, input) => {
                    const $input = $(input);
                    const name = $input.attr('name');
                    if (name) {
                        const newName = name.replace(/\[\d+\]/, `[${index}]`);
                        $input.attr('name', newName);
                    }
                });
            });
        }

        handleFormSubmit(e) {
            e.preventDefault();
            
            const form = $(e.currentTarget);
            const submitButton = form.find('button[type="submit"]');
            const originalText = submitButton.text();
            
            // Show loading state
            submitButton.prop('disabled', true).text('Saving...');
            
            // Serialize form data
            const formData = new FormData(form[0]);
            formData.append('action', 'spa_admin_save_config');
            formData.append('nonce', spaAdmin.nonce);
            
            $.ajax({
                url: spaAdmin.ajaxUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: (response) => {
                    if (response.success) {
                        this.showNotice('success', response.data.message);
                        
                        // Redirect to main page after a delay
                        setTimeout(() => {
                            window.location.href = 'admin.php?page=spa-configurator';
                        }, 1500);
                    } else {
                        this.showNotice('error', response.data || 'An error occurred.');
                    }
                },
                error: () => {
                    this.showNotice('error', 'An error occurred while saving.');
                },
                complete: () => {
                    submitButton.prop('disabled', false).text(originalText);
                }
            });
        }

        handleDeleteConfig(e) {
            e.preventDefault();
            
            const button = $(e.currentTarget);
            const configId = button.data('config-id');
            
            if (!confirm(spaAdmin.strings.confirmDelete)) {
                return;
            }
            
            const card = button.closest('.spa-config-card');
            
            $.ajax({
                url: spaAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'spa_admin_delete_config',
                    config_id: configId,
                    nonce: spaAdmin.nonce
                },
                success: (response) => {
                    if (response.success) {
                        card.fadeOut(300, () => {
                            card.remove();
                            this.showNotice('success', response.data.message);
                        });
                    } else {
                        this.showNotice('error', response.data || 'An error occurred.');
                    }
                },
                error: () => {
                    this.showNotice('error', 'An error occurred while deleting.');
                }
            });
        }

        showNotice(type, message) {
            const notice = $(`
                <div class="notice notice-${type} is-dismissible">
                    <p>${message}</p>
                    <button type="button" class="notice-dismiss">
                        <span class="screen-reader-text">Dismiss this notice.</span>
                    </button>
                </div>
            `);
            
            $('.wrap h1').after(notice);
            
            // Auto-dismiss success notices
            if (type === 'success') {
                setTimeout(() => {
                    notice.fadeOut();
                }, 3000);
            }
            
            // Handle manual dismiss
            notice.find('.notice-dismiss').on('click', () => {
                notice.fadeOut();
            });
        }
    }

    // Initialize when document is ready
    $(document).ready(() => {
        new SpaAdmin();
    });

})(jQuery);