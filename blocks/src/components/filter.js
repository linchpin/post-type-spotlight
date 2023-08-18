import { __, sprintf } from '@wordpress/i18n';
import {
  ToggleControl,
  __experimentalHStack as HStack,
  Tooltip,
  Icon, SelectControl
} from "@wordpress/components";
import {capitalize} from "lodash";

import LogoMark from '../components/logo-mark';

const PTSFilter = ( { attributes, setAttributes }  ) => {

  const {
    query: {
      queryType
    }
  } = attributes;

	return (
      <SelectControl
        value={queryType}
        label={__('Display Type', 'post-type-spotlight')}
        onChange={ ( queryType ) => {
          // filter the tokens to remove wrong items.
          setAttributes( {
            query: {
              ...attributes.query,
              queryType: queryType || 'featured-only',
            },
          } );
        } }
        options={ [
          {value : 'featured-only', label : __('Only Show Featured', 'post-type-spotlight')},
          {value : 'featured-first', label : __('Show Featured First', 'post-type-spotlight')},
          {value : 'featured-exclude', label : __('Exclude Featured', 'post-type-spotlight')},
        ] } />
	);
}

export default PTSFilter;
