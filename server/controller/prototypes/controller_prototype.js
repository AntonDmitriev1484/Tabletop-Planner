
const controller_prototype = {
    send: { //Send bundles relevant information to pass to functions outside this prototype
        status:200,
        response_message: "",
        success: true,
        reset() {
            this.status = 200;
            this.response_message = "";
            this.success = true;
        }
    },

    req: {},
    res: {},

    error_status: 400,
    error_message: "",

    controller_function: {},
    //(req, res) => {},

    handle_error (err) {
        console.log(err);
        error_response()
    },

    error_response () {
        this.send.status = this.error_status;
        this.send.response_message += this.error_message;
        this.res.status(this.send.status);
        this.res.json(this.send);
    }

}

export default controller_prototype;