# Spa Configurator WordPress Plugin

Interactive spa configurator with hotspots, image replacement, and Elementor integration. Allows users to visualize different cabinet and shell options with responsive hotspot tooltips.

## Features

- **Elementor Widget**: Easily add configurator to any page using Elementor
- **Hotspot Tooltips**: Interactive hotspots with custom tooltips
- **Image Replacement**: Dynamic image swapping based on user selections
- **Backward Compatibility**: Supports both name-based and ID-based matching
- **Responsive Design**: Works on all device sizes
- **Automatic Updates**: Updates directly from GitHub

## Installation

### Manual Installation
1. Download the latest release ZIP from [GitHub Releases](https://github.com/codebyamos/spa-configurator/releases)
2. In WordPress admin, go to Plugins → Add New → Upload Plugin
3. Upload the ZIP file and activate

### Git Installation
1. Clone this repository into your `wp-content/plugins/` directory:
   ```bash
   cd wp-content/plugins
   git clone https://github.com/codebyamos/spa-configurator.git
   ```
2. Activate the plugin from WordPress admin

## Usage

1. **Elementor Integration**: After activation, you'll find "Spa Configurator" widget in Elementor's widget panel under "Spa Configurator" category.

2. **Widget Configuration**:
   - Add the widget to any page
   - Configure shell options with images, names, and optional IDs
   - Configure cabinet options with images, names, and optional IDs
   - Set default selections and hotspot positions

3. **Admin Tools**: Access migration and backup tools under Tools → Spa Configurator in WordPress admin.

## Automatic Updates

This plugin supports automatic updates from GitHub. When a new release is published on GitHub, WordPress will notify you of available updates in the Plugins page.

### How It Works
- The plugin uses the [Plugin Update Checker](https://github.com/YahnisElsts/plugin-update-checker) library
- Checks GitHub repository for new releases
- Supports both public and private repositories (token required for private)

### Manual Update Check
If updates aren't appearing automatically, you can force a check by:
1. Going to WordPress Dashboard → Updates
2. Clicking "Check Again"

## Development

### Prerequisites
- PHP 7.4+
- WordPress 5.0+
- Elementor 3.0+

### Building from Source
```bash
git clone https://github.com/codebyamos/spa-configurator.git
cd spa-configurator
```

### File Structure
```
spa-configurator/
├── spa-configurator.php          # Main plugin file
├── assets/                       # CSS and JS assets
├── includes/                     # PHP classes
│   └── elementor/                # Elementor widget
├── .github/workflows/            # CI/CD workflows
└── README.md                     # This file
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## GitHub Actions

This repository includes GitHub Actions workflows for:
- **PHP Syntax Check**: Validates PHP syntax on all `.php` files
- **WordPress Coding Standards**: Ensures code follows WordPress coding standards
- **Automatic Releases**: Creates ZIP archives when tags are pushed

## Versioning

We use [Semantic Versioning](https://semver.org/). For the versions available, see the [tags on this repository](https://github.com/codebyamos/spa-configurator/tags).

## License

This plugin is licensed under the GPL v2 or later. See the [LICENSE](LICENSE) file for details.

## Support

For support, feature requests, or bug reports, please [open an issue](https://github.com/codebyamos/spa-configurator/issues) on GitHub.

## Credits

Developed by [The Brandsmen](https://www.thebrandsmen.com).