/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/index.js":
/*!****************************!*\
  !*** ./src/admin/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_edit_post__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/edit-post */ "@wordpress/edit-post");
/* harmony import */ var _wordpress_edit_post__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_edit_post__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _components_toggle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/toggle */ "./src/components/toggle.js");
/* harmony import */ var _components_logo_mark__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/logo-mark */ "./src/components/logo-mark.js");







// Internal Components


const Admin = () => {
  const postId = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => select('core/editor').getCurrentPostId());
  const postType = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => select('core/editor').getCurrentPostType());
  let featuredTerm = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => select('core').getEntityRecords('taxonomy', 'pts_feature_tax', {
    slug: 'featured'
  }));
  let postTerms = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => select('core/editor').getEditedPostAttribute('pts_feature_tax'));
  if (postTerms && !Array.isArray(postTerms)) {
    postTerms = [postTerms];
  }
  featuredTerm = featuredTerm ? featuredTerm[0]?.id : null;
  const isFeatured = featuredTerm && (postTerms.includes(featuredTerm) || postTerms === featuredTerm);
  const {
    editEntityRecord
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useDispatch)('core');
  const [postTypeSpotlightSettings] = (0,_wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__.useEntityProp)('root', 'site', 'pts_featured_post_types_settings');

  // If the post type is not enabled in our writing settings
  // then we can die early.
  if (!postTypeSpotlightSettings || postTypeSpotlightSettings && postTypeSpotlightSettings.indexOf(postType) === -1) {
    return null;
  }
  const onUpdateFeatured = newValue => {
    const updatedTerms = newValue ? [...postTerms, featuredTerm] : postTerms.filter(termId => termId !== featuredTerm);
    editEntityRecord('postType', postType, postId, {
      pts_feature_tax: updatedTerms
    });
  };
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_edit_post__WEBPACK_IMPORTED_MODULE_2__.PluginPostStatusInfo, {
    name: "pts-post-settings-panel",
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Post Type Spotlight Settings', 'linchpin'),
    className: "pts-post-settings-panel",
    style: {
      width: '100%'
    }
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_toggle__WEBPACK_IMPORTED_MODULE_6__["default"], {
    onUpdateFeatured: onUpdateFeatured,
    isFeatured: isFeatured,
    postType: postType
  }));
};
(0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__.registerPlugin)('post-type-post-settings', {
  render: Admin,
  icon: _components_logo_mark__WEBPACK_IMPORTED_MODULE_7__["default"]
});

/***/ }),

/***/ "./src/components/filter.js":
/*!**********************************!*\
  !*** ./src/components/filter.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_logo_mark__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/logo-mark */ "./src/components/logo-mark.js");





const PTSFilter = ({
  attributes,
  setAttributes
}) => {
  const {
    query: {
      queryType
    }
  } = attributes;
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
    value: queryType,
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Display Type', 'post-type-spotlight'),
    onChange: queryType => {
      // filter the tokens to remove wrong items.
      setAttributes({
        query: {
          ...attributes.query,
          queryType: queryType || 'featured-only'
        }
      });
    },
    options: [{
      value: 'featured-only',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Only Show Featured', 'post-type-spotlight')
    }, {
      value: 'featured-first',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Show Featured First', 'post-type-spotlight')
    }, {
      value: 'featured-exclude',
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Exclude Featured', 'post-type-spotlight')
    }]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PTSFilter);

/***/ }),

/***/ "./src/components/logo-mark.js":
/*!*************************************!*\
  !*** ./src/components/logo-mark.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LogoMark)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__);

/**
 * WordPress dependencies
 */

function LogoMark(props) {
  const {
    width,
    height
  } = props;
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.SVG, {
    id: "Layer_1",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 47.507 48",
    width: width,
    height: height
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Defs, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.LinearGradient, {
    id: "linear-gradient",
    x1: "15.044",
    y1: "46.627",
    x2: "31.956",
    y2: ".16",
    gradientUnits: "userSpaceOnUse"
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Stop, {
    offset: 0,
    stopColor: "#7d58c6"
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Stop, {
    offset: .261,
    stopColor: "#677bc9"
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Stop, {
    offset: .581,
    stopColor: "#51a1cc"
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Stop, {
    offset: .838,
    stopColor: "#44b8cf"
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Stop, {
    offset: 1,
    stopColor: "#3fc1d0"
  }))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Circle, {
    cx: "43.966",
    cy: "3.54",
    r: "3.54",
    style: {
      fill: "#7a7a7a"
    }
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_1__.Path, {
    d: "m43.966,9.895c-3.509,0-6.354-2.845-6.354-6.354,0-.437.044-.863.128-1.275h-14.873C10.238,2.266,0,12.504,0,25.133h0c0,12.629,10.238,22.867,22.867,22.867h0c12.629,0,22.867-10.238,22.867-22.867v-15.489c-.562.162-1.154.251-1.768.251Zm-12.953,26.821l-8.146-4.073-8.146,4.073,1.534-9.001-5.607-6.272,8.146-1.018,4.073-8.146,4.073,8.146,8.146,1.018-5.594,6.272,1.521,9.001Z",
    style: {
      fill: "url(#linear-gradient)"
    }
  }));
}

/***/ }),

/***/ "./src/components/toggle.js":
/*!**********************************!*\
  !*** ./src/components/toggle.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_logo_mark__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/logo-mark */ "./src/components/logo-mark.js");





