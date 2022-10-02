const express = require("express");
const {encryptPassword} = require('./encryption');
const db = require('./dbConnection');
const router = express.Router();
const moment = require('moment');
const jwt = require("jsonwebtoken");
let multer  = require('multer');
let storage = multer.memoryStorage();
let upload = multer({ storage: storage });


const {createUser} = require('./createUser');
const {postAssignment, submitAssignment, getSubmissions, getAssignments} = require('./assignments');
const {login, logout, activeUsers} = require('./login_logout');
const {createClass, joinClass, classStrength} = require('./classes')
const {addSubject} = require('./subjects')
const {addComments, getComments} = require('./comments')



router.post('/createUser', createUser);

router.post('/login', login);

router.post('/logout', logout);

router.post('/createClass', createClass);

router.post('/joinClass', joinClass);

router.post('/addSubject', addSubject);

router.post('/addComments', addComments);

router.get('/getSubmissions', getSubmissions);

router.get('/getAssignments', getAssignments);

router.get('/classStrength', classStrength);

router.get('/getComments', getComments);

router.get('/activeUsers', activeUsers);

router.post(
  '/postAssignment', 
  upload.any(),
  postAssignment,
)

router.post(
  '/submitAssignment', 
  upload.any(),
  submitAssignment,
)


module.exports = router;