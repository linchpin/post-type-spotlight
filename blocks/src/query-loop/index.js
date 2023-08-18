import { __, sprintf } from '@wordpress/i18n';

import LogoMark from '../components/logo-mark';
import {registerBlockVariation} from "@wordpress/blocks";

import './controls'; // Load out controls

const VARIATION_NAME = 'post-type-spotlight/featured-list';

registerBlockVariation( 'core/query', {
    name: VARIATION_NAME,
    title: __( 'Featured List', 'post-type-spotlight' ),
    description: __( 'Displays a list of posts that are marked as featured.', 'post-type-spotlight' ),
    isActive: ( { namespace, query } ) => {
      return (
        namespace === VARIATION_NAME
      );
    },
    isPTSQueryLoopVariation: ( { namespace, query } ) => {
      return (
        namespace === VARIATION_NAME
      );
    },
    icon: LogoMark,
    attributes: {
      namespace: VARIATION_NAME,
      query: {
        perPage: 10,
        pages: 0,
        paged: 1,
        offset: 0,
        postType: 'page',
        order: 'desc',
        orderBy: 'date',
        author: '',
        search: '',
        exclude: [],
        sticky: '',
        inherit: false,
      },
      queryType: 'featured-only',
    },
    scope: [ 'inserter' ],
    innerBlocks : [
      [
        'core/post-template',
        {},
        [ [ 'core/post-title' ], [ 'core/post-excerpt' ] ],
      ],
      [ 'core/query-pagination' ],
      [ 'core/query-no-results' ],
    ],
    allowedControls: [ 'postType', 'search', 'taxQuery' ]
  }
);
