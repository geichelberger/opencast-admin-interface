import { PayloadAction, SerializedError, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { eventsTableConfig } from "../configs/tableConfigs/eventsTableConfig";
import axios from 'axios';
import moment from "moment-timezone";
import {
	getURLParams,
	prepareAccessPolicyRulesForPost,
	prepareExtendedMetadataFieldsForPost,
	prepareMetadataFieldsForPost,
	transformMetadataCollection,
} from "../utils/resourceUtils";
import { makeTwoDigits } from "../utils/utils";
import { sourceMetadata } from "../configs/sourceConfig";
import {
	NOTIFICATION_CONTEXT,
	weekdays,
	WORKFLOW_UPLOAD_ASSETS_NON_TRACK,
} from "../configs/modalConfig";
import { addNotification } from '../thunks/notificationThunks';
import { removeNotification } from '../actions/notificationActions';
import { getAssetUploadOptions, getSchedulingEditedEvents } from '../selectors/eventSelectors';
import { fetchSeriesOptions } from '../thunks/seriesThunks';
import { RootState } from '../store';
import { fetchAssetUploadOptions } from '../thunks/assetsThunks';

/**
 * This file contains redux reducer for actions affecting the state of events
 */
type Comment = {
	reason: string,
	resolvedStatus: boolean,
	modificationDate: string,
	replies: {
		id: number,
		text: string,
		creationDate: string,
		modificationDate: string,
		author: {
			name: string,
			email?: string,
			username: string,
		}
	}[],
	author: {
		name: string,
		email?: string,
		username: string,
	},
	id: number,
	text: string,
	creationDate: string,
}

// Strings will be empty if there is no value
type Event = {
	agent_id: string,
	comments?: Comment[],
	date: string,
	displayable_status: string,
	end_date: string,
	event_status: string,
	has_comments: boolean,
	has_open_comments: boolean,
	has_preview: boolean,
	id: string,
	location: string,
	managedAcl: string,
	needs_cutting: boolean,
	presenters: string[],
	publications: {
		enabled: boolean,
		hiding: boolean,
		id: string,
		name: string,
		url: string,
	}[],
	series?: { id: string, title: string }
	source: string,
	start_date: string,
	technical_end: string,
	technical_presenters: string[],
	technical_start: string,
	title: string,
	workflow_state: string,
}

type MetadataCatalog = {
	title: string,
	flavor: string,
	fields: {
		collection?: {}[],	// different for e.g. languages and presenters
		id: string,
		label: string,
		readOnly: boolean,
		required: boolean,
		translatable?: boolean,
		type: string,
		value: string | string[],
	}[]
}

type EditedEvents = {
	changedDeviceInputs: string[],
	changedEndTimeHour: string,
	changedEndTimeMinutes: string,
	changedLocation: string,
	changedSeries: string,
	changedStartTimeHour: string,
	changedStartTimeMinutes: string,
	changedTitle: string,
	changedWeekday: string,
	deviceInputs: string,
	endTimeHour: string,
	endTimeMinutes: string,
	eventId: string,
	location: string,
	series: string,
	startTimeHour: string,
	startTimeMinutes: string,
	title: string,
	weekday: string,
}

type EventState = {
	status: 'uninitialized' | 'loading' | 'succeeded' | 'failed',
	error: SerializedError | null,
	statusMetadata: 'uninitialized' | 'loading' | 'succeeded' | 'failed',
	errorMetadata: SerializedError | null,
	statusSchedulingInfo: 'uninitialized' | 'loading' | 'succeeded' | 'failed',
	errorSchedulingInfo: SerializedError | null,
	statusAssetUploadOptions: 'uninitialized' | 'loading' | 'succeeded' | 'failed',
	errorAssetUploadOptions: SerializedError | null,
	results: Event[],
	columns: any,			 // TODO: proper typing, derive from `initialColumns`
	total: number,
	count: number,
	offset: number,
	limit: number,
	showActions: boolean,
	metadata: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	isFetchingAssetUploadOptions: boolean,
	uploadAssetOptions: any[],		// TODO: proper typing
	uploadAssetWorkflow: any,		// TODO: proper typing
	schedulingInfo: {
		editedEvents: EditedEvents[],
		seriesOptions: {
			name: string,
			value: string,
		}[],
	},
}

// Fill columns initially with columns defined in eventsTableConfig
const initialColumns = eventsTableConfig.columns.map((column) => ({
	...column,
	deactivated: false,
}));

// Initial state of events in redux store
const initialState: EventState = {
	status: 'uninitialized',
	error: null,
	statusMetadata: 'uninitialized',
	errorMetadata: null,
	statusSchedulingInfo: 'uninitialized',
	errorSchedulingInfo: null,
	statusAssetUploadOptions: 'uninitialized',
	errorAssetUploadOptions: null,
  results: [],
	columns: initialColumns,
	total: 0,
	count: 0,
	limit: 0,
	offset: 0,
	showActions: false,
	metadata: {
		title: "",
		flavor: "",
		fields: [],
	},
	extendedMetadata: [],
	isFetchingAssetUploadOptions: false,
	uploadAssetOptions: [],
	uploadAssetWorkflow: "",
	schedulingInfo: {
		editedEvents: [],
		seriesOptions: [],
	},
};

// fetch events from server
export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, { getState }) => {
	const state = getState();
	let params = getURLParams(state);
	// Just make the async request here, and return the response.
	// This will automatically dispatch a `pending` action first,
	// and then `fulfilled` or `rejected` actions based on the promise.
	const res = await axios.get("/admin-ng/event/events.json", { params: params });
	const response = res.data;

	for (let i = 0; response.results.length > i; i++) {
		// insert date property
		response.results[i] = {
			...response.results[i],
			date: response.results[i].start_date,
		};
		// insert enabled and hiding property of publications, if result has publications
		let result = response.results[i];
		if (!!result.publications && result.publications.length > 0) {
			let transformedPublications = [];
			for (let j = 0; result.publications.length > j; j++) {
				transformedPublications.push({
					...result.publications[j],
					enabled: true,
					hiding: false,
				});
			}
			response.results[i] = {
				...response.results[i],
				publications: transformedPublications,
			};
		}
	}
	const events = response;

	return events;
});

