/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	createInterpolateElement,
	useCallback,
	useMemo,
	useState,
} from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import apiFetch from '@wordpress/api-fetch';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import {
	Button,
	Notice,
	Spinner,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import { pencil, trash } from '@wordpress/icons';

/**
 * External dependencies
 */
import { SettingsCard } from '@linchpinagency/ui';

/**
 * Internal dependencies
 */
import { useRoute } from '../hooks';

const ROUTE = '/post-type-spotlight/v1/admin/feature-types';

const DEFAULT_VIEW = {
	type: 'table',
	page: 1,
	perPage: 20,
	sort: { field: 'name', direction: 'asc' },
	fields: [ 'name', 'slug', 'count' ],
	layout: {},
};

/**
 * The feature types section: what exists, and a form to add another.
 *
 * @param {Object} props            Props.
 * @param {string} props.writingUrl Settings, Writing, where post types are enabled.
 * @return {Element} View.
 */
export default function FeatureTypesView( { writingUrl } ) {
	const { data, error, isLoading, refetch } = useRoute( ROUTE );

	if ( error ) {
		return (
			<Notice status="error" isDismissible={ false }>
				{ error.message ||
					__(
						'The feature types could not be loaded.',
						'post-type-spotlight'
					) }
			</Notice>
		);
	}

	if ( isLoading && ! data ) {
		return (
			<div className="post-type-spotlight-admin__loading">
				<Spinner />
				<span>{ __( 'Loading…', 'post-type-spotlight' ) }</span>
			</div>
		);
	}

	/*
	 * The taxonomy is only registered once a post type can be featured, so
	 * until then there is nowhere for a feature type to live.
	 */
	if ( ! data?.ready ) {
		return (
			<Notice status="warning" isDismissible={ false }>
				{ createInterpolateElement(
					__(
						'No post type can be featured yet, so there is nothing to add feature types to. <a>Choose post types</a> first.',
						'post-type-spotlight'
					),
					// eslint-disable-next-line jsx-a11y/anchor-has-content -- The text comes from the interpolated string.
					{ a: <a href={ writingUrl } /> }
				) }
			</Notice>
		);
	}

	return (
		<>
			<FeatureTypesTable
				types={ data.types }
				isLoading={ isLoading }
				onChange={ refetch }
			/>
			<AddFeatureType onAdded={ refetch } />
		</>
	);
}

/**
 * Every feature type, with edit and delete for all but Featured.
 *
 * @param {Object}   props           Props.
 * @param {Object[]} props.types     Feature types from the route.
 * @param {boolean}  props.isLoading Whether a refetch is in flight.
 * @param {Function} props.onChange  Called after an edit or a delete.
 * @return {Element} The table.
 */
function FeatureTypesTable( { types, isLoading, onChange } ) {
	const [ view, setView ] = useState( DEFAULT_VIEW );

	/*
	 * The description sits under the name, as it does in core's term list
	 * tables, rather than in a column of its own: beside the help column a
	 * fourth column pushed Posts under the sticky actions cell. Nothing here
	 * is worth filtering by, so no field offers it.
	 */
	const fields = useMemo(
		() => [
			{
				id: 'name',
				label: __( 'Name', 'post-type-spotlight' ),
				enableHiding: false,
				enableSorting: true,
				filterBy: false,
				getValue: ( { item } ) => item.name,
				render: ( { item } ) => (
					<div className="post-type-spotlight-admin__type">
						<span className="post-type-spotlight-admin__type-name">
							{ item.name }
							{ item.builtIn && (
								<span className="post-type-spotlight-admin__badge">
									{ __( 'Built in', 'post-type-spotlight' ) }
								</span>
							) }
						</span>
						{ item.description && (
							<span className="post-type-spotlight-admin__type-description">
								{ item.description }
							</span>
						) }
					</div>
				),
			},
			{
				id: 'slug',
				label: __( 'Slug', 'post-type-spotlight' ),
				enableSorting: true,
				filterBy: false,
				render: ( { item } ) => <code>{ item.slug }</code>,
			},
			{
				id: 'count',
				label: __( 'Posts', 'post-type-spotlight' ),
				type: 'integer',
				enableSorting: true,
				filterBy: false,
			},
		],
		[]
	);

	const actions = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit', 'post-type-spotlight' ),
				icon: pencil,
				isPrimary: true,
				isEligible: ( item ) => ! item.builtIn,
				modalHeader: __( 'Edit feature type', 'post-type-spotlight' ),
				RenderModal: ( { items, closeModal } ) => (
					<EditFeatureType
						type={ items[ 0 ] }
						closeModal={ closeModal }
						onSaved={ onChange }
					/>
				),
			},
			{
				id: 'delete',
				label: __( 'Delete', 'post-type-spotlight' ),
				icon: trash,
				isPrimary: true,
				isDestructive: true,
				isEligible: ( item ) => ! item.builtIn,
				modalHeader: __( 'Delete feature type', 'post-type-spotlight' ),
				RenderModal: ( { items, closeModal } ) => (
					<DeleteFeatureType
						type={ items[ 0 ] }
						closeModal={ closeModal }
						onDeleted={ onChange }
					/>
				),
			},
		],
		[ onChange ]
	);

	// The route returns the whole list, so DataViews sorts and pages it here.
	const { data: shown, paginationInfo } = filterSortAndPaginate(
		types,
		view,
		fields
	);

	return (
		<SettingsCard
			title={ __( 'Feature types', 'post-type-spotlight' ) }
			description={ __(
				'Every kind of featured this site has. Featured is built in; the rest are yours to rename or delete.',
				'post-type-spotlight'
			) }
		>
			<div className="post-type-spotlight-admin__types">
				<DataViews
					data={ shown }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					actions={ actions }
					isLoading={ isLoading }
					paginationInfo={ paginationInfo }
					defaultLayouts={ { table: {} } }
					getItemId={ ( item ) => String( item.id ) }
					search={ false }
				/>
			</div>
		</SettingsCard>
	);
}

