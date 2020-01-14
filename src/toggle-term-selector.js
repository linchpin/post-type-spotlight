/*
 * Modified version of https://github.com/WordPress/gutenberg/blob/master/packages/editor/src/components/post-taxonomies/hierarchical-term-selector.js
 */

/**
 * External dependencies
 */
import { get, unescape as unescapeString, without, invoke } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, _x, _n, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { withSpokenMessages, ToggleControl } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { withInstanceId, compose } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { buildTermsTree } from './terms';

/**
 * Module Constants
 */
const DEFAULT_QUERY = {
  per_page: -1,
  orderby: 'name',
  order: 'asc',
  _fields: 'id,name,parent',
};

class ToggleTermSelector extends Component {
  constructor() {
    super( ...arguments );
    this.onChange = this.onChange.bind( this );
    this.state = {
      loading: true,
      availableTermsTree: [],
      availableTerms: [],
    };
  }

  onChange( termId ) {
    const { onUpdateTerms, terms = [], taxonomy } = this.props;
    const hasTerm = terms.indexOf( termId ) !== -1;
    const newTerms = hasTerm ?
        without( terms, termId ) :
        [ ...terms, termId ];
    onUpdateTerms( newTerms, taxonomy.rest_base );
  }

  componentDidMount() {
    this.fetchTerms();
  }

  componentWillUnmount() {
    invoke( this.fetchRequest, [ 'abort' ] );
    invoke( this.addRequest, [ 'abort' ] );
  }

  componentDidUpdate( prevProps ) {
    if ( this.props.taxonomy !== prevProps.taxonomy ) {
      this.fetchTerms();
    }
  }

  fetchTerms() {
    const { taxonomy } = this.props;
    if ( ! taxonomy ) {
      return;
    }
    this.fetchRequest = apiFetch( {
      path: addQueryArgs( `/wp/v2/${ taxonomy.rest_base }`, DEFAULT_QUERY ),
    } );
    this.fetchRequest.then(
        ( terms ) => { // resolve
          const availableTermsTree = terms;

          this.fetchRequest = null;
          this.setState( {
            loading: false,
            availableTermsTree,
            availableTerms: terms,
          } );
        },
        ( xhr ) => { // reject
          if ( xhr.statusText === 'abort' ) {
            return;
          }
          this.fetchRequest = null;
          this.setState( {
            loading: false,
          } );
        }
    );
  }

  renderTerms( renderedTerms ) {
    const { terms = [] } = this.props;

    return renderedTerms.map( ( term ) => {
      return (
          <div key={ term.id } className={ 'editor-post-taxonomies_terms-choice ' }>
            <ToggleControl
                checked={ terms.indexOf( term.id ) !== -1 }
                onChange={ () => {
                  const termId = parseInt( term.id, 10 );
                  this.onChange( termId );
                } }
                label={ unescapeString( term.name ) }
            />
          </div>
      );
    } );
  }

  render() {
    const { hasAssignAction } = this.props;

    if ( ! hasAssignAction ) {
      return null;
    }

    const { availableTermsTree } = this.state;

    return [
      <div
          className="editor-post-taxonomies_post-type-spotlight-terms-list"
          key="post-type-spotlight-list"
      >
        { this.renderTerms( availableTermsTree ) }
      </div>,
    ];
  }
}

export default compose( [
  withSelect( ( select, { slug } ) => {
    const { getCurrentPost } = select( 'core/editor' );
    const { getTaxonomy } = select( 'core' );
    const taxonomy = getTaxonomy( slug );
    return {
      hasAssignAction: taxonomy ? get( getCurrentPost(), [ '_links', 'wp:action-assign-' + taxonomy.rest_base ], false ) : false,
      terms: taxonomy ? select( 'core/editor' ).getEditedPostAttribute( taxonomy.rest_base ) : [],
      taxonomy,
    };
  } ),
  withDispatch( ( dispatch ) => ( {
    onUpdateTerms( terms, restBase ) {
      dispatch( 'core/editor' ).editPost( { [ restBase ]: terms } );
    },
  } ) ),
  withSpokenMessages,
  withInstanceId,
] )( ToggleTermSelector );