const PTSToggle = props => {
  const {
    postType,
    isFeatured,
    onUpdateFeatured
  } = props;
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalHStack, {
    alignment: "top",
    justify: "flex-start",
    spacing: "3",
    style: {
      marginTop: "calc(12px)",
      minHeight: '3rem'
    }
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Tooltip, {
    text: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('You can query all featured %1$s using the pts_feature_tax'), postType)
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Icon, {
    icon: (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_logo_mark__WEBPACK_IMPORTED_MODULE_4__["default"], {
      width: '24px',
      height: '24px'
    })
  })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
    checked: isFeatured,
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Feature %1$s', 'post-type-spotlight'), (0,lodash__WEBPACK_IMPORTED_MODULE_3__.capitalize)(postType)),
    onChange: onUpdateFeatured,
    style: {
      marginBottom: "0!important"
    }
  }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PTSToggle);

/***/ }),

/***/ "./src/query-loop/controls.js":
/*!************************************!*\
  !*** ./src/query-loop/controls.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "withPSTQueryControls": () => (/* binding */ withPSTQueryControls)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_filter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/filter */ "./src/components/filter.js");





const withPSTQueryControls = BlockEdit => props => {
  const isPTSQueryLoopVariation = props => {
    const {
      attributes: {
        namespace
      }
    } = props;
    return namespace === 'post-type-spotlight/featured-list';
  };
  return isPTSQueryLoopVariation(props) ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(BlockEdit, {
    ...props
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_filter__WEBPACK_IMPORTED_MODULE_4__["default"], {
    ...props
  })))) : (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(BlockEdit, {
    ...props
  });
};
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_2__.addFilter)('editor.BlockEdit', 'core/query', withPSTQueryControls);

/***/ }),

/***/ "./src/query-loop/index.js":
/*!*********************************!*\
  !*** ./src/query-loop/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_logo_mark__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/logo-mark */ "./src/components/logo-mark.js");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _controls__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./controls */ "./src/query-loop/controls.js");



 // Load out controls

const VARIATION_NAME = 'post-type-spotlight/featured-list';
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_2__.registerBlockVariation)('core/query', {
  name: VARIATION_NAME,
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Featured List', 'post-type-spotlight'),
  description: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Displays a list of posts that are marked as featured.', 'post-type-spotlight'),
  isActive: ({
    namespace,
    query
  }) => {
    return namespace === VARIATION_NAME;
  },
  isPTSQueryLoopVariation: ({
    namespace,
    query
  }) => {
    return namespace === VARIATION_NAME;
  },
  icon: _components_logo_mark__WEBPACK_IMPORTED_MODULE_1__["default"],
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
      inherit: false
    },
    queryType: 'featured-only'
  },
  scope: ['inserter'],
  innerBlocks: [['core/post-template', {}, [['core/post-title'], ['core/post-excerpt']]], ['core/query-pagination'], ['core/query-no-results']],
  allowedControls: ['postType', 'search', 'taxQuery']
});

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ ((module) => {

module.exports = window["lodash"];

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/core-data":
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["coreData"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/edit-post":
/*!**********************************!*\
  !*** external ["wp","editPost"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["editPost"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ ((module) => {

module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "@wordpress/plugins":
/*!*********************************!*\
  !*** external ["wp","plugins"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["plugins"];

/***/ }),

/***/ "@wordpress/primitives":
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["primitives"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _admin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./admin */ "./src/admin/index.js");
/* harmony import */ var _query_loop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./query-loop */ "./src/query-loop/index.js");
/**
 * Register all admin slotfills
 */
 // Toggle Sidebar
 // Query Loop
})();

/******/ })()
;
//# sourceMappingURL=index.js.map