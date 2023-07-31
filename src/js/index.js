import ToggleTermSelector from './toggle-term-selector';
import {registerStore} from '@wordpress/data';

( function() {
  const { apiFetch } = wp;
  const { registerStore } = wp.data;

  const DEFAULT_STATE = {
    featured: false,
  };

  const actions = {
    setFeatured( item, featured ) {
      return {
        type: 'SET_FEATURED',
        item,
        featured,
      };
    },

    fetchFromAPI( path ) {
      return {
        type: 'FETCH_FROM_API',
        path,
      };
    },
  };

  registerStore( 'post-type-spotlight', {
    reducer( state = DEFAULT_STATE, action ) {
      switch ( action.type ) {
        case 'SET FEATURED':
          return {
            ...state,
            featured: {
              ...state.featured,
              [ action.item ]: action.featured,
            },
          };
      }

      return state;
    },

    actions,

    selectors: {
      getFeatured( state, item ) {
        const { featured } = state;
        return featured;
      },
    },

    controls: {
      FETCH_FROM_API( action ) {
        return apiFetch( { path: action.path } );
      },
    },

    resolvers: {
      * getFeatured( item ) {
        const path = '/wp/v2/pts_feature_tax/' + item;
        const featured = yield actions.fetchFromAPI( path );
        return actions.setFeatured( item, featured );
      },
    },
  } );

  /**
   * Internal dependencies
   */
  function CustomizeTaxonomySelector( OriginalComponent ) {
    return function( props ) {

      if ( props.slug === 'pts_feature_tax' ) {
        return wp.element.createElement(
          ToggleTermSelector,
          props
        );
      } else {
        return wp.element.createElement(
          OriginalComponent,
          props
        );
      }
    }
  };

  wp.hooks.addFilter(
    'editor.PostTaxonomyType',
    'post-type-spotlight',
    CustomizeTaxonomySelector
  );
} )(); // end closure
