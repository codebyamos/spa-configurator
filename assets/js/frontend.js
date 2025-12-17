/**
 * Spa Configurator Frontend JavaScript
 * Handles hotspot interactions, popups, and image replacement
 */

(function($) {
    'use strict';

    // Check if jQuery is loaded
    if (typeof $ === 'undefined') {
        console.error('Spa Configurator: jQuery is not loaded!');
        return;
    }
    
    console.log('Spa Configurator: Script loaded, jQuery available');

    class SpaConfigurator {
        constructor(container) {
            console.log('Spa Configurator: Constructor called with container:', container);
            this.container = $(container);
            this.widgetId = this.container.data('widget-id');
            console.log('Spa Configurator: Widget ID:', this.widgetId);
            this.configData = this.getConfigurationData();
            console.log('Spa Configurator: Config data:', this.configData);
            this.currentSelection = {
                cabinet: null,
                shell: null
            };
            this.hasUserSelection = false; // Track if user has made any selections
            this.currentPopupHotspot = null; // Track current hotspot for repositioning
            
            this.init();
        }

        init() {
            this.bindEvents();
            this.createPopupContainer();
            this.createMobileAccordion();
            this.makeResponsive();
            
            // Initialize with base shell image
            this.initializeDefaultImage();
            
            // Initialize default selections to avoid "undefined"
            this.initializeDefaultSelections();
            
            // Update title with defaults
            this.updateTitle();
        }

        initializeDefaultSelections() {
            // Set default shell if not already set and show in title
            const defaultShell = this.getDefaultShellOption();
            if (defaultShell && this.configData.defaultShell) {
                // Only set as current selection if it matches configured default
                this.currentSelection.shell = defaultShell;
                this.hasUserSelection = true; // Show the title
            }
            
            // Set default cabinet if configured
            if (this.configData.defaultCabinet && this.configData.cabinetOptions) {
                const defaultCabinet = this.configData.cabinetOptions.find(cabinet => 
                    cabinet.option_name === this.configData.defaultCabinet
                );
                if (defaultCabinet) {
                    this.currentSelection.cabinet = defaultCabinet;
                    this.hasUserSelection = true; // Show the title
                }
            }
        }

        getConfigurationData() {
            const dataScript = $(`.spa-configurator-data[data-widget-id="${this.widgetId}"]`);
            console.log('Spa Configurator: Looking for data script with selector:', `.spa-configurator-data[data-widget-id="${this.widgetId}"]`);
            console.log('Spa Configurator: Found data script:', dataScript.length > 0);
            if (dataScript.length) {
                const jsonText = dataScript.text();
                console.log('Spa Configurator: JSON text:', jsonText);
                try {
                    const parsed = JSON.parse(jsonText);
                    console.log('Spa Configurator: Parsed data:', parsed);
                    return parsed;
                } catch (error) {
                    console.error('Spa Configurator: Error parsing JSON:', error);
                    return {};
                }
            }
            console.log('Spa Configurator: No data script found, returning empty object');
            return {};
        }

        bindEvents() {
            console.log('Spa Configurator: Binding events for container:', this.container);
            
            // Hotspot click events
            this.container.on('click', '.spa-hotspot', (e) => {
                console.log('Spa Configurator: Hotspot click event triggered');
                e.preventDefault();
                e.stopPropagation();
                this.handleHotspotClick($(e.currentTarget));
            });

            // Close popup when clicking outside
            $(document).on('click', (e) => {
                if (!$(e.target).closest('.spa-popup, .spa-hotspot, .spa-accordion-header, .spa-accordion-content').length) {
                    this.closePopup();
                }
            });

            // Window resize handling
            $(window).on('resize', () => {
                this.makeResponsive();
                this.closePopup(); // Close popup on resize to avoid positioning issues
            });

            // Scroll handling for popup repositioning
            $(window).on('scroll', () => {
                this.updatePopupPosition();
            });

            // Option selection
            $(document).on('click', '.spa-option-item', (e) => {
                e.preventDefault();
                this.handleOptionSelection($(e.currentTarget));
            });

            // Escape key to close popup
            $(document).on('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closePopup();
                }
            });
            
            console.log('Spa Configurator: Events bound successfully');
        }

        handleHotspotClick(hotspot) {
            console.log('Spa Configurator: Hotspot clicked:', hotspot);
            const hotspotType = hotspot.data('hotspot-type');
            const hotspotName = hotspot.data('hotspot-name');
            console.log('Spa Configurator: Hotspot type:', hotspotType, 'name:', hotspotName);
            
            if (hotspotType === 'selector') {
                console.log('Spa Configurator: Showing selector popup');
                this.showSelectorPopup(hotspot, hotspotName);
            } else if (hotspotType === 'top_angle') {
                console.log('Spa Configurator: Showing top angle popup');
                this.showTopAnglePopup(hotspot);
            } else if (hotspotType === 'qr_code') {
                console.log('Spa Configurator: Showing QR code popup');
                this.showQRCodePopup(hotspot);
            } else {
                console.log('Spa Configurator: Unknown hotspot type:', hotspotType);
            }
        }

        showSelectorPopup(hotspot, hotspotName) {
            const position = this.getHotspotPosition(hotspot);
            let options = [];
            let sectionTitle = '';

            // Determine which options to show based on hotspot name
            if (hotspotName.toLowerCase().includes('cabinet') && this.configData.enableCabinetOptions === 'yes') {
                options = this.configData.cabinetOptions || [];
                sectionTitle = this.configData.cabinetSectionTitle || 'Cabinet Options';
            } else if (hotspotName.toLowerCase().includes('shell') && this.configData.enableShellOptions === 'yes') {
                options = this.configData.shellOptions || [];
                sectionTitle = this.configData.shellSectionTitle || 'Shell Options';
            }

            if (options.length === 0) {
                console.warn('No options found or enabled for hotspot:', hotspotName);
                return;
            }

            const popupContent = this.createSelectorPopupContent(options, sectionTitle, hotspotName);
            this.showPopup(popupContent, position, hotspot);
        }

        showTopAnglePopup(hotspot) {
            const topAngleImage = hotspot.data('top-angle-image');
            
            if (!topAngleImage) {
                console.warn('No top angle image found for hotspot');
                return;
            }

            // For top angle, center the popup on screen instead of positioning relative to hotspot
            const position = {
                top: $(window).scrollTop() + ($(window).height() / 2),
                left: $(window).width() / 2,
                centered: true // Flag to indicate this should be centered
            };
            
            const popupContent = `
                <div class="spa-top-angle-popup">
                    <div class="spa-popup-header">
                        <h3>Top Angle View</h3>
                        <button class="spa-popup-close">&times;</button>
                    </div>
                    <div class="spa-popup-body">
                        <img src="${topAngleImage}" alt="Top Angle View" class="spa-top-angle-image">
                    </div>
                </div>
            `;
            
            this.showPopup(popupContent, position);
        }

        showQRCodePopup(hotspot) {
            const qrCodeImage = hotspot.data('qr-code-image');
            
            if (!qrCodeImage) {
                console.warn('No QR code image found for hotspot');
                return;
            }

            // For QR code, center the popup on screen (same as top angle)
            const position = {
                top: $(window).scrollTop() + ($(window).height() / 2),
                left: $(window).width() / 2,
                centered: true // Flag to indicate this should be centered
            };
            
            const popupContent = `
                <div class="spa-qr-code-popup">
                    <div class="spa-popup-header">
                        <h3>Scan QR code to open in AR</h3>
                        <button class="spa-popup-close">&times;</button>
                    </div>
                    <div class="spa-popup-body">
                        <img src="${qrCodeImage}" alt="QR Code for AR" class="spa-qr-code-image">
                    </div>
                </div>
            `;
            
            this.showPopup(popupContent, position);
        }

        createSelectorPopupContent(options, sectionTitle, hotspotType) {
            let optionsHtml = '';
            
            options.forEach((option, index) => {
                const isSelected = this.isOptionSelected(option, hotspotType);
                const selectedClass = isSelected ? 'selected' : '';
                const isShellOption = hotspotType.toLowerCase().includes('shell');
                
                // Get correct field names based on option type
                const optionName = isShellOption ? option.shell_name : option.option_name;
                const optionImage = option.option_image?.url || option.thumbnail_image?.url || '';
                
                optionsHtml += `
                    <div class="spa-option-item ${selectedClass}" 
                         data-option-type="${isShellOption ? 'shell' : 'cabinet'}"
                         data-option-index="${index}">
                        <div class="spa-option-image">
                            <img src="${optionImage}" alt="${optionName}" />
                        </div>
                        <div class="spa-option-name">${optionName}</div>
                    </div>
                `;
            });

            // Calculate grid columns and popup width based on screen size
            const isMobile = window.innerWidth <= 768;
            console.log('Screen width:', window.innerWidth, 'Mobile mode:', isMobile);
            const maxPerRow = isMobile ? 2 : 4; // 2 per row on mobile, 4 on desktop
            const optionsInFirstRow = Math.min(options.length, maxPerRow);
            const optionWidth = isMobile ? 70 : 80; // Smaller options on mobile
            const gap = isMobile ? 6 : 8;
            const padding = isMobile ? 20 : 30;
            
            console.log('Popup sizing - Options per row:', optionsInFirstRow, 'Option width:', optionWidth, 'Gap:', gap, 'Padding:', padding);
            
            // Width based on first row (which determines popup width)
            const calculatedWidth = (optionsInFirstRow * optionWidth) + ((optionsInFirstRow - 1) * gap) + padding;
            console.log('Calculated popup width:', calculatedWidth);
            
            // Create grid style with exact columns for first row
            const gridStyle = `grid-template-columns: repeat(${optionsInFirstRow}, ${optionWidth}px); gap: ${gap}px;`;
            console.log('Grid style:', gridStyle);
            
            return `
                <div class="spa-selector-popup" style="width: ${calculatedWidth}px;">
                    <div class="spa-popup-header">
                        <h3>${sectionTitle}</h3>
                        <button class="spa-popup-close">&times;</button>
                    </div>
                    <div class="spa-popup-body">
                        <div class="spa-options-grid" style="${gridStyle}">
                            ${optionsHtml}
                        </div>
                    </div>
                </div>
            `;
        }

        isOptionSelected(option, hotspotType) {
            if (hotspotType.toLowerCase().includes('cabinet')) {
                return this.currentSelection.cabinet && 
                       this.currentSelection.cabinet.option_name === option.option_name;
            } else if (hotspotType.toLowerCase().includes('shell')) {
                return this.currentSelection.shell && 
                       this.currentSelection.shell.shell_name === option.shell_name;
            }
            return false;
        }

        handleOptionSelection(optionElement) {
            const optionType = optionElement.data('option-type');
            const optionIndex = optionElement.data('option-index');
            
            // Remove selected class from siblings
            optionElement.siblings().removeClass('selected');
            optionElement.addClass('selected');
            
            // Update current selection
            if (optionType === 'cabinet') {
                this.currentSelection.cabinet = this.configData.cabinetOptions[optionIndex];
            } else if (optionType === 'shell') {
                this.currentSelection.shell = this.configData.shellOptions[optionIndex];
            }
            
            // Mark that user has made a selection
            this.hasUserSelection = true;
            
            // Update the main image and title
            this.updateMainImage();
            this.updateTitle();
            
            // Close popup after selection
            setTimeout(() => {
                this.closePopup();
            }, 300);
        }

        updateMainImage() {
            const mainImage = this.container.find('.spa-configurator-base-image');
            let newImageUrl = '';
            
            // Determine which shell to show
            let currentShell = this.currentSelection.shell;
            if (!currentShell) {
                // No shell selected, use default/base shell
                currentShell = this.getDefaultShellOption();
            }
            
            if (currentShell) {
                console.log('Current shell:', currentShell);
                console.log('Available shell properties:', Object.keys(currentShell));
                
                // Determine which cabinet version to show
                if (this.currentSelection.cabinet) {
                    // Cabinet is selected, show that specific cabinet version of the shell
                    const cabinetName = this.currentSelection.cabinet.option_name;
                    console.log('Selected cabinet:', cabinetName);
                    
                    // Try new cabinet_images structure first (preferred method)
                    if (currentShell.cabinet_images && Array.isArray(currentShell.cabinet_images)) {
                        console.log('Using new cabinet_images structure');
                        const cabinetImage = currentShell.cabinet_images.find(cabinet => 
                            cabinet.cabinet_name === cabinetName
                        );
                        console.log('Found cabinet match:', cabinetImage);
                        if (cabinetImage && cabinetImage.cabinet_image && cabinetImage.cabinet_image.url) {
                            newImageUrl = cabinetImage.cabinet_image.url;
                            console.log('Found image URL from new structure:', newImageUrl);
                        }
                    }
                    
                    // Fallback to old dynamic structure if new structure doesn't have the image
                    if (!newImageUrl) {
                        console.log('No image found with new structure, trying old structure');
                        const cabinetKey = cabinetName.toLowerCase().replace(/\s+/g, '') + '_image';
                        console.log('Looking for cabinet key:', cabinetKey);
                        newImageUrl = currentShell[cabinetKey]?.url;
                        console.log('Found image URL from old structure:', newImageUrl);
                        
                        // Final fallback to hardcoded fields
                        if (!newImageUrl) {
                            if (cabinetName.toLowerCase() === 'slate' && currentShell.slate_image?.url) {
                                newImageUrl = currentShell.slate_image.url;
                            } else if (cabinetName.toLowerCase() === 'graphite' && currentShell.graphite_image?.url) {
                                newImageUrl = currentShell.graphite_image.url;
                            }
                        }
                    }
                } else {
                    // No cabinet selected, show shell's default image based on config
                    const defaultCabinet = this.configData.defaultCabinet || '';
                    console.log('No cabinet selected, using default:', defaultCabinet);
                    
                    if (defaultCabinet) {
                        // Try new cabinet_images structure first
                        if (currentShell.cabinet_images && Array.isArray(currentShell.cabinet_images)) {
                            const cabinetImage = currentShell.cabinet_images.find(cabinet => 
                                cabinet.cabinet_name === defaultCabinet
                            );
                            if (cabinetImage && cabinetImage.cabinet_image && cabinetImage.cabinet_image.url) {
                                newImageUrl = cabinetImage.cabinet_image.url;
                            }
                        }
                        
                        // Fallback to old dynamic structure
                        if (!newImageUrl) {
                            const cabinetKey = defaultCabinet.toLowerCase().replace(/\s+/g, '') + '_image';
                            newImageUrl = currentShell[cabinetKey]?.url;
                        }
                    }
                    
                    // Final fallback to hardcoded structure
                    if (!newImageUrl) {
                        const imageField = (defaultCabinet || 'slate').toLowerCase() + '_image';
                        newImageUrl = currentShell[imageField]?.url || 
                                    currentShell.slate_image?.url || 
                                    currentShell.graphite_image?.url;
                    }
                }
            }
            
            // Apply the new image with fade effect
            if (newImageUrl && newImageUrl !== mainImage.attr('src')) {
                mainImage.fadeOut(200, () => {
                    mainImage.attr('src', newImageUrl).fadeIn(200);
                });
            }
            
            console.log('Updated main image:', {
                cabinet: this.currentSelection.cabinet?.option_name || 'default (' + (this.configData.defaultCabinet || 'slate') + ')',
                shell: currentShell?.shell_name || 'none',
                imageUrl: newImageUrl
            });
        }

        getDefaultShellOption() {
            // Get the default shell option from config data
            if (this.configData.shellOptions && this.configData.shellOptions.length > 0) {
                console.log('Available shell options:', this.configData.shellOptions);
                console.log('Default shell from config:', this.configData.defaultShell);
                
                // Look for the configured default shell
                if (this.configData.defaultShell) {
                    const defaultShell = this.configData.shellOptions.find(shell => 
                        shell.shell_name === this.configData.defaultShell
                    );
                    if (defaultShell) {
                        console.log('Found configured default shell:', defaultShell);
                        return defaultShell;
                    }
                }
                // Fallback to first shell option
                console.log('Using first shell option as default:', this.configData.shellOptions[0]);
                return this.configData.shellOptions[0];
            }
            console.log('No shell options found');
            return null;
        }

        initializeDefaultImage() {
            // Set the default shell image on initial load using configured defaults
            const defaultShell = this.getDefaultShellOption();
            if (defaultShell) {
                let defaultImageUrl = '';
                
                // Use configured default cabinet
                const defaultCabinet = this.configData.defaultCabinet || '';
                if (defaultCabinet) {
                    // Try new dynamic structure first
                    const cabinetKey = defaultCabinet.toLowerCase().replace(/\s+/g, '') + '_image';
                    defaultImageUrl = defaultShell[cabinetKey]?.url;
                    
                    // Fallback to old structure
                    if (!defaultImageUrl) {
                        const imageField = defaultCabinet.toLowerCase() + '_image';
                        defaultImageUrl = defaultShell[imageField]?.url;
                    }
                }
                
                // Final fallback to any available image
                if (!defaultImageUrl) {
                    defaultImageUrl = defaultShell.slate_image?.url || 
                                    defaultShell.graphite_image?.url;
                }
                
                if (defaultImageUrl) {
                    const mainImage = this.container.find('.spa-configurator-base-image');
                    if (mainImage.attr('src') !== defaultImageUrl) {
                        mainImage.attr('src', defaultImageUrl);
                    }
                    console.log('Initialized with default shell:', defaultShell.shell_name, 'using', defaultCabinet, 'cabinet');
                }
            }
        }

        updateTitle() {
            const titleElement = this.container.find('.spa-configurator-title');
            
            // If no user selections have been made, keep title space but make it invisible
            if (!this.hasUserSelection) {
                titleElement.removeClass('show');
                return;
            }
            
            // Only show selected options if user has made selections (using singular form)
            const selectedOptions = [];
            
            if (this.currentSelection.cabinet && this.configData.enableCabinetOptions === 'yes') {
                // Convert plural section title to singular for selection display
                const singleCabinetTitle = this.configData.cabinetSectionTitle.replace(/s$/, '');
                selectedOptions.push(`${singleCabinetTitle}: ${this.currentSelection.cabinet.option_name}`);
            }
            
            if (this.currentSelection.shell && this.configData.enableShellOptions === 'yes') {
                // Convert plural section title to singular for selection display
                const singleShellTitle = this.configData.shellSectionTitle.replace(/s$/, '');
                // Use shell_name instead of option_name for shells
                selectedOptions.push(`${singleShellTitle}: ${this.currentSelection.shell.shell_name}`);
            }
            
            if (selectedOptions.length > 0) {
                titleElement.text(selectedOptions.join(' | ')).addClass('show');
            } else {
                titleElement.removeClass('show');
            }
        }

        getHotspotPosition(hotspot) {
            const hotspotOffset = hotspot.offset();
            const containerOffset = this.container.offset();
            
            console.log('Hotspot position calculation:');
            console.log('- Hotspot offset:', hotspotOffset);
            console.log('- Container offset:', containerOffset);
            console.log('- Window scroll:', $(window).scrollTop(), $(window).scrollLeft());
            
            return {
                top: hotspotOffset.top,
                left: hotspotOffset.left,
                relativeTop: hotspotOffset.top - containerOffset.top,
                relativeLeft: hotspotOffset.left - containerOffset.left
            };
        }

        createPopupContainer() {
            if ($('#spa-popup-container').length === 0) {
                $('body').append('<div id="spa-popup-container"></div>');
            }
        }

        showPopup(content, position, hotspot = null) {
            this.closePopup(); // Close any existing popup
            
            // Store hotspot reference for repositioning
            this.currentPopupHotspot = hotspot;
            
            const popup = $(`
                <div class="spa-popup" style="display: none;">
                    ${content}
                </div>
            `);
            
            // Add overlay for top angle popups (centered ones)
            if (position.centered) {
                const overlay = $('<div class="spa-popup-overlay"></div>');
                $('#spa-popup-container').append(overlay);
                
                // Show overlay with animation
                setTimeout(() => {
                    overlay.addClass('show');
                }, 50);
                
                // Close popup when clicking overlay
                overlay.on('click', () => {
                    this.closePopup();
                });
            }
            
            $('#spa-popup-container').append(popup);
            
            // Position the popup
            this.positionPopup(popup, position);
            
            // Show popup with animation
            popup.fadeIn(300);
            
            // Bind close button
            popup.find('.spa-popup-close').on('click', () => {
                this.closePopup();
            });
        }

        positionPopup(popup, hotspotPosition) {
            // Check if this should be centered (for top angle view)
            if (hotspotPosition.centered) {
                // For centered popups, don't override the CSS positioning
                popup.css({
                    position: 'fixed',
                    visibility: 'visible',
                    display: 'none',
                    zIndex: 1000000
                });
                return;
            }
            
            console.log('Positioning popup with hotspot position:', hotspotPosition);
            
            // Use fixed positioning and calculate viewport coordinates
            popup.css({
                position: 'fixed',
                visibility: 'hidden',
                display: 'block'
            });
            
            const popupWidth = popup.outerWidth();
            const popupHeight = popup.outerHeight();
            const viewportWidth = $(window).width();
            const viewportHeight = $(window).height();
            
            // Convert page coordinates to viewport coordinates
            const scrollTop = $(window).scrollTop();
            const scrollLeft = $(window).scrollLeft();
            
            console.log('Popup dimensions:', popupWidth, 'x', popupHeight);
            console.log('Viewport:', viewportWidth, 'x', viewportHeight);
            console.log('Scroll position:', scrollLeft, ',', scrollTop);
            
            // Calculate viewport position of hotspot
            const hotspotViewportTop = hotspotPosition.top - scrollTop;
            const hotspotViewportLeft = hotspotPosition.left - scrollLeft;
            
            console.log('Hotspot viewport position:', hotspotViewportLeft, ',', hotspotViewportTop);
            
            // Position popup close to hotspot with small offset
            // Try to position to the right of hotspot first, then above if no space
            let top = hotspotViewportTop - (popupHeight / 2); // Center vertically on hotspot
            let left = hotspotViewportLeft + 30; // 30px to the right of hotspot
            
            console.log('Initial calculated position (right side):', left, ',', top);
            
            // Check if popup fits on the right side
            if (left + popupWidth > viewportWidth - 10) {
                // Not enough space on right, try left side
                left = hotspotViewportLeft - popupWidth - 30;
                console.log('Adjusted to left side:', left);
                
                if (left < 10) {
                    // Not enough space on left either, position above/below
                    left = hotspotViewportLeft - (popupWidth / 2); // Center horizontally
                    top = hotspotViewportTop - popupHeight - 10; // Above hotspot
                    console.log('Adjusted to above hotspot:', left, ',', top);
                    
                    if (top < 10) {
                        top = hotspotViewportTop + 30; // Below hotspot
                        console.log('Adjusted to below hotspot:', top);
                    }
                }
            }
            
            // Ensure popup stays within vertical bounds
            if (top < 10) {
                top = 10;
                console.log('Adjusted top to minimum:', top);
            } else if (top + popupHeight > viewportHeight - 10) {
                top = viewportHeight - popupHeight - 10;
                console.log('Adjusted top to maximum:', top);
            }
            
            // Ensure popup doesn't go negative
            if (top < 0) top = 10;
            if (left < 0) left = 10;
            
            console.log('Final position:', left, ',', top);
            
            popup.css({
                position: 'fixed',
                top: top + 'px',
                left: left + 'px',
                visibility: 'visible',
                display: 'none',
                zIndex: 10000
            });
        }

        updatePopupPosition() {
            const popup = $('#spa-popup-container .spa-popup');
            if (popup.length && this.currentPopupHotspot && !popup.find('.spa-top-angle-popup').length) {
                // Only reposition selector popups, not top angle popups
                const position = this.getHotspotPosition(this.currentPopupHotspot);
                this.positionPopup(popup, position);
            }
        }

        createMobileAccordion() {
            // Check if accordion already exists
            if (this.container.find('.spa-mobile-accordion').length > 0) {
                return;
            }

            // Get all hotspots to create accordion items
            const hotspots = this.container.find('.spa-hotspot');
            if (hotspots.length === 0) {
                return;
            }

            // Create accordion container
            const accordion = $('<div class="spa-mobile-accordion"></div>');

            // Create accordion items for each hotspot
            hotspots.each((index, hotspot) => {
                const $hotspot = $(hotspot);
                const hotspotType = $hotspot.data('hotspot-type');
                const hotspotName = $hotspot.data('hotspot-name');

                if (hotspotType === 'top_angle') {
                    // Create special accordion item for top angle view
                    const accordionItem = $(`
                        <div class="spa-accordion-item" data-hotspot-type="${hotspotType}">
                            <button class="spa-accordion-header" type="button">
                                ${hotspotName}
                                <span class="spa-accordion-icon">▼</span>
                            </button>
                        </div>
                    `);
                    accordion.append(accordionItem);
                } else if (hotspotType === 'qr_code') {
                    // Create special accordion item for QR code view
                    const accordionItem = $(`
                        <div class="spa-accordion-item" data-hotspot-type="${hotspotType}">
                            <button class="spa-accordion-header" type="button">
                                ${hotspotName}
                                <span class="spa-accordion-icon">▼</span>
                            </button>
                        </div>
                    `);
                    accordion.append(accordionItem);
                } else {
                    // Create regular accordion item with options
                    const accordionItem = $(`
                        <div class="spa-accordion-item" data-hotspot-type="${hotspotType}">
                            <button class="spa-accordion-header" type="button">
                                ${hotspotName}
                                <span class="spa-accordion-icon">▼</span>
                            </button>
                            <div class="spa-accordion-content">
                                <div class="spa-options-grid"></div>
                            </div>
                        </div>
                    `);
                    accordion.append(accordionItem);
                }
            });

            // Add accordion after the image container
            this.container.find('.spa-configurator-image-container').after(accordion);

            // Bind accordion events
            this.bindAccordionEvents();
        }

        bindAccordionEvents() {
            // Accordion header click
            this.container.on('click', '.spa-accordion-header', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                const header = $(e.currentTarget);
                const item = header.closest('.spa-accordion-item');
                const content = item.find('.spa-accordion-content');
                const hotspotType = item.data('hotspot-type');

                if (hotspotType === 'top_angle') {
                    // Handle top angle view - show popup directly
                    this.showTopAngleView();
                    return;
                }

                if (hotspotType === 'qr_code') {
                    // Handle QR code view - show popup directly
                    this.showQRCodeView();
                    return;
                }

                // Toggle accordion content
                if (header.hasClass('active')) {
                    header.removeClass('active');
                    content.removeClass('active').slideUp(300);
                } else {
                    // Close other accordions
                    this.container.find('.spa-accordion-header.active').removeClass('active');
                    this.container.find('.spa-accordion-content.active').removeClass('active').slideUp(300);
                    
                    // Open this accordion
                    header.addClass('active');
                    content.addClass('active').slideDown(300);
                    
                    // Load options if not already loaded
                    this.loadAccordionOptions(item, hotspotType);
                }
            });

            // Option selection in accordion
            this.container.on('click', '.spa-accordion-content .spa-option-item', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                this.handleOptionSelection($(e.currentTarget));
            });
        }

        loadAccordionOptions(accordionItem, hotspotType) {
            const optionsGrid = accordionItem.find('.spa-options-grid');
            
            // Skip if already loaded
            if (optionsGrid.children().length > 0) {
                return;
            }

            // Use the same logic as hotspot popup to get options
            let options = [];
            const hotspotName = accordionItem.find('.spa-accordion-header').text().trim();

            // Determine which options to show based on hotspot name (same logic as showSelectorPopup)
            if (hotspotName.toLowerCase().includes('cabinet') && this.configData.enableCabinetOptions === 'yes') {
                options = this.configData.cabinetOptions || [];
            } else if (hotspotName.toLowerCase().includes('shell') && this.configData.enableShellOptions === 'yes') {
                options = this.configData.shellOptions || [];
            }

            if (options.length === 0) {
                console.warn('No options found or enabled for accordion:', hotspotName);
                return;
            }

            // Generate the same option items as the popup
            options.forEach((option, index) => {
                const isShellOption = hotspotName.toLowerCase().includes('shell');
                const optionName = isShellOption ? option.shell_name : option.option_name;
                const optionImage = option.option_image?.url || option.thumbnail_image?.url || '';
                
                const optionElement = $(`
                    <div class="spa-option-item" 
                         data-option-type="${isShellOption ? 'shell' : 'cabinet'}"
                         data-option-index="${index}">
                        <div class="spa-option-image">
                            <img src="${optionImage}" alt="${optionName}" loading="lazy">
                        </div>
                        <div class="spa-option-name">${optionName}</div>
                    </div>
                `);
                optionsGrid.append(optionElement);
            });
        }

        showTopAngleView() {
            // Find the original top angle hotspot and get its data
            const topAngleHotspot = this.container.find('.spa-hotspot[data-hotspot-type="top_angle"]');
            if (topAngleHotspot.length > 0) {
                // Use the original showTopAnglePopup method with the hotspot data
                this.showTopAnglePopup(topAngleHotspot);
            } else {
                console.warn('No top angle hotspot found');
            }
        }

        showQRCodeView() {
            // Find the original QR code hotspot and get its data
            const qrCodeHotspot = this.container.find('.spa-hotspot[data-hotspot-type="qr_code"]');
            if (qrCodeHotspot.length > 0) {
                // Use the original showQRCodePopup method with the hotspot data
                this.showQRCodePopup(qrCodeHotspot);
            } else {
                console.warn('No QR code hotspot found');
            }
        }

        closePopup() {
            const popup = $('#spa-popup-container .spa-popup');
            const overlay = $('#spa-popup-container .spa-popup-overlay');
            
            // Clear hotspot reference
            this.currentPopupHotspot = null;
            
            if (popup.length) {
                popup.fadeOut(200, () => {
                    popup.remove();
                });
            }
            
            if (overlay.length) {
                overlay.removeClass('show');
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }
        }

        makeResponsive() {
            // Ensure hotspots stay in correct relative positions
            const imageContainer = this.container.find('.spa-configurator-image-container');
            const image = imageContainer.find('.spa-configurator-base-image');
            
            // Wait for image to load if needed
            if (image[0].complete) {
                this.updateHotspotPositions();
            } else {
                image.on('load', () => {
                    this.updateHotspotPositions();
                });
            }
        }

        updateHotspotPositions() {
            // Hotspots are positioned using CSS percentages, so they should automatically scale
            // This method can be used for any additional responsive adjustments if needed
            const hotspots = this.container.find('.spa-hotspot');
            
            hotspots.each((index, hotspot) => {
                const $hotspot = $(hotspot);
                // Additional responsive logic can be added here if needed
            });
        }

        destroy() {
            this.closePopup();
            this.container.off();
            $(document).off(`click.spa-configurator-${this.widgetId}`);
            $(window).off(`resize.spa-configurator-${this.widgetId}`);
        }
    }

    // Initialize spa configurators when document is ready
    $(document).ready(() => {
        console.log('Spa Configurator: Document ready, looking for containers...');
        const containers = $('.spa-configurator-container');
        console.log('Spa Configurator: Found', containers.length, 'containers');
        
        containers.each(function() {
            console.log('Spa Configurator: Initializing container', this);
            try {
                new SpaConfigurator(this);
            } catch (error) {
                console.error('Spa Configurator: Error initializing:', error);
            }
        });
    });

    // Re-initialize when Elementor frontend is loaded (for preview mode)
    $(window).on('elementor/frontend/init', () => {
        elementorFrontend.hooks.addAction('frontend/element_ready/spa-configurator.default', ($scope) => {
            const container = $scope.find('.spa-configurator-container');
            if (container.length) {
                new SpaConfigurator(container[0]);
            }
        });
    });

})(jQuery);