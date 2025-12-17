/**
 * Spa Configurator Editor JavaScript
 * Handles functionality in Elementor editor
 */

(function($) {
    'use strict';

    // Re-initialize configurators when content changes in editor
    function initSpaConfigurators() {
        $('.spa-configurator-container').each(function() {
            // Remove any existing instances to prevent duplicates
            $(this).off('.spa-configurator');
            
            // Initialize the configurator (simplified for editor)
            const container = $(this);
            const hotspots = container.find('.spa-hotspot');
            
            // Add basic hover effects for editor preview
            hotspots.on('mouseenter.spa-configurator', function() {
                $(this).css('transform', 'translate(-50%, -50%) scale(1.2)');
            }).on('mouseleave.spa-configurator', function() {
                $(this).css('transform', 'translate(-50%, -50%) scale(1)');
            });
        });
    }

    // Initialize when Elementor editor loads
    $(window).on('elementor/frontend/init', function() {
        // For editor mode
        if (typeof elementorFrontend !== 'undefined') {
            elementorFrontend.hooks.addAction('frontend/element_ready/spa-configurator.default', function($scope) {
                initSpaConfigurators();
            });
        }
    });

    // Also initialize on document ready for non-Elementor contexts
    $(document).ready(function() {
        initSpaConfigurators();
    });

    // Dynamic shell options dropdown functionality
    function updateDefaultShellOptions() {
        // Wait for Elementor to be ready
        if (typeof elementor === 'undefined' || typeof elementor.hooks === 'undefined') {
            setTimeout(updateDefaultShellOptions, 500);
            return;
        }

        // Listen for widget panel opening
        elementor.hooks.addAction('panel/open_editor/widget/spa-configurator', function(panel, model, view) {
            
            // Function to populate shell dropdown
            function populateShellDropdown() {
                try {
                    // Get current shell options from the model
                    const shellOptions = model.get('settings').get('shell_options');
                    const options = {'': 'Select Shell Option'};
                    
                    if (shellOptions && shellOptions.models) {
                        shellOptions.models.forEach(function(shell) {
                            const shellName = shell.get('shell_name');
                            if (shellName) {
                                options[shellName] = shellName;
                            }
                        });
                    }
                    
                    // Find and update the default_shell_selection control
                    const controlView = view.children.find(function(child) {
                        return child.model && child.model.get('name') === 'default_shell_selection';
                    });
                    
                    if (controlView && controlView.model) {
                        controlView.model.set('options', options);
                        if (controlView.render) {
                            controlView.render();
                        }
                    }
                } catch (error) {
                    console.log('Shell dropdown update error:', error);
                }
            }

            // Initial population after a short delay
            setTimeout(populateShellDropdown, 200);
            
            // Listen for changes to shell_options
            if (model.get('settings')) {
                model.get('settings').on('change:shell_options', function() {
                    setTimeout(populateShellDropdown, 100);
                });
            }
        });
    }

    // Initialize dynamic shell options
    updateDefaultShellOptions();

})(jQuery);