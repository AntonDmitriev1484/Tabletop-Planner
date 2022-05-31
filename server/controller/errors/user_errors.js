
export default 
USER_ERR = {

    //Client request errors (400);
    INCORRECT_PASS: {
        code: 401,
        message: "Failed to authenticate, password is incorrect."
    },
    FAILED_SESSION_CHECK: {
        code: 402,
        message: "Failed to authenticate, session does not match, you can't manipulate this user's information."
    },
    FAILED_TO_FIND_USER: {
        code: 403,
        message: "Requested user by this _id doesn't exist."
    },
    FAILED_TO_FIND_UNRESOLVED_EVENT: {
        code: 404,
        message: "Requested unresolved event by this _id doesn't exist."
    },
    FAILED_TO_FIND_COURSE: {
        code: 405,
        message: "Requested current course by this _id doesn't exist."
    },

    //Internal server errors (500)
    USER_QUERY_FAILED: {
        code: 501,
        message: "Internal Server Error: Query for user by _id failed."
    },
    FAILED_TO_SAVE_USER: {
        code: 502,
        message: "Internal Server Error: Save operation on user mongoose model failed."
    },
    EVENT_ARCHIVE_QUERY_FAILED: {
        code: 503,
        message: "Internal Server Error: Query for event_archive by _id failed."
    },
    FAILED_TO_SAVE_EVENT_ARCHIVE: {
        code: 504,
        message: "Internal Sever Error: Save operation on event archive mongoose model failed."
    }
    


};