// fetch event metadata from server
export const fetchEventMetadata = createAsyncThunk('events/fetchEventMetadata', async () => {
	let data = await axios.get("/admin-ng/event/new/metadata");
	const response = await data.data;

	const mainCatalog = "dublincore/episode";
	let metadata: any = {};
	const extendedMetadata = [];

	for (const metadataCatalog of response) {
		if (metadataCatalog.flavor === mainCatalog) {
// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
			metadata = transformMetadataCollection({ ...metadataCatalog });
		} else {
			extendedMetadata.push(
// @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
				transformMetadataCollection({ ...metadataCatalog })
			);
		}
	}

	return { metadata, extendedMetadata }
});

// get merged metadata for provided event ids
export const postEditMetadata = createAsyncThunk('events/postEditMetadata', async (ids: any) => {
	let formData = new URLSearchParams();
	formData.append("eventIds", JSON.stringify(ids));

	try {
		let data = await axios.post(
			"/admin-ng/event/events/metadata.json",
			formData,
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);
		let response = await data.data;

		// transform response
		const metadata = transformMetadataCollection(response.metadata, true);
		return {
			mergedMetadata: metadata,
			notFound: response.notFound,
			merged: response.merged,
			runningWorkflow: response.runningWorkflow,
		};
	} catch (e) {
		// return error
		return {
// @ts-expect-error TS(2571): Object is of type 'unknown'.
			fatalError: e.message,
		};
	}
});

