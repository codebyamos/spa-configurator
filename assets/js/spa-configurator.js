/**
 * Spa Configurator Main JavaScript
 * Handles hotspot interactions, option selection, and 360° rotation integration
 */

class SpaConfigurator {
    constructor(widgetId) {
        this.widgetId = widgetId;
        this.container = document.querySelector(`[data-widget-id="${widgetId}"]`);
        this.data = this.loadConfigData();
        this.currentShell = this.data.defaultShell;
        // Clean the default cabinet name to match our processing
        this.currentCabinet = this.data.defaultCabinet ? this.data.defaultCabinet.toLowerCase().replace(/\s+/g, '') : '';
        this.rotation360Instance = null;
        
        if (!this.container || !this.data) {
            console.error('Spa Configurator: Could not initialize widget', widgetId);
            return;
        }
        
        this.init();
    }
    
    loadConfigData() {
        const dataElement = document.querySelector(`.spa-configurator-data[data-widget-id="${this.widgetId}"]`);
        if (!dataElement) return null;
        
        try {
            return JSON.parse(dataElement.textContent);
        } catch (error) {
            console.error('Spa Configurator: Error parsing data', error);
            return null;
        }
    }
    
    init() {
        this.setupHotspots();
        this.setup360Rotation();
        this.setupModalOverlay();
    }
    
