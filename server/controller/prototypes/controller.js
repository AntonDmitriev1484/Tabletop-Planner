function controller() {
    this.info = {
        status:200,
        message: "",
        success: true,
        reset() {
            this.status = 200;
            this.message = "";
            this.success = true;
        }
    }

    this.req = {};
    this.res = {};
    
    this.run = {};
}

export {controller};