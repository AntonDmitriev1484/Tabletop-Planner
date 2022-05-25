
const controller_prototype = {
    info: { //info holds information which we want to info whenever we run res.json.
        status:200,
        message: "",
        success: true,
        reset() {
            this.status = 200;
            this.message = "";
            this.success = true;
        }
    },

    req: {},
    res: {},

    //To handle the first possible thrown error by this controller
    error_status: 400,
    error_message: "",

    run: {},

    handle_error (err) {
        console.log(err);
        error_response()
    },

    error_response () {
        this.info.status = this.error_status;
        this.info.response_message += this.error_message;

        this.res.status(this.info.status);
        this.res.json(this.info);
    }

}

export default controller_prototype;