import {usersTableConfig} from "../configs/tableConfigs/usersTableConfig";
import {LOAD_USERS_FAILURE, LOAD_USERS_IN_PROGRESS, LOAD_USERS_SUCCESS} from "../actions/userActions";

/**
 * This file contains redux reducer for actions affecting the state of users
 */

// Fill columns initially with columns defined in usersTableConfig
const initialColumns = usersTableConfig.columns.map(column =>
    ({
        name: column.name,
        deactivated: false
    }));

// Initial state of users in redux store
const initialState = {
    isLoading: false,
    results: [],
    columns: initialColumns,
    total: 0,
    count: 0,
    offset: 0,
    limit: 0
}

const users = (state=initialState, action) => {
    const { type, payload } = action;
    switch (type) {
        case LOAD_USERS_IN_PROGRESS: {
            return {
                ...state,
                isLoading: true
            }
        }
        case LOAD_USERS_SUCCESS: {
            const { users } = payload;
            return {
                ...state,
                isLoading: false,
                total: users.total,
                count: users.count,
                limit: users.limit,
                offset: users.offset,
                results: users.results
            }
        }
        case LOAD_USERS_FAILURE: {
            return {
                ...state,
                isLoading: false
            }
        }
        default:
            return state;
    }
}

export default users;
