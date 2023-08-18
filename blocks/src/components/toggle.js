import { __, sprintf } from '@wordpress/i18n';
import {
  ToggleControl,
  __experimentalHStack as HStack,
  Tooltip,
  Icon
} from "@wordpress/components";
import {capitalize} from "lodash";

import LogoMark from '../components/logo-mark';

const PTSToggle = ( props ) => {

  const {
    postType,
    isFeatured,
    onUpdateFeatured,
  } = props;

	return (
      <HStack
        alignment="top"
        justify="flex-start"
        spacing="3"
        style={{
          marginTop: "calc(12px)",
          minHeight: '3rem'
        }}
      >
        <Tooltip text={sprintf(__('You can query all featured %1$s using the pts_feature_tax'), postType)}>
            <Icon icon={<LogoMark width={'24px'} height={'24px'} />} />
        </Tooltip>
        <ToggleControl
          checked={isFeatured}
          label={ sprintf( __( 'Feature %1$s', 'post-type-spotlight' ), capitalize( postType ) ) }
          onChange={onUpdateFeatured}
          style={{marginBottom:"0!important"}}
        />
      </HStack>
	);
}

export default PTSToggle;
