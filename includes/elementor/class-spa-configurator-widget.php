<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Border;
use Elementor\Group_Control_Box_Shadow;

/**
 * Spa Configurator Elementor Widget
 */
class Spa_Configurator_Widget extends Widget_Base {

    /**
     * Get widget name.
     */
    public function get_name() {
        return 'spa-configurator';
    }

    /**
     * Get widget title.
     */
    public function get_title() {
        return __('Spa Configurator', 'spa-configurator');
    }

    /**
     * Get widget icon.
     */
    public function get_icon() {
        return 'eicon-image-hotspot';
    }

    /**
     * Get widget categories.
     */
    public function get_categories() {
        return ['spa-configurator'];
    }

    /**
     * Get widget keywords.
     */
    public function get_keywords() {
        return ['spa', 'configurator', 'hotspot', 'image', 'interactive'];
    }

    /**
     * Register widget controls.
     */
    protected function _register_controls() {

        // Content Section - Default Configuration
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Default Configuration', 'spa-configurator'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'product_title',
            [
                'label' => __('Product Title', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => __('Spa Configurator', 'spa-configurator'),
                'placeholder' => __('Enter product title', 'spa-configurator'),
            ]
        );

        $this->add_control(
            'default_shell_selection',
            [
                'label' => __('Default Shell Option', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'description' => __('Enter the exact shell name from your shell options below. This will be used as the default selection.', 'spa-configurator'),
                'placeholder' => __('e.g., Platinum', 'spa-configurator'),
                'dynamic' => [
                    'active' => false,
                ],
            ]
        );

        $this->add_control(
            'default_cabinet_selection',
            [
                'label' => __('Default Cabinet Selection', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'description' => __('Enter the exact cabinet name from your cabinet options below. This will be used as the default selection.', 'spa-configurator'),
                'placeholder' => __('e.g., Slate', 'spa-configurator'),
                'dynamic' => [
                    'active' => false,
                ],
            ]
        );

        $this->end_controls_section();

        // Hotspots Section
        $this->start_controls_section(
            'hotspots_section',
            [
                'label' => __('Hotspots', 'spa-configurator'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'hotspot_name',
            [
                'label' => __('Hotspot Name', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => __('Hotspot', 'spa-configurator'),
            ]
        );

        $repeater->add_control(
            'hotspot_type',
            [
                'label' => __('Hotspot Type', 'spa-configurator'),
                'type' => Controls_Manager::SELECT,
                'default' => 'selector',
                'options' => [
                    'selector' => __('Selector (Cabinet/Shell Options)', 'spa-configurator'),
                    'top_angle' => __('Top Angle View', 'spa-configurator'),
                    'qr_code' => __('Scan QR Code Option', 'spa-configurator'),
                ],
            ]
        );

        $repeater->add_control(
            'x_position',
            [
                'label' => __('X Position (%)', 'spa-configurator'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['%'],
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 50,
                ],
            ]
        );

        $repeater->add_control(
            'y_position',
            [
                'label' => __('Y Position (%)', 'spa-configurator'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['%'],
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 50,
                ],
            ]
        );

        $repeater->add_control(
            'top_angle_image',
            [
                'label' => __('Top Angle Image', 'spa-configurator'),
                'type' => Controls_Manager::MEDIA,
                'condition' => [
                    'hotspot_type' => 'top_angle',
                ],
                'description' => __('Upload the top angle view image for this hotspot.', 'spa-configurator'),
            ]
        );

        $repeater->add_control(
            'qr_code_image',
            [
                'label' => __('QR Code Image', 'spa-configurator'),
                'type' => Controls_Manager::MEDIA,
                'condition' => [
                    'hotspot_type' => 'qr_code',
                ],
                'description' => __('Upload the QR code image for AR viewing.', 'spa-configurator'),
            ]
        );

        $this->add_control(
            'hotspots',
            [
                'label' => __('Hotspots', 'spa-configurator'),
                'type' => Controls_Manager::REPEATER,
                'fields' => $repeater->get_controls(),
                'default' => [
                    [
                        'hotspot_name' => __('Cabinet Options', 'spa-configurator'),
                        'hotspot_type' => 'selector',
                        'x_position' => ['size' => 30, 'unit' => '%'],
                        'y_position' => ['size' => 40, 'unit' => '%'],
                    ],
                    [
                        'hotspot_name' => __('Shell Options', 'spa-configurator'),
                        'hotspot_type' => 'selector',
                        'x_position' => ['size' => 70, 'unit' => '%'],
                        'y_position' => ['size' => 60, 'unit' => '%'],
                    ],
                ],
                'title_field' => '{{{ hotspot_name }}}',
            ]
        );

        $this->end_controls_section();

        // Cabinet Options Section
        $this->start_controls_section(
            'cabinet_options_section',
            [
                'label' => __('Cabinet Options', 'spa-configurator'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'enable_cabinet_options',
            [
                'label' => __('Enable Cabinet Options', 'spa-configurator'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'spa-configurator'),
                'label_off' => __('No', 'spa-configurator'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'cabinet_section_title',
            [
                'label' => __('Cabinet Section Title', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => __('Cabinet Options', 'spa-configurator'),
                'condition' => [
                    'enable_cabinet_options' => 'yes',
                ],
            ]
        );

        $cabinet_repeater = new \Elementor\Repeater();

        $cabinet_repeater->add_control(
            'option_name',
            [
                'label' => __('Option Name', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => __('Slate', 'spa-configurator'),
            ]
        );

        $cabinet_repeater->add_control(
            'thumbnail_image',
            [
                'label' => __('Cabinet Thumbnail', 'spa-configurator'),
                'type' => Controls_Manager::MEDIA,
                'description' => __('Small thumbnail image shown in the cabinet selector.', 'spa-configurator'),
            ]
        );

        $this->add_control(
            'cabinet_options',
            [
                'label' => __('Cabinet Options', 'spa-configurator'),
                'type' => Controls_Manager::REPEATER,
                'fields' => $cabinet_repeater->get_controls(),
                'default' => [
                    [
                        'option_name' => __('Slate', 'spa-configurator'),
                    ],
                    [
                        'option_name' => __('Graphite', 'spa-configurator'),
                    ],
                ],
                'title_field' => '{{{ option_name }}}',
                'condition' => [
                    'enable_cabinet_options' => 'yes',
                ],
            ]
        );

        $this->end_controls_section();

        // Shell Options Section
        $this->start_controls_section(
            'shell_options_section',
            [
                'label' => __('Shell Options', 'spa-configurator'),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'enable_shell_options',
            [
                'label' => __('Enable Shell Options', 'spa-configurator'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __('Yes', 'spa-configurator'),
                'label_off' => __('No', 'spa-configurator'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'shell_section_title',
            [
                'label' => __('Shell Section Title', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => __('Shell Options', 'spa-configurator'),
                'condition' => [
                    'enable_shell_options' => 'yes',
                ],
            ]
        );

        $shell_repeater = new \Elementor\Repeater();

        $shell_repeater->add_control(
            'shell_name',
            [
                'label' => __('Shell Option Name', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => __('Platinum', 'spa-configurator'),
            ]
        );

        $shell_repeater->add_control(
            'option_image',
            [
                'label' => __('Option Preview Image', 'spa-configurator'),
                'type' => Controls_Manager::MEDIA,
                'description' => __('Small preview image shown in the selector.', 'spa-configurator'),
            ]
        );

        $cabinet_images_repeater = new \Elementor\Repeater();

        $cabinet_images_repeater->add_control(
            'cabinet_name',
            [
                'label' => __('Cabinet Name', 'spa-configurator'),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'description' => __('Enter the exact cabinet name (must match your cabinet options)', 'spa-configurator'),
            ]
        );

        $cabinet_images_repeater->add_control(
            'cabinet_image',
            [
                'label' => __('Cabinet Image', 'spa-configurator'),
                'type' => Controls_Manager::MEDIA,
                'description' => __('Main image to show when this cabinet is selected with this shell', 'spa-configurator'),
            ]
        );

        $shell_repeater->add_control(
            'cabinet_images',
            [
                'label' => __('Cabinet Images', 'spa-configurator'),
                'type' => Controls_Manager::REPEATER,
                'fields' => $cabinet_images_repeater->get_controls(),
                'title_field' => '{{{ cabinet_name }}} Cabinet',
                'description' => __('Add an image for each cabinet option you have defined above. Click on the cabinet title bar to see delete options.', 'spa-configurator'),
                'prevent_empty' => false,
                'default' => [],
                'separator' => 'before',
            ]
        );

        $this->add_control(
            'shell_options',
            [
                'label' => __('Shell Options', 'spa-configurator'),
                'type' => Controls_Manager::REPEATER,
                'fields' => $shell_repeater->get_controls(),
                'default' => [
                    [
                        'shell_name' => __('Platinum', 'spa-configurator'),
                    ],
                    [
                        'shell_name' => __('Midnight', 'spa-configurator'),
                    ],
                    [
                        'shell_name' => __('Monaco', 'spa-configurator'),
                    ],
                    [
                        'shell_name' => __('Travertine', 'spa-configurator'),
                    ],
                    [
                        'shell_name' => __('Celestite', 'spa-configurator'),
                    ],
                ],
                'title_field' => '{{{ shell_name }}}',
                'condition' => [
                    'enable_shell_options' => 'yes',
                ],
            ]
        );



        $this->end_controls_section();

        // Style Section - Hotspots
        $this->start_controls_section(
            'hotspot_style_section',
            [
                'label' => __('Hotspot Style', 'spa-configurator'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'hotspot_size',
            [
                'label' => __('Hotspot Size', 'spa-configurator'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 10,
                        'max' => 50,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 20,
                ],
                'selectors' => [
                    '{{WRAPPER}} .spa-hotspot' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'hotspot_color',
            [
                'label' => __('Hotspot Color', 'spa-configurator'),
                'type' => Controls_Manager::COLOR,
                'default' => '#ffffff',
                'selectors' => [
                    '{{WRAPPER}} .spa-hotspot' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'hotspot_border_color',
            [
                'label' => __('Hotspot Border Color', 'spa-configurator'),
                'type' => Controls_Manager::COLOR,
                'default' => '#007cba',
                'selectors' => [
                    '{{WRAPPER}} .spa-hotspot' => 'border-color: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_section();

        // Style Section - Title
        $this->start_controls_section(
            'title_style_section',
            [
                'label' => __('Title Style', 'spa-configurator'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'title_typography',
                'selector' => '{{WRAPPER}} .spa-configurator-title',
            ]
        );

        $this->add_control(
            'title_color',
            [
                'label' => __('Title Color', 'spa-configurator'),
                'type' => Controls_Manager::COLOR,
                'default' => '#333',
                'selectors' => [
                    '{{WRAPPER}} .spa-configurator-title' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'title_margin',
            [
                'label' => __('Title Margin', 'spa-configurator'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .spa-configurator-title' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();
    }

    /**
     * Render widget output on the frontend.
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        // Find default shell and determine initial image
        $default_shell_name = $settings['default_shell_selection'] ?? '';
        $default_cabinet_name = $settings['default_cabinet_selection'] ?? '';
        $default_image_url = '';
        
        // Find the default shell option
        $default_shell = null;
        if (!empty($settings['shell_options'])) {
            foreach ($settings['shell_options'] as $shell) {
                if ($shell['shell_name'] === $default_shell_name) {
                    $default_shell = $shell;
                    break;
                }
            }
            
            // If no default shell found, use first shell
            if (!$default_shell && !empty($settings['shell_options'])) {
                $default_shell = $settings['shell_options'][0];
                $default_shell_name = $default_shell['shell_name'];
            }
        }

        // Find default cabinet or use first cabinet
        $default_cabinet = null;
        if (!empty($settings['cabinet_options'])) {
            foreach ($settings['cabinet_options'] as $cabinet) {
                if ($cabinet['option_name'] === $default_cabinet_name) {
                    $default_cabinet = $cabinet;
                    break;
                }
            }
            
            // If no default cabinet found, use first cabinet
            if (!$default_cabinet && !empty($settings['cabinet_options'])) {
                $default_cabinet = $settings['cabinet_options'][0];
                $default_cabinet_name = $default_cabinet['option_name'];
            }
        }
        
        // Use cabinet name in lowercase for image field matching
        $cabinet_key = $default_cabinet_name ? strtolower($default_cabinet_name) : 'slate';
        
        // Get default image from shell using cabinet images repeater
        if ($default_shell && $default_cabinet_name) {
            $default_image_url = '';
            
            // Look for the cabinet image in the repeater structure
            if (!empty($default_shell['cabinet_images'])) {
                foreach ($default_shell['cabinet_images'] as $cabinet_image) {
                    if ($cabinet_image['cabinet_name'] === $default_cabinet_name) {
                        $default_image_url = $cabinet_image['cabinet_image']['url'] ?? '';
                        break;
                    }
                }
            }
            
            // Fallback to old structure for backward compatibility
            if (empty($default_image_url)) {
                $image_field = $cabinet_key . '_image';
                $default_image_url = $default_shell[$image_field]['url'] ?? '';
            }
        }
        
        if (empty($default_image_url)) {
            echo '<div class="spa-configurator-notice">' . __('Please configure shell options with images.', 'spa-configurator') . '</div>';
            return;
        }

        $widget_id = $this->get_id();
        ?>
        <div class="spa-configurator-container" data-widget-id="<?php echo esc_attr($widget_id); ?>">
            <div class="spa-configurator-title" id="spa-title-<?php echo esc_attr($widget_id); ?>">
                <?php echo esc_html($settings['product_title']); ?>
            </div>
            
            <div class="spa-configurator-image-container">
                <img 
                    src="<?php echo esc_url($default_image_url); ?>" 
                    alt="<?php echo esc_attr($settings['product_title']); ?>"
                    class="spa-configurator-base-image"
                    id="spa-image-<?php echo esc_attr($widget_id); ?>"
                >
                
                <?php if (!empty($settings['hotspots'])): ?>
                    <?php foreach ($settings['hotspots'] as $index => $hotspot): ?>
                        <div 
                            class="spa-hotspot" 
                            data-hotspot-id="<?php echo esc_attr($index); ?>"
                            data-hotspot-type="<?php echo esc_attr($hotspot['hotspot_type']); ?>"
                            data-hotspot-name="<?php echo esc_attr($hotspot['hotspot_name']); ?>"
                            data-top-angle-image="<?php echo esc_url($hotspot['top_angle_image']['url'] ?? ''); ?>"
                            data-qr-code-image="<?php echo esc_url($hotspot['qr_code_image']['url'] ?? ''); ?>"
                            style="left: <?php echo esc_attr($hotspot['x_position']['size']); ?>%; top: <?php echo esc_attr($hotspot['y_position']['size']); ?>%;"
                        >
                            <span class="spa-hotspot-pulse"></span>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>

        <!-- Hidden data for JavaScript -->
        <script type="application/json" class="spa-configurator-data" data-widget-id="<?php echo esc_attr($widget_id); ?>">
        {
            "widgetId": "<?php echo esc_attr($widget_id); ?>",
            "defaultShell": "<?php echo esc_js($default_shell_name); ?>",
            "defaultCabinet": "<?php echo esc_js($default_cabinet_name); ?>",
            "productTitle": "<?php echo esc_js($settings['product_title']); ?>",
            "enableCabinetOptions": "<?php echo esc_js($settings['enable_cabinet_options'] ?? 'yes'); ?>",
            "enableShellOptions": "<?php echo esc_js($settings['enable_shell_options'] ?? 'yes'); ?>",
            "cabinetSectionTitle": "<?php echo esc_js($settings['cabinet_section_title']); ?>",
            "shellSectionTitle": "<?php echo esc_js($settings['shell_section_title']); ?>",
            "cabinetOptions": <?php 
                $cabinet_options_processed = [];
                if ($settings['enable_cabinet_options'] === 'yes' && !empty($settings['cabinet_options'])) {
                    foreach ($settings['cabinet_options'] as $cabinet) {
                        $processed_cabinet = $cabinet;
                        // Map new field name to old for JavaScript compatibility
                        if (isset($cabinet['thumbnail_image'])) {
                            $processed_cabinet['option_image'] = $cabinet['thumbnail_image'];
                        }
                        $cabinet_options_processed[] = $processed_cabinet;
                    }
                }
                echo json_encode($cabinet_options_processed); 
            ?>,
            "shellOptions": <?php 
                $shell_options_processed = [];
                if ($settings['enable_shell_options'] === 'yes' && !empty($settings['shell_options'])) {
                    foreach ($settings['shell_options'] as $shell) {
                        $processed_shell = $shell;
                        
                        // Convert cabinet_images repeater to old field format for JavaScript compatibility
                        if (!empty($shell['cabinet_images'])) {
                            foreach ($shell['cabinet_images'] as $cabinet_img) {
                                // Create field name matching JavaScript expectations
                                $cabinet_name_clean = strtolower(str_replace(' ', '', $cabinet_img['cabinet_name']));
                                $cabinet_key = $cabinet_name_clean . '_image';
                                $processed_shell[$cabinet_key] = $cabinet_img['cabinet_image'];
                            }
                        }
                        
                        $shell_options_processed[] = $processed_shell;
                    }
                }
                echo json_encode($shell_options_processed); 
            ?>,
            "hotspots": <?php echo json_encode($settings['hotspots'] ?? []); ?>
        }
        </script>
        <?php
    }

    /**
     * Render widget output in the editor.
     */
    protected function _content_template() {
        ?>
        <# 
        var defaultShell = null;
        var defaultImage = '';
        var defaultCabinet = settings.default_cabinet_selection || '';
        
        // Use first cabinet if no default specified
        if (!defaultCabinet && settings.cabinet_options && settings.cabinet_options.length > 0) {
            defaultCabinet = settings.cabinet_options[0].option_name;
        }
        
        if (settings.shell_options && settings.shell_options.length > 0) {
            // Find default shell
            if (settings.default_shell_selection) {
                defaultShell = settings.shell_options.find(function(shell) {
                    return shell.shell_name === settings.default_shell_selection;
                });
            }
            
            // If no default shell found, use first shell
            if (!defaultShell) {
                defaultShell = settings.shell_options[0];
            }
            
            // Get default image using cabinet images repeater
            if (defaultShell && defaultCabinet) {
                defaultImage = '';
                
                // Look for the cabinet image in the repeater structure
                if (defaultShell.cabinet_images && defaultShell.cabinet_images.length > 0) {
                    var cabinetImage = defaultShell.cabinet_images.find(function(img) {
                        return img.cabinet_name === defaultCabinet;
                    });
                    if (cabinetImage && cabinetImage.cabinet_image) {
                        defaultImage = cabinetImage.cabinet_image.url;
                    }
                }
                
                // Fallback to old structure for backward compatibility
                if (!defaultImage) {
                    var imageField = defaultCabinet.toLowerCase() + '_image';
                    defaultImage = defaultShell[imageField] ? defaultShell[imageField].url : '';
                }
            }
        }
        #>
        
        <# if (defaultImage) { #>
            <div class="spa-configurator-container">
                <div class="spa-configurator-title">
                    {{{ settings.product_title }}}
                </div>
                
                <div class="spa-configurator-image-container">
                    <img 
                        src="{{{ defaultImage }}}" 
                        alt="{{{ settings.product_title }}}"
                        class="spa-configurator-base-image"
                    >
                    
                    <# if (settings.hotspots) { #>
                        <# _.each(settings.hotspots, function(hotspot, index) { #>
                            <div 
                                class="spa-hotspot" 
                                data-hotspot-name="{{{ hotspot.hotspot_name }}}"
                                style="left: {{{ hotspot.x_position.size }}}%; top: {{{ hotspot.y_position.size }}}%;"
                            >
                                <span class="spa-hotspot-pulse"></span>
                            </div>
                        <# }); #>
                    <# } #>
                </div>
            </div>
        <# } else { #>
            <div class="spa-configurator-notice">
                <?php _e('Please configure shell options with images.', 'spa-configurator'); ?>
            </div>
        <# } #>
        <?php
    }

    /**
     * Add editor scripts for dynamic control updates
     */
    public function get_script_depends() {
        return ['spa-configurator-editor'];
    }
}