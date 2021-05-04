// All fields for new event form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
import {initArray} from "../utils/utils";

// Context for notifications shown in wizards
export const NOTIFICATION_CONTEXT = 'wizard-form';

// Context for notifications shown in access page
export const NOTIFICATION_CONTEXT_ACCESS = 'wizard-access';

export const initialFormValuesNewEvents = {
    sourceMode: 'UPLOAD',
    scheduleStartDate: new Date().toISOString(),
    scheduleEndDate: new Date().toISOString(),
    scheduleStartTimeHour: '',
    scheduleStartTimeMinutes: '',
    scheduleDurationHour: '',
    scheduleDurationMinutes: '',
    scheduleEndTimeHour: '',
    scheduleEndTimeMinutes: '',
    repeatOn: [],
    location: '',
    deviceInputs: [],
    processingWorkflow: '',
    policies: [{
        role: 'ROLE_USER_ADMIN',
        read: true,
        write: true,
        actions: []
    }]
};

// constants for hours and minutes (used in selection for start/end time and duration)
export const hours = initArray(24);
export const minutes = initArray(60);

// sorted weekdays and their translation key
export const weekdays = [
    {
        name: 'MO',
        label: 'EVENTS.EVENTS.NEW.WEEKDAYS.MO'
    },
    {
        name: 'TU',
        label: 'EVENTS.EVENTS.NEW.WEEKDAYS.TU'
    },
    {
        name: 'WE',
        label: 'EVENTS.EVENTS.NEW.WEEKDAYS.WE'
    },
    {
        name: 'TH',
        label: 'EVENTS.EVENTS.NEW.WEEKDAYS.TH'
    },
    {
        name: 'FR',
        label: 'EVENTS.EVENTS.NEW.WEEKDAYS.FR'
    },
    {
        name: 'SA',
        label: 'EVENTS.EVENTS.NEW.WEEKDAYS.SA'
    },
    {
        name: 'SU',
        label: 'EVENTS.EVENTS.NEW.WEEKDAYS.SU'
    }
];

// Workflow applied to upload assets that are not tracks
export const WORKFLOW_UPLOAD_ASSETS_NON_TRACK = 'publish-uploaded-assets';


// All fields for new series form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewSeries = {
    policies: [{
        role: 'ROLE_USER_ADMIN',
        read: true,
        write: true,
        actions: []
    }],
    theme: ''
};

// All fields for new theme form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewThemes = {
    name: '',
    description: '',
    bumperActive: false,
    bumperFile: {},
    trailerActive: false,
    trailerFile: {},
    titleSlideActive: false,
    titleSlideMode: 'extract',
    titleSlideBackground: {},
    licenseSlideActive: false,
    watermarkActive: false,
    watermarkFile: {},
    watermarkPosition: 'topRight'
};


// All fields for new acl form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewAcl = {
    name: '',
    acls: []
};

// All fields for new group form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewGroup = {
    name: '',
    description: '',
    roles: [],
    users: []
};

// All fields for new user form that are fix and not depending on response of backend
// InitialValues of Formik form (others computed dynamically depending on responses from backend)
export const initialFormValuesNewUser = {
    username: '',
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    roles: []
};