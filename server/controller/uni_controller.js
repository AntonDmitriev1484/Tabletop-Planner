import mongoose from 'mongoose';
let m = mongoose.models;

import {university_model, university_schema} from "../model/university_model.js"


const define_university = async (req, res) => {
    // let university_name = req.params.universityname;
    let university = university_model(req.body);
    let status  = 200;
    let response_message = "";

    try {
            await university.save();
            status = 200;
            response_message = "University has been successfully created";

        }
        catch (err){
            console.log(err);
            status = 400; //Figure out error codes later
            response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
        
    }

    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        res.status(status).json({message: response_message, success: true});
    }
    else {
        res.status(status).json({message: response_message, success: false});
    }
    return res;
}

const read_university_info = async (req,res) => {
    let university_name = req.params.universityname.replaceAll("_"," ");
    //the .replace undoes changes made on the frontend to the string so that it could
    //be sent through the url
    console.log(university_name);
    let status = 200;
    let body = {message:"", content:""};


    let model = university_model;

    const query = {"name":university_name};


    const found = (university) => {
        console.log('in found');
        body.content = university;

        console.log(body.content);
        status = 200; //idk man
        body.message = "Returning all information about this university";
    }

    const not_found = (err) => {
        console.log(err);
        status = 400; //Figure out error codes later
        body.message = "Error Name: "+err.name+".\n Error Message: "+err.message;
    }

    await fetch_from_db(model, query, found, not_found);

    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        body.success = true;
    }
    else {
       body.success = false;
    }

    res.status(status).json(body);
}


const create_course_for_university = async (req,res) => {
    let university_name = req.params.universityname.replaceAll("_"," ");
    let status = 200;
    let body = {message:""};


    let model = university_model;

    console.log(university_name);
    const query = {"name":university_name};


    const found = async (university) => {

        let course = m.course_model(req.body.course);
        university.courses.push(course);

        university.save();

        status = 200; //idk man
        body.message = "Course has successfully been added to this university";
    }

    const not_found = (err) => {
        console.log("Not found");
        
        body.message = "Not found";
    }

    await fetch_from_db(model, query, found, not_found);

    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        body.success = true;
    }
    else {
       body.success = false;
    }

    res.status(status).json(body);
}




//Again, the functionality of this method can just be replaced with middleware

const fetch_from_db = async (model, query, found, not_found) => {
    try {
        console.log(query);
         let data = await model.findOne(query);
         if (data !== null) {
            found(data);
            try {
               await data.save();
            }
            catch (err) {
                console.log(err);
            }
         }
         else {
             not_found("Not found");
         }

    }
    catch (err) {
        console.log(err);
        status = 400; //Figure out error codes later
        body.message = "Error Name: "+err.name+".\n Error Message: "+err.message;
        // not_found(err);
    }
}


export {define_university, read_university_info, create_course_for_university};