/**
 * The form that adds a feature type.
 *
 * @param {Object}   props         Props.
 * @param {Function} props.onAdded Called once the type exists.
 * @return {Element} The card.
 */
function AddFeatureType( { onAdded } ) {
	const [ name, setName ] = useState( '' );
	const [ slug, setSlug ] = useState( '' );
	const [ description, setDescription ] = useState( '' );
	const [ isBusy, setBusy ] = useState( false );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	const add = async ( event ) => {
		event.preventDefault();

		if ( ! name.trim() || isBusy ) {
			return;
		}

		setBusy( true );

		try {
			const created = await apiFetch( {
				path: ROUTE,
				method: 'POST',
				data: { name, slug, description },
			} );

			createSuccessNotice(
				sprintf(
					/* translators: %s: feature type name, e.g. "Recommended". */
					__( '“%s” added.', 'post-type-spotlight' ),
					created.name
				),
				{ type: 'snackbar' }
			);

			setName( '' );
			setSlug( '' );
			setDescription( '' );
			onAdded();
		} catch ( err ) {
			createErrorNotice(
				err?.message ||
					__(
						'The feature type could not be added.',
						'post-type-spotlight'
					),
				{ type: 'snackbar' }
			);
		} finally {
			setBusy( false );
		}
	};

	return (
		<SettingsCard
			title={ __( 'Add a feature type', 'post-type-spotlight' ) }
			description={ __(
				'It appears in the editor’s Spotlight row, Quick Edit, and the Featured List block as soon as it is added.',
				'post-type-spotlight'
			) }
		>
			<form className="post-type-spotlight-admin__form" onSubmit={ add }>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Name', 'post-type-spotlight' ) }
					help={ __(
						'What editors see, e.g. Recommended.',
						'post-type-spotlight'
					) }
					value={ name }
					onChange={ setName }
					required
				/>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Slug', 'post-type-spotlight' ) }
					help={ __(
						'What code and the Featured List block refer to it by. Leave it blank to make one from the name. It cannot be changed later.',
						'post-type-spotlight'
					) }
					value={ slug }
					onChange={ setSlug }
				/>
				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'Description', 'post-type-spotlight' ) }
					help={ __(
						'Optional. A note for whoever manages these.',
						'post-type-spotlight'
					) }
					value={ description }
					onChange={ setDescription }
					rows={ 2 }
				/>
				<div>
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
						isBusy={ isBusy }
						disabled={ isBusy || ! name.trim() }
						accessibleWhenDisabled
					>
						{ __( 'Add feature type', 'post-type-spotlight' ) }
					</Button>
				</div>
			</form>
		</SettingsCard>
	);
}

/**
 * The Edit action's modal: name and description, never the slug.
 *
 * @param {Object}   props            Props.
 * @param {Object}   props.type       The feature type.
 * @param {Function} props.closeModal Closes the modal.
 * @param {Function} props.onSaved    Called once the change is stored.
 * @return {Element} The form.
 */