export const updateBulkMetadata = createAsyncThunk('events/updateBulkMetadata', async (params: {metadataFields: any, values: any}, { dispatch }) => {
	const { metadataFields, values } = params;

	let formData = new URLSearchParams();
	formData.append("eventIds", JSON.stringify(metadataFields.merged));
	let metadata : { flavor: string, title: string, fields: any[]}[] = [
		{
			flavor: "dublincore/episode",
			title: "EVENTS.EVENTS.DETAILS.CATALOG.EPISODE",
			fields: [],
		},
	];

// @ts-expect-error TS(7006): Parameter 'field' implicitly has an 'any' type.
	metadataFields.mergedMetadata.forEach((field) => {
		if (field.selected) {
			let value = values[field.id];
			metadata[0].fields.push({
				...field,
				value: value,
			});
		}
	});

	formData.append("metadata", JSON.stringify(metadata));

	axios
		.put("/admin-ng/event/events/metadata", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then((res) => {
			console.info(res);
			dispatch(
				addNotification("success", "BULK_METADATA_UPDATE.ALL_EVENTS_UPDATED")
			);
		})
		.catch((err) => {
			console.error(err);
			// if an internal server error occurred, then backend sends further information
			if (err.status === 500) {
				// backend should send data containing further information about occurred internal error
				// if this error data is undefined then an unexpected error occurred
				if (!err.data) {
					dispatch(
						addNotification("error", "BULK_METADATA_UPDATE.UNEXPECTED_ERROR")
					);
				} else {
					if (err.data.updated && err.data.updated.length === 0) {
						dispatch(
							addNotification("error", "BULK_METADATA_UPDATE.NO_EVENTS_UPDATED")
						);
					}
					if (err.data.updateFailures && err.data.updateFailures.length > 0) {
						dispatch(
							addNotification(
								"warning",
								"BULK_METADATA_UPDATE.SOME_EVENTS_NOT_UPDATED"
							)
						);
					}
					if (err.data.notFound && err.data.notFound.length > 0) {
						dispatch(
							addNotification(
								"warning",
								"BULK_ACTIONS.EDIT_EVENTS_METADATA.REQUEST_ERRORS.NOT_FOUND"
							)
						);
					}
				}
			} else {
				dispatch(
					addNotification("error", "BULK_METADATA_UPDATE.UNEXPECTED_ERROR")
				);
			}
		});
});

export const postNewEvent = createAsyncThunk('events/postNewEvent', async (params: {values: any, metadataInfo: any, extendedMetadata: any}, { dispatch, getState }) => {
	const { values, metadataInfo, extendedMetadata } = params;

	// get asset upload options from redux store
	const state = getState();
	const uploadAssetOptions = getAssetUploadOptions(state as RootState);

	let formData = new FormData();
	let metadataFields, extendedMetadataFields, metadata, source, access, assets;
	let configuration = {};

	// prepare metadata provided by user
	metadataFields = prepareMetadataFieldsForPost(metadataInfo.fields, values);
	extendedMetadataFields = prepareExtendedMetadataFieldsForPost(
		extendedMetadata,
		values
	);

	// if source mode is UPLOAD than also put metadata fields of that in metadataFields
	if (values.sourceMode === "UPLOAD") {
		// set source type UPLOAD
		source = {
			type: values.sourceMode,
		};
		for (let i = 0; sourceMetadata.UPLOAD.metadata.length > i; i++) {
			metadataFields = metadataFields.concat({
				id: sourceMetadata.UPLOAD.metadata[i].id,
				value: values[sourceMetadata.UPLOAD.metadata[i].id],
				type: sourceMetadata.UPLOAD.metadata[i].type,
				tabindex: sourceMetadata.UPLOAD.metadata[i].tabindex,
			});
		}
	}

	// metadata for post request
	metadata = [
		{
			flavor: metadataInfo.flavor,
			title: metadataInfo.title,
			fields: metadataFields,
		},
	];

	// transform date data for post request if source mode is SCHEDULE_*
	if (
		values.sourceMode === "SCHEDULE_SINGLE" ||
		values.sourceMode === "SCHEDULE_MULTIPLE"
	) {
		// Get timezone offset
		//let offset = getTimezoneOffset();

		// Prepare start date of event for post
		let startDate = new Date(values.scheduleStartDate);
		// NOTE: if time zone issues still occur during further testing, try to set times to UTC (-offset)
		//startDate.setHours((values.scheduleStartHour - offset), values.scheduleStartMinute, 0, 0);
		startDate.setHours(
			values.scheduleStartHour,
			values.scheduleStartMinute,
			0,
			0
		);

		let endDate;

		// Prepare end date of event for post
		if (values.sourceMode === "SCHEDULE_SINGLE") {
			endDate = new Date(values.scheduleStartDate);
		} else {
			endDate = new Date(values.scheduleEndDate);
		}
		// NOTE: if time zone issues still occur during further testing, try to set times to UTC (-offset)
		//endDate.setHours((values.scheduleEndHour - offset), values.scheduleEndMinute, 0, 0);
		endDate.setHours(values.scheduleEndHour, values.scheduleEndMinute, 0, 0);

		// transform duration into milliseconds
		let duration =
			values.scheduleDurationHours * 3600000 +
			values.scheduleDurationMinutes * 60000;

		// data about source for post request
		source = {
			type: values.sourceMode,
			metadata: {
				start: startDate,
				device: values.location,
				inputs: !!values.deviceInputs ? values.deviceInputs.join(",") : "",
				end: endDate,
				duration: duration.toString(),
			},
		};

		if (values.sourceMode === "SCHEDULE_MULTIPLE") {
			// assemble an iCalendar RRULE (repetition instruction) for the given user input
			let rRule =
				"FREQ=WEEKLY;BYDAY=" +
				values.repeatOn.join(",") +
				";BYHOUR=" +
				startDate.getUTCHours() +
				";BYMINUTE=" +
				startDate.getUTCMinutes();

			source.metadata = {
				...source.metadata,
// @ts-expect-error TS(2322): Type '{ rrule: string; start: Date; device: any; i... Remove this comment to see the full error message
				rrule: rRule,
			};
		}
	}

	// information about upload assets options
	// need to provide all possible upload asset options independent of source mode/type
	assets = {
		workflow: WORKFLOW_UPLOAD_ASSETS_NON_TRACK,
		options: [],
	};

	// iterate through possible upload asset options and put them in assets
	// if source mode/type is UPLOAD and a file for a asset is uploaded by user than append file to form data
	for (let i = 0; uploadAssetOptions.length > i; i++) {
		if (
			uploadAssetOptions[i].type === "track" &&
			values.sourceMode === "UPLOAD"
		) {
			let asset = values.uploadAssetsTrack.find(
// @ts-expect-error TS(7006): Parameter 'asset' implicitly has an 'any' type.
				(asset) => asset.id === uploadAssetOptions[i].id
			);
			if (!!asset.file) {
				if (asset.multiple) {
					for (let j = 0; asset.file.length > j; j++) {
						formData.append(asset.id + "." + j, asset.file[j]);
					}
				} else {
					formData.append(asset.id + ".0", asset.file[0]);
				}
			}
			assets.options = assets.options.concat(uploadAssetOptions[i]);
		} else {
			if (
				!!values[uploadAssetOptions[i].id] &&
				values.sourceMode === "UPLOAD"
			) {
				formData.append(
					uploadAssetOptions[i].id + ".0",
					values[uploadAssetOptions[i].id]
				);
				assets.options = assets.options.concat(uploadAssetOptions[i]);
			}
		}
	}

	// prepare access rules provided by user
	access = prepareAccessPolicyRulesForPost(values.acls);

	// prepare configurations for post
	Object.keys(values.configuration).forEach((config) => {
// @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
		configuration[config] = String(values.configuration[config]);
	});

	for (const entry of extendedMetadataFields) {
		metadata.push(entry);
	}

	formData.append(
		"metadata",
		JSON.stringify({
			metadata: metadata,
			processing: {
				workflow: values.processingWorkflow,
				configuration: configuration,
			},
			access: access,
			source: source,
			assets: assets,
		})
	);

	// Process bar notification
	var config = {
		// @ts-expect-error TS(7006): Parameter 'id' implicitly has an 'any' type.
		onUploadProgress: function(progressEvent) {
			var percentCompleted = (progressEvent.loaded * 100) / progressEvent.total;
			// @ts-expect-error TS(2554): Expected 6 arguments, but got 5.
			dispatch(addNotificationWithId(-42000, "success", "EVENTS_UPLOAD_STARTED", -1, { "progress": percentCompleted.toFixed(2) } ))
			if (percentCompleted >= 100) {
				dispatch(removeNotification(-42000))
			}
		},
		headers: {
			"Content-Type": "multipart/form-data",
		},
	};

	axios
		.post("/admin-ng/event/new", formData, config)
		.then((response) => {
			console.info(response);
			dispatch(addNotification("success", "EVENTS_CREATED"));
		})
		.catch((response) => {
			console.error(response);
			dispatch(addNotification("error", "EVENTS_NOT_CREATED"));
		});
});

// delete event with provided id
export const deleteEvent = createAsyncThunk('events/deleteEvent', async (id: any, { dispatch }) => {
	// API call for deleting an event
	axios
		.delete(`/admin-ng/event/${id}`)
		.then((res) => {
			// add success notification depending on status code
			if (res.status === 200) {
				dispatch(addNotification("success", "EVENT_DELETED"));
			} else {
				dispatch(addNotification("success", "EVENT_WILL_BE_DELETED"));
			}
		})
		.catch((res) => {
			// add error notification depending on status code
			if (res.status === 401) {
				dispatch(addNotification("error", "EVENTS_NOT_DELETED_NOT_AUTHORIZED"));
			} else {
				dispatch(addNotification("error", "EVENTS_NOT_DELETED"));
			}
		});
});

export const deleteMultipleEvent = createAsyncThunk('events/deleteMultipleEvent', async (events: any, { dispatch }) => {
	let data = [];

	for (let i = 0; i < events.length; i++) {
		if (events[i].selected) {
			data.push(events[i].id);
		}
	}

	axios
		.post("/admin-ng/event/deleteEvents", data)
		.then((res) => {
			console.info(res);
			//add success notification
			dispatch(addNotification("success", "EVENTS_DELETED"));
		})
		.catch((res) => {
			console.error(res);
			//add error notification
			dispatch(addNotification("error", "EVENTS_NOT_DELETED"));
		});
});

export const fetchScheduling = createAsyncThunk('events/fetchScheduling', async (params: {events: any, fetchNewScheduling: any, setFormikValue: any}, { dispatch, getState }) => {
	const { events, fetchNewScheduling, setFormikValue } = params;

	let editedEvents = [];

	// Only load schedule info about event, when not loaded before
	if (fetchNewScheduling) {
		let formData = new FormData();

		for (let i = 0; i < events.length; i++) {
			if (events[i].selected) {
				formData.append("eventIds", events[i].id);
			}
		}

// @ts-expect-error TS(2345): Argument of type 'boolean' is not assignable to pa... Remove this comment to see the full error message
		formData.append("ignoreNonScheduled", true);


		const response = await axios.post(
			"/admin-ng/event/scheduling.json",
			formData
		);

		let data = await response.data;

		// transform data for further use
		for (let i = 0; i < data.length; i++) {
			let startDate = new Date(data[i].start);
			let endDate = new Date(data[i].end);
			let event = {
				eventId: data[i].eventId,
				title: data[i].agentConfiguration["event.title"],
				changedTitle: data[i].agentConfiguration["event.title"],
				series: !!data[i].agentConfiguration["event.series"]
					? data[i].agentConfiguration["event.series"]
					: "",
				changedSeries: !!data[i].agentConfiguration["event.series"]
					? data[i].agentConfiguration["event.series"]
					: "",
				location: data[i].agentConfiguration["event.location"],
				changedLocation: data[i].agentConfiguration["event.location"],
				deviceInputs: data[i].agentConfiguration["capture.device.names"],
				changedDeviceInputs: data[i].agentConfiguration[
					"capture.device.names"
				].split(","),
				startTimeHour: makeTwoDigits(startDate.getHours()),
				changedStartTimeHour: makeTwoDigits(startDate.getHours()),
				startTimeMinutes: makeTwoDigits(startDate.getMinutes()),
				changedStartTimeMinutes: makeTwoDigits(startDate.getMinutes()),
				endTimeHour: makeTwoDigits(endDate.getHours()),
				changedEndTimeHour: makeTwoDigits(endDate.getHours()),
				endTimeMinutes: makeTwoDigits(endDate.getMinutes()),
				changedEndTimeMinutes: makeTwoDigits(endDate.getMinutes()),
				weekday: weekdays[(startDate.getDay() + 6) % 7].name,
				changedWeekday: weekdays[(startDate.getDay() + 6) % 7].name,
			};
			editedEvents.push(event);
		}
	} else {
		const state = getState();
		editedEvents = getSchedulingEditedEvents(state as RootState);
	}

	const responseSeriesOptions = await fetchSeriesOptions();

	setFormikValue("editedEvents", editedEvents);

	return { editedEvents, responseSeriesOptions }
});

// update multiple scheduled events at once
export const updateScheduledEventsBulk = createAsyncThunk('events/updateScheduledEventsBulk', async (values: any, { dispatch }) => {
	let formData = new FormData();
	let update = [];
	let timezone = moment.tz.guess();

	for (let i = 0; i < values.changedEvents.length; i++) {
		let eventChanges = values.editedEvents.find(
// @ts-expect-error TS(7006): Parameter 'event' implicitly has an 'any' type.
			(event) => event.eventId === values.changedEvents[i]
		);
		let originalEvent = values.events.find(
// @ts-expect-error TS(7006): Parameter 'event' implicitly has an 'any' type.
			(event) => event.id === values.changedEvents[i]
		);

		if (!eventChanges || !originalEvent) {
			dispatch(
				addNotification(
					"error",
					"EVENTS_NOT_UPDATED_ID",
					10,
					values.changedEvents[i]
				)
			);
			return;
		}

		update.push({
			events: [eventChanges.eventId],
			metadata: {
				flavor: originalEvent.flavor,
				title: "EVENTS.EVENTS.DETAILS.CATALOG.EPISODE",
				fields: [
					{
						id: "title",
						label: "EVENTS.EVENTS.DETAILS.METADATA.TITLE",
						readOnly: false,
						required: false,
						type: "text",
						value: eventChanges.changedTitle,
						// todo: what is hashkey?
						$$hashKey: "object:1588",
					},
					{
						id: "isPartOf",
						collection: {},
						label: "EVENTS.EVENTS.DETAILS.METADATA.SERIES",
						readOnly: false,
						required: false,
						translatable: false,
						type: "text",
						value: eventChanges.changedSeries,
						// todo: what is hashkey?
						$$hashKey: "object:1589",
					},
				],
			},
			scheduling: {
				timezone: timezone,
				start: {
					hour: parseInt(eventChanges.changedStartTimeHour),
					minute: parseInt(eventChanges.changedStartTimeMinutes),
				},
				end: {
					hour: parseInt(eventChanges.changedEndTimeHour),
					minute: parseInt(eventChanges.changedEndTimeMinutes),
				},
				weekday: eventChanges.changedWeekday,
				agentId: eventChanges.changedLocation,
				// the following two lines can be commented in, when the possibility of a selection of individual inputs is desired and the backend has been adapted to support it (the word inputs may have to be replaced accordingly)
				//,
				//inputs: eventChanges.changedDeviceInputs.join(',')
			},
		});
	}

	formData.append("update", JSON.stringify(update));

	axios
		.put("/admin-ng/event/bulk/update", formData)
		.then((res) => {
			console.info(res);
			dispatch(addNotification("success", "EVENTS_UPDATED_ALL"));
		})
		.catch((res) => {
			console.error(res);
			dispatch(addNotification("error", "EVENTS_NOT_UPDATED_ALL"));
		});
});

// check provided date range for conflicts
// @ts-expect-error TS(7006): Parameter 'values' implicitly has an 'any' type.
export const checkConflicts = (values) => async (dispatch) => {
	let check = true;

	// Only perform checks if source mode is SCHEDULE_SINGLE or SCHEDULE_MULTIPLE
	if (
		values.sourceMode === "SCHEDULE_SINGLE" ||
		values.sourceMode === "SCHEDULE_MULTIPLE"
	) {
		// Get timezone offset; Checks should be performed on UTC times
		// let offset = getTimezoneOffset();

		// Prepare start date of event for check
		let startDate = new Date(values.scheduleStartDate);
		// NOTE: if time zone issues still occur during further testing, try to set times to UTC (-offset)
		startDate.setHours(
			values.scheduleStartHour,
			values.scheduleStartMinute,
			0,
			0
		);

		// If start date of event is smaller than today --> Event is in past
		if (values.sourceMode === "SCHEDULE_SINGLE" && startDate < new Date()) {
			dispatch(
				addNotification(
					"error",
					"CONFLICT_ALREADY_ENDED",
					-1,
					null,
					NOTIFICATION_CONTEXT
				)
			);
			check = false;
		}

		const endDate = new Date(values.scheduleEndDate);
		// NOTE: if time zone issues still occur during further testing, try to set times to UTC (-offset)
		endDate.setHours(values.scheduleEndHour, values.scheduleEndMinute, 0, 0);

		// if start date is higher than end date --> end date is before start date
		if (startDate > endDate) {
			dispatch(
				addNotification(
					"error",
					"CONFLICT_END_BEFORE_START",
					-1,
					null,
					NOTIFICATION_CONTEXT
				)
			);
			check = false;
		}

		// transform duration into milliseconds (needed for API request)
		let duration =
			values.scheduleDurationHours * 3600000 +
			values.scheduleDurationMinutes * 60000;

		// Check for conflicts with other already scheduled events
		let conflicts =
			values.sourceMode === "SCHEDULE_SINGLE"
				? await checkForConflicts(startDate, endDate, duration, values.location)
				: await checkForConflicts(
						startDate,
						endDate,
						duration,
						values.location,
						values.repeatOn
				  );

		// If conflicts with already scheduled events detected --> need to change times/date
		if (conflicts) {
			dispatch(
				addNotification(
					"error",
					"CONFLICT_DETECTED",
					-1,
					null,
					NOTIFICATION_CONTEXT
				)
			);
			check = false;
		}
	}
	return check;
};

// Check for conflicts with already scheduled events
export const checkForConflicts = async (
// @ts-expect-error TS(7006): Parameter 'startDate' implicitly has an 'any' type... Remove this comment to see the full error message
	startDate,
// @ts-expect-error TS(7006): Parameter 'endDate' implicitly has an 'any' type.
	endDate,
// @ts-expect-error TS(7006): Parameter 'duration' implicitly has an 'any' type.
	duration,
// @ts-expect-error TS(7006): Parameter 'device' implicitly has an 'any' type.
	device,
	repeatOn = null
) => {
	let metadata = !!repeatOn
		? {
				start: startDate,
				device: device,
				duration: duration.toString(),
				end: endDate,
// @ts-expect-error TS(2339): Property 'join' does not exist on type 'never'.
				rrule: `FREQ=WEEKLY;BYDAY=${repeatOn.join()};BYHOUR=${startDate.getHours()};BYMINUTE=${startDate.getMinutes()}`,
			}
		: {
				start: startDate,
				device: device,
				duration: duration.toString(),
				end: endDate,
			};
	let status = 0;

	let formData = new URLSearchParams();
	formData.append("metadata", JSON.stringify(metadata));

	return await axios
		.post("/admin-ng/event/new/conflicts", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then((response) => {
			status = response.status;
			return status === 409;
		})
		.catch((reason) => {
			status = reason.response.status;
			return status === 409;
		});
};

// check if there are any scheduling conflicts with other events
// @ts-expect-error TS(7006): Parameter 'events' implicitly has an 'any' type.
export const checkForSchedulingConflicts = (events) => async (dispatch) => {
	const formData = new FormData();
	let update = [];
	let timezone = moment.tz.guess();
	for (let i = 0; i < events.length; i++) {
		update.push({
			events: [events[i].eventId],
			scheduling: {
				timezone: timezone,
				start: {
					hour: parseInt(events[i].changedStartTimeHour),
					minute: parseInt(events[i].changedStartTimeMinutes),
				},
				end: {
					hour: parseInt(events[i].changedEndTimeHour),
					minutes: parseInt(events[i].changedEndTimeMinutes),
				},
				weekday: events[i].changedWeekday,
				agentId: events[i].changedLocation,
			},
		});
	}

	formData.append("update", JSON.stringify(update));

// @ts-expect-error TS(7034): Variable 'response' implicitly has type 'any[]' in... Remove this comment to see the full error message
	let response = [];

	axios
		.post("/admin-ng/event/bulk/conflicts", formData)
		.then((res) => console.info(res))
		.catch((res) => {
			if (res.status === 409) {
				dispatch(
					addNotification(
						"error",
						"CONFLICT_BULK_DETECTED",
						-1,
						null,
						NOTIFICATION_CONTEXT
					)
				);
				response = res.data;
			}
			console.error(res);
		});

// @ts-expect-error TS(7005): Variable 'response' implicitly has an 'any[]' type... Remove this comment to see the full error message
	return response;
};

const eventSlice = createSlice({
	name: 'events',
	initialState,
	reducers: {
		setEventColumns(state, action: PayloadAction<
			EventState["columns"]
		>) {
			state.columns = action.payload.updatedColumns;
		},
		setShowActions(state, action: PayloadAction<
			EventState["showActions"]
		>) {
			state.showActions = action.payload;
		},
		setEventSelected(state, action: PayloadAction<
			any
		>) {
			// state.rows: state.rows.map((row) => {
			// 	if (row.id === id) {
			// 		return {
			// 			...row,
			// 			selected: !row.selected,
			// 		};
			// 	}
			// 	return row;
			// }),
		},
		setAssetUploadWorkflow(state, action: PayloadAction<{
			workflow: EventState["columns"],
		}>) {
			state.uploadAssetWorkflow = action.payload.workflow;
		},
	},
	// These are used for thunks
	extraReducers: builder => {
		builder
			.addCase(fetchEvents.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchEvents.fulfilled, (state, action: PayloadAction<{
				total: EventState["total"],
				count: EventState["count"],
				limit: EventState["limit"],
				offset: EventState["offset"],
				results: EventState["results"],
			}>) => {
				state.status = 'succeeded';
				const events = action.payload;
				state.total = events.total;
				state.count = events.count;
				state.limit = events.limit;
				state.offset = events.offset;
				state.results = events.results;
			})
			.addCase(fetchEvents.rejected, (state, action) => {
				state.status = 'failed';
				state.results = [];
				state.error = action.error;
			})
			.addCase(fetchEventMetadata.pending, (state) => {
				state.statusMetadata = 'loading';
			})
			.addCase(fetchEventMetadata.fulfilled, (state, action: PayloadAction<{
				metadata: EventState["metadata"],
				extendedMetadata: EventState["extendedMetadata"],
			}>) => {
				state.statusMetadata = 'succeeded';
				const eventMetadata = action.payload;
				state.metadata = eventMetadata.metadata;
				state.extendedMetadata = eventMetadata.extendedMetadata;
			})
			.addCase(fetchEventMetadata.rejected, (state, action) => {
				state.statusMetadata = 'failed';
				state.extendedMetadata = [];
				state.errorMetadata = action.error;
			})
			.addCase(fetchScheduling.pending, (state) => {
				state.statusSchedulingInfo = 'loading';
			})
			.addCase(fetchScheduling.fulfilled, (state, action: PayloadAction<{
				editedEvents: EventState["schedulingInfo"]["editedEvents"],
				responseSeriesOptions: EventState["schedulingInfo"]["seriesOptions"],
			}>) => {
				state.statusSchedulingInfo = 'succeeded';
				const schedulingInfo = action.payload;
				state.schedulingInfo.editedEvents = schedulingInfo.editedEvents;
				state.schedulingInfo.seriesOptions = schedulingInfo.responseSeriesOptions;
			})
			.addCase(fetchScheduling.rejected, (state, action) => {
				state.statusSchedulingInfo = 'failed';
				state.schedulingInfo.editedEvents = [];
				state.errorSchedulingInfo = action.error;
			})
			.addCase(fetchAssetUploadOptions.pending, (state) => {
				state.statusAssetUploadOptions = 'loading';
			})
			.addCase(fetchAssetUploadOptions.fulfilled, (state, action: PayloadAction<{
				workflow: EventState["uploadAssetWorkflow"],
				newAssetUploadOptions: EventState["uploadAssetOptions"],
			} | undefined>) => {
				state.statusAssetUploadOptions = 'succeeded';
				const assetUpload = action.payload;
				if (assetUpload) {
					state.uploadAssetWorkflow = assetUpload.workflow;
					state.uploadAssetOptions = assetUpload.newAssetUploadOptions;
				}
			})
			.addCase(fetchAssetUploadOptions.rejected, (state, action) => {
				state.statusAssetUploadOptions = 'failed';
				state.schedulingInfo.editedEvents = [];
				state.errorAssetUploadOptions = action.error;
			});
	}
});

export const {
	setEventColumns,
	setShowActions,
	setEventSelected,
	setAssetUploadWorkflow,
} = eventSlice.actions;

// Export the slice reducer as the default export
export default eventSlice.reducer;
