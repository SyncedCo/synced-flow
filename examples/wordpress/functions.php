<?php
/**
 * Synced Fluid WordPress example enqueue.
 */

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'synced-fluid',
        get_theme_file_uri('assets/css/synced-fluid.css'),
        [],
        wp_get_theme()->get('Version')
    );
});
