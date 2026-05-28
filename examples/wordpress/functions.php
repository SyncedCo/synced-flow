<?php
/**
 * Synced Flow WordPress example enqueue.
 */

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'synced-flow',
        get_theme_file_uri('assets/css/synced-flow.css'),
        [],
        wp_get_theme()->get('Version')
    );
});
