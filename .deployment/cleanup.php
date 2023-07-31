<?php

/**
 * This file cleans up some odds and ends things prior to release
 *
 * @since 1.0.0 Make sure debug config lines are set to false by default
 */

echo "➤ Forcing debug config off\n\r";

// Read the elite plugin file into a string
$elite_plugin_file = file_get_contents('./linchpin-com-functionality.php' );

// Make sure a release does not have hardcoded debug lines set to true.
$configs = [
	'POST_TYPE_SPOTLIGHT_PLUGIN_DEBUG',
	'POST_TYPE_SPOTLIGHT_PLUGIN_DEV_MODE',
];

$errors_found = 0;

foreach ( $configs as $config ) {
	if ( false !== strpos( $elite_plugin_file, "define( '$config', true );" ) ) {
		$elite_plugin_file = str_replace( "define( '$config', true );", "define( '$config', false );", $elite_plugin_file );

		echo esc_html( "\e[31m➤ Doing it wrong:\e[36m $config \e[0mhas been updated to false, you should set these configs outside the plugin!\n\r" );
		$errors_found++;
	}
}

if ( empty( $errors_found ) ) {
	echo "\e[32m➤ No debug configs found\n\r";
}

// Write our new file.
file_put_contents( './post-type-spotlight.php', $elite_plugin_file );
