import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../shared/ConfirmModal";
import { connect } from "react-redux";
import EventDetailsModal from "./modals/EventDetailsModal";
import EmbeddingCodeModal from "./modals/EmbeddingCodeModal";
import { getUserInformation } from "../../../selectors/userInfoSelectors";
import { hasAccess } from "../../../utils/utils";
import SeriesDetailsModal from "./modals/SeriesDetailsModal";
import {
	fetchNamesOfPossibleThemes,
	fetchSeriesDetailsAcls,
	fetchSeriesDetailsFeeds,
	fetchSeriesDetailsMetadata,
	fetchSeriesDetailsTheme,
} from "../../../thunks/seriesDetailsThunks";
import { useAppDispatch } from "../../../store";
import { deleteEvent } from "../../../slices/eventSlice";

/**
 * This component renders the action cells of events in the table view
 */
const EventActionCell = ({
// @ts-expect-error TS(7031): Binding element 'row' implicitly has an 'any' type... Remove this comment to see the full error message
	row,
// @ts-expect-error TS(7031): Binding element 'fetchSeriesDetailsMetadata' impli... Remove this comment to see the full error message
	fetchSeriesDetailsMetadata,
// @ts-expect-error TS(7031): Binding element 'fetchSeriesDetailsAcls' implicitl... Remove this comment to see the full error message
	fetchSeriesDetailsAcls,
// @ts-expect-error TS(7031): Binding element 'fetchSeriesDetailsFeeds' implicit... Remove this comment to see the full error message
	fetchSeriesDetailsFeeds,
// @ts-expect-error TS(7031): Binding element 'fetchSeriesDetailsTheme' implicit... Remove this comment to see the full error message
	fetchSeriesDetailsTheme,
// @ts-expect-error TS(7031): Binding element 'fetchSeriesDetailsThemeNames' imp... Remove this comment to see the full error message
	fetchSeriesDetailsThemeNames,
// @ts-expect-error TS(7031): Binding element 'user' implicitly has an 'any' typ... Remove this comment to see the full error message
	user,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [displayDeleteConfirmation, setDeleteConfirmation] = useState(false);
	const [displayEventDetailsModal, setEventDetailsModal] = useState(false);
	const [displaySeriesDetailsModal, setSeriesDetailsModal] = useState(false);
	const [eventDetailsTabIndex, setEventDetailsTabIndex] = useState(0);
	const [displayEmbeddingCodeModal, setEmbeddingCodeModal] = useState(false);

	const hideDeleteConfirmation = () => {
		setDeleteConfirmation(false);
	};

// @ts-expect-error TS(7006): Parameter 'id' implicitly has an 'any' type.
	const deletingEvent = (id) => {
		dispatch(deleteEvent(id));
	};

	const hideEmbeddingCodeModal = () => {
		setEmbeddingCodeModal(false);
	};

	const showEmbeddingCodeModal = () => {
		setEmbeddingCodeModal(true);
	};

	const showEventDetailsModal = () => {
		setEventDetailsModal(true);
	};

	const hideEventDetailsModal = () => {
		setEventDetailsModal(false);
	};

	const showSeriesDetailsModal = () => {
		setSeriesDetailsModal(true);
	};

	const hideSeriesDetailsModal = () => {
		setSeriesDetailsModal(false);
	};

	const onClickSeriesDetails = async () => {
		await fetchSeriesDetailsMetadata(row.series.id);
		await fetchSeriesDetailsAcls(row.series.id);
		await fetchSeriesDetailsFeeds(row.series.id);
		await fetchSeriesDetailsTheme(row.series.id);
		await fetchSeriesDetailsThemeNames();

		showSeriesDetailsModal();
	};

	const onClickEventDetails = () => {
		setEventDetailsTabIndex(0);
		showEventDetailsModal();
	};

	const onClickComments = () => {
		setEventDetailsTabIndex(7);
		showEventDetailsModal();
	};

	const onClickWorkflow = () => {
		setEventDetailsTabIndex(5);
		showEventDetailsModal();
	};

	const onClickAssets = () => {
		setEventDetailsTabIndex(3);
		showEventDetailsModal();
	};

	return (
		<>
			{/* Display modal for editing table view if table edit button is clicked */}
			<EventDetailsModal
				showModal={displayEventDetailsModal}
				handleClose={hideEventDetailsModal}
				tabIndex={eventDetailsTabIndex}
				eventTitle={row.title}
				eventId={row.id}
			/>

			{displaySeriesDetailsModal && (
				<SeriesDetailsModal
					handleClose={hideSeriesDetailsModal}
					seriesId={row.series.id}
					seriesTitle={row.series.title}
				/>
			)}

			{/* Open event details */}
			{hasAccess("ROLE_UI_EVENTS_DETAILS_VIEW", user) && (
				<button
					onClick={() => onClickEventDetails()}
					className="button-like-anchor more"
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
					title={t("EVENTS.EVENTS.TABLE.TOOLTIP.DETAILS")}
				/>
			)}

			{/* If event belongs to a series then the corresponding series details can be opened */}
			{!!row.series && hasAccess("ROLE_UI_SERIES_DETAILS_VIEW", user) && (
				<button
					onClick={() => onClickSeriesDetails()}
					className="button-like-anchor more-series"
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
					title={t("EVENTS.SERIES.TABLE.TOOLTIP.DETAILS")}
				/>
			)}

			{/* Delete an event */}
			{/*TODO: needs to be checked if event is published */}
			{hasAccess("ROLE_UI_EVENTS_DELETE", user) && (
				<button
					onClick={() => setDeleteConfirmation(true)}
					className="button-like-anchor remove"
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
					title={t("EVENTS.EVENTS.TABLE.TOOLTIP.DELETE")}
				/>
			)}

			{/* Confirmation for deleting an event*/}
			{displayDeleteConfirmation && (
				<ConfirmModal
					close={hideDeleteConfirmation}
					resourceName={row.title}
					resourceType="EVENT"
					resourceId={row.id}
					deleteMethod={deletingEvent}
				/>
			)}

			{/* If the event has an preview then the editor can be opened and status if it needs to be cut is shown */}
			{!!row.has_preview && hasAccess("ROLE_UI_EVENTS_EDITOR_VIEW", user) && (
				<a
					href={`/editor-ui/index.html?id=${row.id}`}
					className="cut"
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
					title={
						row.needs_cutting
							? t("EVENTS.EVENTS.TABLE.TOOLTIP.EDITOR_NEEDS_CUTTING")
							: t("EVENTS.EVENTS.TABLE.TOOLTIP.EDITOR")
					}
				>
					{row.needs_cutting && <span id="badge" className="badge" />}
				</a>
			)}

			{/* If the event has comments and no open comments then the comment tab of event details can be opened directly */}
			{row.has_comments && !row.has_open_comments && (
				<button
					onClick={() => onClickComments()}
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
					title={t("EVENTS.EVENTS.TABLE.TOOLTIP.COMMENTS")}
					className="button-like-anchor comments"
				/>
			)}

			{/* If the event has comments and open comments then the comment tab of event details can be opened directly */}
			{row.has_comments && row.has_open_comments && (
				<button
					onClick={() => onClickComments()}
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
					title={t("EVENTS.EVENTS.TABLE.TOOLTIP.COMMENTS")}
					className="button-like-anchor comments-open"
				/>
			)}

			{/*If the event is in in a paused workflow state then a warning icon is shown and workflow tab of event
                details can be opened directly */}
			{row.workflow_state === "PAUSED" &&
				hasAccess("ROLE_UI_EVENTS_DETAILS_WORKFLOWS_EDIT", user) && (
					<button
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
						title={t("EVENTS.EVENTS.TABLE.TOOLTIP.PAUSED_WORKFLOW")}
						onClick={() => onClickWorkflow()}
						className="button-like-anchor fa fa-warning"
					/>
				)}

			{/* Open assets tab of event details directly*/}
			{hasAccess("ROLE_UI_EVENTS_DETAILS_ASSETS_VIEW", user) && (
				<button
					onClick={() => onClickAssets()}
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
					title={t("EVENTS.EVENTS.TABLE.TOOLTIP.ASSETS")}
					className="button-like-anchor fa fa-folder-open"
				/>
			)}
			{/* Open dialog for embedded code*/}
			{hasAccess("ROLE_UI_EVENTS_EMBEDDING_CODE_VIEW", user) && (
				<button
					onClick={() => showEmbeddingCodeModal()}
// @ts-expect-error TS(2322): Type 'DefaultTFuncReturn' is not assignable to typ... Remove this comment to see the full error message
					title={t("EVENTS.EVENTS.TABLE.TOOLTIP.EMBEDDING_CODE")}
					className="button-like-anchor fa fa-link"
				/>
			)}

			{displayEmbeddingCodeModal && (
				<EmbeddingCodeModal close={hideEmbeddingCodeModal} eventId={row.id} />
			)}
		</>
	);
};

// Getting state data out of redux store
// @ts-expect-error TS(7006): Parameter 'state' implicitly has an 'any' type.
const mapStateToProps = (state) => ({
	user: getUserInformation(state),
});

// Mapping actions to dispatch
// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
const mapDispatchToProps = (dispatch) => ({
// @ts-expect-error TS(7006): Parameter 'id' implicitly has an 'any' type.
	fetchSeriesDetailsMetadata: (id) => dispatch(fetchSeriesDetailsMetadata(id)),
// @ts-expect-error TS(7006): Parameter 'id' implicitly has an 'any' type.
	fetchSeriesDetailsAcls: (id) => dispatch(fetchSeriesDetailsAcls(id)),
// @ts-expect-error TS(7006): Parameter 'id' implicitly has an 'any' type.
	fetchSeriesDetailsFeeds: (id) => dispatch(fetchSeriesDetailsFeeds(id)),
// @ts-expect-error TS(7006): Parameter 'id' implicitly has an 'any' type.
	fetchSeriesDetailsTheme: (id) => dispatch(fetchSeriesDetailsTheme(id)),
	fetchSeriesDetailsThemeNames: () => dispatch(fetchNamesOfPossibleThemes()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EventActionCell);
