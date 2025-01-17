import React from "react";
import { connect } from "react-redux";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import Notifications from "../../../shared/Notifications";
import {
	getAssetPublicationDetails,
	isFetchingAssets,
} from "../../../../selectors/eventDetailsSelectors";
import { humanReadableBytesFilter } from "../../../../utils/eventDetailsUtils";

/**
 * This component manages the publication details sub-tab for assets tab of event details modal
 */
const EventDetailsAssetPublicationDetails = ({
// @ts-expect-error TS(7031): Binding element 'eventId' implicitly has an 'any' ... Remove this comment to see the full error message
	eventId,
// @ts-expect-error TS(7031): Binding element 't' implicitly has an 'any' type.
	t,
// @ts-expect-error TS(7031): Binding element 'setHierarchy' implicitly has an '... Remove this comment to see the full error message
	setHierarchy,
// @ts-expect-error TS(7031): Binding element 'publication' implicitly has an 'a... Remove this comment to see the full error message
	publication,
// @ts-expect-error TS(7031): Binding element 'isFetching' implicitly has an 'an... Remove this comment to see the full error message
	isFetching,
}) => {
// @ts-expect-error TS(7006): Parameter 'subTabName' implicitly has an 'any' typ... Remove this comment to see the full error message
	const openSubTab = (subTabName) => {
		setHierarchy(subTabName);
	};

	return (
		<div className="modal-content">
			{/* Hierarchy navigation */}
			<EventDetailsTabHierarchyNavigation
				openSubTab={openSubTab}
				hierarchyDepth={1}
				translationKey0={"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.TITLE"}
				subTabArgument0={"asset-publications"}
				translationKey1={
					"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.TITLE"
				}
				subTabArgument1={"publication-details"}
			/>

			<div className="modal-body">
				{/* Notifications */}
				<Notifications context="not_corner" />

				{/* table with details for the publication */}
				<div className="full-col">
					<div className="obj tbl-container operations-tbl">
						<header>
							{
								t(
									"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.CAPTION"
								) /* Publication Details */
							}
						</header>
						<div className="obj-container">
							<table className="main-tbl">
								{isFetching || (
									<tbody>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.ID"
													) /* Id */
												}
											</td>
											<td>{publication.id}</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.TYPE"
													) /* Type */
												}
											</td>
											<td>{publication.type}</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.MIMETYPE"
													) /* Mimetype */
												}
											</td>
											<td>{publication.mimetype}</td>
										</tr>
										{!!publication.size && publication.size > 0 && (
											<tr>
												<td>
													{
														t(
															"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.SIZE"
														) /* Size */
													}
												</td>
												<td>{humanReadableBytesFilter(publication.size)}</td>
											</tr>
										)}
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.CHANNEL"
													) /* Channel */
												}
											</td>
											<td>{publication.channel}</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.REFERENCE"
													) /* Reference */
												}
											</td>
											<td>{publication.reference}</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.TAGS"
													) /* Tags */
												}
											</td>
											<td>
												{!!publication.tags && publication.tags.length > 0
													? publication.tags.join(", ")
													: null}
											</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.PUBLICATIONS.DETAILS.URL"
													) /* Link */
												}
											</td>
											<td>
												<a
													className="fa fa-external-link"
													href={publication.url}
												/>
											</td>
										</tr>
									</tbody>
								)}
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Getting state data out of redux store
// @ts-expect-error TS(7006): Parameter 'state' implicitly has an 'any' type.
const mapStateToProps = (state) => ({
	isFetching: isFetchingAssets(state),
	publication: getAssetPublicationDetails(state),
});

export default connect(mapStateToProps)(EventDetailsAssetPublicationDetails);
