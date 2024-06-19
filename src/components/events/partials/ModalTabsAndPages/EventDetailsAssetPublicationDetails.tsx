import React from "react";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import Notifications from "../../../shared/Notifications";
import {
	getAssetPublicationDetails,
	isFetchingAssetPublicationDetails,
} from "../../../../selectors/eventDetailsSelectors";
import { humanReadableBytesFilter } from "../../../../utils/eventDetailsUtils";
import { useAppSelector } from "../../../../store";
import { AssetTabHierarchy } from "../modals/EventDetails";
import { useTranslation } from "react-i18next";

/**
 * This component manages the publication details sub-tab for assets tab of event details modal
 */
const EventDetailsAssetPublicationDetails = ({
	setHierarchy,
}: {
	setHierarchy: (subTabName: AssetTabHierarchy) => void,
}) => {
	const { t } = useTranslation();

	const publication = useAppSelector(state => getAssetPublicationDetails(state));
	const isFetching = useAppSelector(state => isFetchingAssetPublicationDetails(state));

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
												{/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
												<a
													className="fa fa-external-link"
													href={publication.url}
													target="_blank" rel="noreferrer"
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

export default EventDetailsAssetPublicationDetails;