function EditFeatureType( { type, closeModal, onSaved } ) {
	const [ name, setName ] = useState( type.name );
	const [ description, setDescription ] = useState( type.description );
	const [ isBusy, setBusy ] = useState( false );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	const save = useCallback(
		async ( event ) => {
			event.preventDefault();

			if ( ! name.trim() || isBusy ) {
				return;
			}

			setBusy( true );

			try {
				await apiFetch( {
					path: `${ ROUTE }/${ type.id }`,
					method: 'POST',
					data: { name, description },
				} );

				createSuccessNotice(
					__( 'Feature type saved.', 'post-type-spotlight' ),
					{ type: 'snackbar' }
				);
				closeModal();
				onSaved();
			} catch ( err ) {
				createErrorNotice(
					err?.message ||
						__(
							'The feature type could not be saved.',
							'post-type-spotlight'
						),
					{ type: 'snackbar' }
				);
				setBusy( false );
			}
		},
		[
			closeModal,
			createErrorNotice,
			createSuccessNotice,
			description,
			isBusy,
			name,
			onSaved,
			type.id,
		]
	);

	return (
		<form className="post-type-spotlight-admin__form" onSubmit={ save }>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Name', 'post-type-spotlight' ) }
				value={ name }
				onChange={ setName }
				required
			/>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Slug', 'post-type-spotlight' ) }
				help={ __(
					'Fixed once a type exists. Featured List blocks and code refer to it, and changing it would empty every list that reads it.',
					'post-type-spotlight'
				) }
				value={ type.slug }
				readOnly
				disabled
				onChange={ () => {} }
			/>
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Description', 'post-type-spotlight' ) }
				value={ description }
				onChange={ setDescription }
				rows={ 2 }
			/>
			<div className="post-type-spotlight-admin__modal-actions">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ closeModal }
					disabled={ isBusy }
				>
					{ __( 'Cancel', 'post-type-spotlight' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					type="submit"
					isBusy={ isBusy }
					disabled={ isBusy || ! name.trim() }
					accessibleWhenDisabled
				>
					{ __( 'Save', 'post-type-spotlight' ) }
				</Button>
			</div>
		</form>
	);
}

/**
 * The Delete action's modal: says what deleting takes with it, then does it.
 *
 * @param {Object}   props            Props.
 * @param {Object}   props.type       The feature type.
 * @param {Function} props.closeModal Closes the modal.
 * @param {Function} props.onDeleted  Called once the type is gone.
 * @return {Element} The confirmation.
 */
function DeleteFeatureType( { type, closeModal, onDeleted } ) {
	const [ isBusy, setBusy ] = useState( false );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	const remove = async () => {
		setBusy( true );

		try {
			await apiFetch( {
				path: `${ ROUTE }/${ type.id }`,
				method: 'DELETE',
			} );

			createSuccessNotice(
				sprintf(
					/* translators: %s: feature type name, e.g. "Recommended". */
					__( '“%s” deleted.', 'post-type-spotlight' ),
					type.name
				),
				{ type: 'snackbar' }
			);
			closeModal();
			onDeleted();
		} catch ( err ) {
			createErrorNotice(
				err?.message ||
					__(
						'The feature type could not be deleted.',
						'post-type-spotlight'
					),
				{ type: 'snackbar' }
			);
			setBusy( false );
		}
	};

	return (
		<>
			<p>
				{ type.count
					? sprintf(
							/* translators: 1: feature type name, 2: number of posts. */
							_n(
								'Delete “%1$s”? It is on %2$d post, and deleting it takes it off. Any Featured List set to it will list nothing.',
								'Delete “%1$s”? It is on %2$d posts, and deleting it takes it off all of them. Any Featured List set to it will list nothing.',
								type.count,
								'post-type-spotlight'
							),
							type.name,
							type.count
						)
					: sprintf(
							/* translators: %s: feature type name, e.g. "Recommended". */
							__(
								'Delete “%s”? No post carries it, but any Featured List set to it will list nothing.',
								'post-type-spotlight'
							),
							type.name
						) }
			</p>
			<div className="post-type-spotlight-admin__modal-actions">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ closeModal }
					disabled={ isBusy }
				>
					{ __( 'Cancel', 'post-type-spotlight' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isDestructive
					onClick={ remove }
					isBusy={ isBusy }
					disabled={ isBusy }
					accessibleWhenDisabled
				>
					{ __( 'Delete', 'post-type-spotlight' ) }
				</Button>
			</div>
		</>
	);
}
