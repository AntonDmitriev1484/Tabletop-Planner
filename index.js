import user_model from "./model/user_model.js";
import {homework_model, homework_schema} from "./model/homework_model.js";


//Need to connect mongodb before running any code which interacts with the database
//You can create your model objects beforehand, but mongodb must actually be connected for things like .save to work

//We need the mongoose setup, not the mongodb setup
import mongodb from "mongodb"
const MongoClient = mongodb.MongoClient;

import mongoose from 'mongoose';
import {course_model, course_schema} from "./model/course_model.js";
import { university_model } from './model/university_model.js';
import { pcourse_model, pcourse_schema } from "./model/pcourse_model.js";


// const mongo_cli = new MongoClient("mongodb://localhost:27017/creative_project_db");
// //Gives us a client through which we can now interact with mongodb

// try {
//     mongo_cli.connect();
// }
// catch (err){
//     console.error(err);
// }


mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/creative_project_db");
mongoose.connection.on('error', () => {
    throw new Error ('unable to connect to creative_project_db');
})

new_setup();
async function new_setup() {
  //Note. MongoDB automatically creates collections when a new model is instantiated
  //Still need to add the archive database things, figure out methods for dealing with that.

  let university = new university_model();
  university.name = "Washington University in St. Louis";


  let course1 = new course_model();
  course1.name = "Rapid Prototype Development";
  course1.dept_name = "Computer Science";
  course1.dept_code = "CSE";
  course1.course_code = "330S";
  course1.official_description = "Make fun projects";

  let course2 = new course_model();
  course2.name = "Quantum Computing";
  course2.dept_name = "Computer Science";
  course2.dept_code = "CSE";
  course2.course_code = "468T";
  course2.official_description = "Quantum buttchugging";

  
  university.courses.push(course1);
  university.courses.push(course2);

  
  await university.save();

  let personal_course = new pcourse_model();
  personal_course.course = course1; //Now 330 has been expanded as a personal course
  personal_course.tags = ['Wee', 'Woo'];
  personal_course.description = ['Wow this fucks, this is poggers as shit brother!!!'];
  personal_course.note = 'Cumfart prereq';
  personal_course.semester_taken = 7;

  let personal_course2 = new pcourse_model();
  personal_course2.course = course2; //Now 330 has been expanded as a personal course
  personal_course2.tags = ['Wee', 'Woo'];
  personal_course2.description = ['Wowdfasdfadbrother!!!'];
  personal_course2.note = 'Shitty prereq';
  personal_course2.semester_taken = 7;

  let homework = new homework_model();
  homework.progress = 50;
  homework.official_description = "asdfaefascvxcl";
  homework.note = "aefdf";
  homework.course = personal_course;

  let user = new user_model();



  user.username="timestamp man";
  user.full_name = "Anton Dmitriev";
  user.email = "a.dmitriev@wustl.edu";
  // user.firstName = "Anton";
  // user.lastName = "Dmitriev";
  user.password =  "password";
  user.semester = 4;

  user.university = university;
  user.events_unresolved = [homework];
  //user.events_archived = [];
  user.courses_current.push(personal_course);
  //user.courses_archived = []

  await user.save();
}


//storage_test();
async function storage_test() {
  let user = new user_model();

  user.username="timestamp man";
  user.full_name = "Anton Dmitriev";
  user.email = "a.dmitriev@wustl.edu";
  // user.firstName = "Anton";
  // user.lastName = "Dmitriev";
  user.password =  "password";
  user.semester = 4;

  let homework = new homework_model();
  homework.progress = 80;
  homework.description = "lllll";
  homework.note = "lllll";

  let course1 = new course_model();
  course1.name = "Rapid Prototype Development";
  course1.dept_name = "Computer Science";
  course1.dept_code = "CSE";
  course1.course_code = "330S";
  course1.description = "Make fun projects";

  await course1.save();

  console.log('saved course');

  homework.course = course1._id;

  await homework.save();

  console.log('saved homework');


  user.events_unresolved.push(homework);
  //user.markModified('events_unresolved');

  await user.save(); //Save creates a new entry, or updates an already existing one. Not sure under what conditions it updates an existing one

  console.log('saved user');





  // console.log(JSON.stringify(user));

  

  //markModified might be necessary if you're ever making changes to an array that's embedded within an object
  // user.markModified('firstName');
  
  // user.markModified('lastName');
  
  // user.markModified('biography');


}


// f_test();
// async function f_test() {

//   //can use the model object to create a query
//   //then call .exect() to execute that query
//   const result = await user_model.find({first_name:"Anton"}).exec();

//   const anton = result[0]; //Result returned an array of options which matched the query
//   console.log(anton);
//   console.log("Full name " +anton.full_name); //Just accessing the virtual field as though it actually exists
//   console.log("Password attempt 1 "+anton.check_pass("password"));
//   console.log("Password attempt 2 "+anton.check_pass("weaboo"));
// }

