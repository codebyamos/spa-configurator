<?php
/**
 * Plugin Name: Spa Configurator
 * Plugin URI: https://www.thebrandsmen.com
 * Description: Interactive spa configurator with hotspots, image replacement, and Elementor integration. Allows users to visualize different cabinet and shell options with responsive hotspot tooltips.
 * Version: 1.3.0
 * Author: The Brandsmen
 * Author URI: https://www.thebrandsmen.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: spa-configurator
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.3
 * Requires PHP: 7.4
 * Elementor tested up to: 3.16.0
 * Elementor Pro tested up to: 3.16.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SPA_CONFIGURATOR_VERSION', '1.3.0');
define('SPA_CONFIGURATOR_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SPA_CONFIGURATOR_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('SPA_CONFIGURATOR_PLUGIN_FILE', __FILE__);

// Include and initialize plugin update checker
require_once SPA_CONFIGURATOR_PLUGIN_PATH . 'includes/plugin-update-checker/plugin-update-checker.php';
use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$spaConfiguratorUpdateChecker = PucFactory::buildUpdateChecker(
    'https://github.com/codebyamos/spa-configurator',
    SPA_CONFIGURATOR_PLUGIN_FILE,
    'spa-configurator'
);

// Optional: If you're using a private repository, specify access token.
// $spaConfiguratorUpdateChecker->setAuthentication('your-token-here');

// Enable release assets for downloading zip from GitHub releases.
$spaConfiguratorUpdateChecker->getVcsApi()->enableReleaseAssets();

// Optional: Set to use specific branch (default is latest release tag).
// $spaConfiguratorUpdateChecker->setBranch('master');

/**
 * Main Spa Configurator Class
 */
class SpaConfigurator {
    
    /**
     * Instance
     */
    private static $_instance = null;
    
    /**
     * Instance
     */
    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('plugins_loaded', array($this, 'init_elementor_integration'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Initialize the plugin
     */
    public function init() {
        // Load text domain
        load_plugin_textdomain('spa-configurator', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('elementor/editor/after_enqueue_scripts', array($this, 'enqueue_editor_scripts'));
        
        // Add admin page for migration tools (admin only)
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('wp_ajax_spa_configurator_backup_db', array($this, 'ajax_backup_db'));
        }
    }
    
    /**
     * Initialize Elementor integration
     */
    public function init_elementor_integration() {
        // Check if Elementor is installed and activated
        if (!did_action('elementor/loaded')) {
            add_action('admin_notices', array($this, 'admin_notice_missing_elementor'));
            return;
        }
        
        // Check for required Elementor version
        if (!version_compare(ELEMENTOR_VERSION, '3.0.0', '>=')) {
            add_action('admin_notices', array($this, 'admin_notice_minimum_elementor_version'));
            return;
        }
        
        // Add Elementor widget
        add_action('elementor/widgets/widgets_registered', array($this, 'register_elementor_widgets'));
        add_action('elementor/elements/categories_registered', array($this, 'add_elementor_widget_categories'));
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'spa-configurator-frontend',
            SPA_CONFIGURATOR_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            SPA_CONFIGURATOR_VERSION,
            true
        );
        
        wp_enqueue_style(
            'spa-configurator-frontend',
            SPA_CONFIGURATOR_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            SPA_CONFIGURATOR_VERSION
        );
        
        // Localize script
        wp_localize_script('spa-configurator-frontend', 'spaConfigurator', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('spa_configurator_nonce'),
            'strings' => array(
                'loading' => __('Loading...', 'spa-configurator'),
                'error' => __('An error occurred. Please try again.', 'spa-configurator'),
            )
        ));
    }
    
    /**
     * Enqueue editor scripts
     */
    public function enqueue_editor_scripts() {
        wp_enqueue_script(
            'spa-configurator-editor',
            SPA_CONFIGURATOR_PLUGIN_URL . 'assets/js/editor.js',
            array('jquery'),
            SPA_CONFIGURATOR_VERSION,
            true
        );
    }
    
    /**
     * Enqueue admin scripts and styles - removed as not needed
     */
    public function admin_enqueue_scripts($hook) {
        // Admin functionality removed - all configuration done in Elementor
    }
    
    /**
     * Register Elementor widgets
     */
    public function register_elementor_widgets($widgets_manager) {
        require_once SPA_CONFIGURATOR_PLUGIN_PATH . 'includes/elementor/class-spa-configurator-widget.php';
        $widgets_manager->register_widget_type(new \Spa_Configurator_Widget());
    }
    
    /**
     * Add Elementor widget categories
     */
    public function add_elementor_widget_categories($elements_manager) {
        $elements_manager->add_category(
            'spa-configurator',
            array(
                'title' => __('Spa Configurator', 'spa-configurator'),
                'icon' => 'fa fa-plug',
            )
        );
    }
    