    setupHotspots() {
        const hotspots = this.container.querySelectorAll('.spa-hotspot');
        
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const hotspotType = hotspot.dataset.hotspotType;
                const hotspotName = hotspot.dataset.hotspotName;
                
                if (hotspotType === 'selector') {
                    this.showOptionsModal(hotspotName);
                } else if (hotspotType === 'top_angle') {
                    this.showTopAngleView(hotspot.dataset.topAngleImage);
                }
            });
        });
    }
    
    setup360Rotation() {
        if (this.data.enable360Rotation !== 'yes') return;
        
        const trigger360 = this.container.querySelector('.spa-360-trigger');
        if (trigger360) {
            trigger360.addEventListener('click', (e) => {
                e.preventDefault();
                this.show360Rotation();
            });
        }
    }
    
    show360Rotation() {
        const mainImage = this.container.querySelector('.spa-configurator-base-image');
        if (!mainImage) {
            this.showNotification('Image not found', 'error');
            return;
        }

        // Create or show CSS 3D rotation viewer
        if (this.rotation360Instance) {
            this.rotation360Instance.destroy();
        }

        this.rotation360Instance = new SpaCSS3DRotation(
            this.container,
            mainImage,
            {
                style: this.data.rotationStyle || 'tilt_rotate',
                speed: this.data.rotationSpeed || 3,
                autoRotate: this.data.autoRotate === 'yes'
            }
        );

        this.rotation360Instance.show();
    }
    
    // Remove the old image sequence method
    get360ImageSequence() {
        // Not needed for CSS 3D approach
        return [];
    }
    
    setupModalOverlay() {
        // Create modal overlay for options
        if (!document.getElementById('spa-modal-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'spa-modal-overlay';
            overlay.className = 'spa-modal-overlay';
            overlay.innerHTML = `
                <div class="spa-modal-container">
                    <div class="spa-modal-header">
                        <h3 class="spa-modal-title"></h3>
                        <button class="spa-modal-close">&times;</button>
                    </div>
                    <div class="spa-modal-content"></div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            // Setup close handlers
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hideModal();
            });
            
            overlay.querySelector('.spa-modal-close').addEventListener('click', () => {
                this.hideModal();
            });
        }
    }
    
    showOptionsModal(optionType) {
        const modal = document.getElementById('spa-modal-overlay');
        const title = modal.querySelector('.spa-modal-title');
        const content = modal.querySelector('.spa-modal-content');
        
        // Determine which options to show
        let options = [];
        let sectionTitle = '';
        
        if (optionType.toLowerCase().includes('cabinet') && this.data.enableCabinetOptions === 'yes') {
            options = this.data.cabinetOptions;
            sectionTitle = this.data.cabinetSectionTitle || 'Cabinet Options';
        } else if (optionType.toLowerCase().includes('shell') && this.data.enableShellOptions === 'yes') {
            options = this.data.shellOptions;
            sectionTitle = this.data.shellSectionTitle || 'Shell Options';
        }
        
        if (options.length === 0) {
            this.showNotification('No options available', 'info');
            return;
        }
        
        title.textContent = sectionTitle;
        content.innerHTML = this.generateOptionsHTML(options, optionType);
        
        // Setup option click handlers
        this.setupOptionHandlers(content, optionType);
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    generateOptionsHTML(options, optionType) {
        const isShellOptions = optionType.toLowerCase().includes('shell');
        
        return `
            <div class="spa-options-grid">
                ${options.map((option, index) => {
                    const name = isShellOptions ? option.shell_name : option.option_name;
                    const image = option.option_image?.url || '';
                    const isActive = isShellOptions ? 
                        (name === this.currentShell) : 
                        (name.toLowerCase().replace(/\s+/g, '') === this.currentCabinet);
                    
                    return `
                        <div class="spa-option-item ${isActive ? 'active' : ''}" 
                             data-option-name="${name}" 
                             data-option-type="${optionType}">
                            ${image ? `<img src="${image}" alt="${name}" class="spa-option-image">` : ''}
                            <div class="spa-option-name">${name}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    setupOptionHandlers(content, optionType) {
        const optionItems = content.querySelectorAll('.spa-option-item');
        
        optionItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from siblings
                optionItems.forEach(sibling => sibling.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Update selection
                const optionName = item.dataset.optionName;
                this.selectOption(optionName, optionType);
                
                // Close modal after short delay
                setTimeout(() => {
                    this.hideModal();
                }, 300);
            });
        });
    }
    
    selectOption(optionName, optionType) {
        const isShellOption = optionType.toLowerCase().includes('shell');
        
        if (isShellOption) {
            this.currentShell = optionName;
        } else {
            // Clean cabinet name to match PHP processing (lowercase, no spaces)
            this.currentCabinet = optionName.toLowerCase().replace(/\s+/g, '');
        }
        
        // Update the main image
        this.updateMainImage();
        
        // Update title
        this.updateTitle();
        
        // Show notification
        this.showNotification(`Selected: ${optionName}`, 'success');
    }
    
    updateMainImage() {
        const mainImage = this.container.querySelector('.spa-configurator-base-image');
        if (!mainImage) return;
        
        // Find the shell option that matches current selection
        const shellOption = this.data.shellOptions.find(shell => 
            shell.shell_name === this.currentShell
        );
        
        if (shellOption) {
            const imageField = this.currentCabinet + '_image';
            const newImageUrl = shellOption[imageField]?.url;
            
            if (newImageUrl) {
                // Smooth transition
                mainImage.style.opacity = '0.5';
                mainImage.src = newImageUrl;
                
                mainImage.onload = () => {
                    mainImage.style.opacity = '1';
                    
                    // Update 3D rotation image if it's currently showing
                    if (this.rotation360Instance && this.rotation360Instance.isVisible && this.rotation360Instance.isVisible()) {
                        this.rotation360Instance.updateImage(newImageUrl);
                    }
                };
            }
        }
    }
    
    updateTitle() {
        const titleElement = this.container.querySelector('.spa-configurator-title');
        if (titleElement) {
            // Find the original cabinet name for display
            const cabinetOption = this.data.cabinetOptions.find(cabinet => 
                cabinet.option_name.toLowerCase().replace(/\s+/g, '') === this.currentCabinet
            );
            const displayCabinetName = cabinetOption ? cabinetOption.option_name : this.currentCabinet;
            titleElement.textContent = `${this.data.productTitle} - ${this.currentShell} Shell, ${displayCabinetName} Cabinet`;
        }
    }
    
    showTopAngleView(imageUrl) {
        if (!imageUrl) {
            this.showNotification('Top angle image not available', 'warning');
            return;
        }
        
        const modal = document.getElementById('spa-modal-overlay');
        const title = modal.querySelector('.spa-modal-title');
        const content = modal.querySelector('.spa-modal-content');
        
        title.textContent = 'Top Angle View';
        content.innerHTML = `
            <div class="spa-top-angle-view">
                <img src="${imageUrl}" alt="Top Angle View" class="spa-top-angle-image">
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    hideModal() {
        const modal = document.getElementById('spa-modal-overlay');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifs = document.querySelectorAll('.spa-notification');
        existingNotifs.forEach(notif => notif.remove());
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `spa-notification spa-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    destroy() {
        if (this.rotation360Instance) {
            this.rotation360Instance.destroy();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Find all spa configurator widgets and initialize them
    const widgets = document.querySelectorAll('.spa-configurator-container[data-widget-id]');
    
    widgets.forEach(widget => {
        const widgetId = widget.dataset.widgetId;
        if (widgetId) {
            new SpaConfigurator(widgetId);
        }
    });
});

// Global function for manual initialization
window.initSpaConfigurator = function(widgetId) {
    return new SpaConfigurator(widgetId);
};