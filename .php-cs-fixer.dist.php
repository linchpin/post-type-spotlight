<?php

$finder = PhpCsFixer\Finder::create()
                           ->in( __DIR__ );

$config = new PhpCsFixer\Config();

return $config->setRules( [
	'WordPress-Extra' => true,
	'strict_param'    => true,
	'array_syntax'    => [ 'syntax' => 'short' ],
] )->setFinder( $finder );