    /**
     * Admin notice for missing Elementor
     */
    public function admin_notice_missing_elementor() {
        if (isset($_GET['activate'])) unset($_GET['activate']);
        
        $message = sprintf(
            esc_html__('"%1$s" requires "%2$s" to be installed and activated.', 'spa-configurator'),
            '<strong>' . esc_html__('Spa Configurator', 'spa-configurator') . '</strong>',
            '<strong>' . esc_html__('Elementor', 'spa-configurator') . '</strong>'
        );
        
        printf('<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message);
    }
    
    /**
     * Admin notice for minimum Elementor version
     */
    public function admin_notice_minimum_elementor_version() {
        if (isset($_GET['activate'])) unset($_GET['activate']);
        
        $message = sprintf(
            esc_html__('"%1$s" requires "%2$s" version %3$s or greater.', 'spa-configurator'),
            '<strong>' . esc_html__('Spa Configurator', 'spa-configurator') . '</strong>',
            '<strong>' . esc_html__('Elementor', 'spa-configurator') . '</strong>',
            '3.0.0'
        );
        
        printf('<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message);
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        add_option('spa_configurator_version', SPA_CONFIGURATOR_VERSION);
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Add admin menu for migration tools
     */
    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            __('Spa Configurator Tools', 'spa-configurator'),
            __('Spa Configurator', 'spa-configurator'),
            'manage_options',
            'spa-configurator-tools',
            array($this, 'admin_tools_page')
        );
    }
    
    /**
     * Admin tools page
     */
    public function admin_tools_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Spa Configurator Tools', 'spa-configurator'); ?></h1>
            
            <div class="notice notice-info">
                <p><strong><?php _e('Database Backup Commands (PowerShell)', 'spa-configurator'); ?></strong></p>
                <p><?php _e('Before making changes, backup your database:', 'spa-configurator'); ?></p>
                <code style="display: block; padding: 10px; background: #f1f1f1; margin: 10px 0;">
                    # Via WP-CLI (if installed)<br>
                    wp db export backup_before_spa_changes.sql<br><br>
                    # Via mysqldump<br>
                    mysqldump -u USERNAME -p DATABASE_NAME > backup_before_spa_changes.sql
                </code>
                <p><small><?php _e('Replace USERNAME and DATABASE_NAME with your actual values. You can find these in wp-config.php', 'spa-configurator'); ?></small></p>
            </div>

            <div class="notice notice-success">
                <p><strong><?php _e('Good News!', 'spa-configurator'); ?></strong></p>
                <p><?php _e('The plugin has been updated with backward-compatible ID support. Existing configurations will continue working automatically when you change shell or cabinet names.', 'spa-configurator'); ?></p>
                <ul>
                    <li><?php _e('• Existing widgets use name-based matching (still works)', 'spa-configurator'); ?></li>
                    <li><?php _e('• New widgets can use optional Shell ID and Cabinet ID fields', 'spa-configurator'); ?></li>
                    <li><?php _e('• Fuzzy matching helps when names change slightly', 'spa-configurator'); ?></li>
                    <li><?php _e('• No data loss - all configurations preserved', 'spa-configurator'); ?></li>
                </ul>
            </div>

            <h2><?php _e('How to Use the New System', 'spa-configurator'); ?></h2>
            <ol>
                <li><?php _e('Edit your Spa Configurator widgets in Elementor', 'spa-configurator'); ?></li>
                <li><?php _e('In Shell Options, optionally add a "Shell ID" for each shell (e.g., "platinum", "midnight")', 'spa-configurator'); ?></li>
                <li><?php _e('In Cabinet Options, optionally add a "Cabinet ID" for each cabinet (e.g., "slate", "graphite")', 'spa-configurator'); ?></li>
                <li><?php _e('Update the "Default Shell Option" field to use the ID instead of the name if desired', 'spa-configurator'); ?></li>
                <li><?php _e('Now you can change shell/cabinet names without breaking existing configurations!', 'spa-configurator'); ?></li>
            </ol>

            <h2><?php _e('Restore Commands (if needed)', 'spa-configurator'); ?></h2>
            <div class="notice notice-warning">
                <p><?php _e('If you need to restore your backup:', 'spa-configurator'); ?></p>
                <code style="display: block; padding: 10px; background: #f1f1f1; margin: 10px 0;">
                    # Via WP-CLI<br>
                    wp db import backup_before_spa_changes.sql<br><br>
                    # Via mysql command line<br>
                    mysql -u USERNAME -p DATABASE_NAME < backup_before_spa_changes.sql
                </code>
            </div>
        </div>
        <?php
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}

// Initialize the plugin
SpaConfigurator::instance();
