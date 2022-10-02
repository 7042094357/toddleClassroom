const { google } = require('googleapis');
const stream = require('stream');
const db = require('./dbConnection');
const jwt = require("jsonwebtoken");

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';
const driveAssignmentsFolderID = process.env.GOOGLE_DRIVE_ASSIGNMENT_FOLDER;
const driveSubmissionFolderID = process.env.GOOGLE_DRIVE_SUBMISSION_FOLDER;

const uploadToGoogle = async(file, fileType, fileName, driveFolderID)=>{
    try{
        const client = new google.auth.OAuth2(driveClientId, driveClientSecret, driveRedirectUri);

        client.setCredentials({ refresh_token: driveRefreshToken });

        let authorizedClient = google.drive({
            version: 'v3',
            auth: client,
        });

        const { data } = await authorizedClient.files.create({
            media: {
            mimeType: fileType,
            body: file,
            },
            requestBody: {
            name: fileName,
            parents: [driveFolderID],
            },
            fields: 'id,name',
        });
        if(data.name && data.id){
            let result = {
                name : data.name,
                id : data.id,
                client : authorizedClient
            }
            return result
        }
        else{
            return {
                errorMessage:"Some Error Occured"
            }
        }
    }
    catch(err){
        console.log("error",err)
    }
}

const getDriveUrl = async(client, id)=>{
    try{
        await client.permissions.create({
            fileId: id,
            requestBody: {
            role: 'reader',
            type: 'anyone',
            },
        });

        const result = await client.files.get({
            fileId: id,
            fields: 'webViewLink, webContentLink',
        });
        if(result.data)
            return result.data;
        else
            return {
                errorMessage:"Some Error Occured"
            }
    }
    catch(err){
        console.log("error",err)
    }
}

const postAssignment = async (req,res,next)=>{
    try{
        // console.log("Assignment file======>",req.files,req.body.subjectCode)
        let apiStatusCode = 200;
        let response = {}
        let token = req?.headers?.authorization;
        token = token?token.split(" ")[1]:'';

        if(token){
            jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
                if (err) {
                    apiStatusCode=401
                    response.message = "Session expired. Please login again"
                    console.log("Session expired. Please login again");
                    res.status(apiStatusCode).send(response);
                } else {
                let userDetails = authData.user;
                let subjectCode = req.body.subjectCode;
                console.log("userDetails===>",userDetails)
                if((userDetails.role).toLowerCase() === 'teacher'){
                    let subjectTeacherQuery = `select * from subject where user=${userDetails.userId} and subjectCode=${subjectCode}`;
                    db.query(subjectTeacherQuery,async (err,result,fields)=>{
                        if(err) throw err;
                        if(result && result.length){
                            let fileObject = req.files[0];
                            const bufferStream = new stream.PassThrough();
                            bufferStream.end(fileObject.buffer);
                            const uploadedDocument = await uploadToGoogle(bufferStream, fileObject.mimeType, fileObject.fieldname, driveAssignmentsFolderID);
                            if(uploadedDocument.name && uploadedDocument.id){
                                const driveUrl = await getDriveUrl(uploadedDocument.client, uploadedDocument.id)
                                if(driveUrl.webViewLink){
                                    let postAssignmentQuery = `insert into assignments(subjectCode, assignment, user) values(${subjectCode},"${driveUrl.webViewLink}", ${userDetails.userId})`;
                                    db.query(postAssignmentQuery,function(err,result){
                                        if(err) throw err;
                                        response.message = `Assignment file ${uploadedDocument.name} posted. Please find below the urls to view or download file`
                                        response.urls=driveUrl
                                        console.log(`Assignment file ${uploadedDocument.name} posted. Please find below the urls to view or download file`);
                                        res.status(apiStatusCode).send(response);
                                    });
                                    // res.status(apiStatusCode).send(response);
                                }
                                else{
                                    response.message = `Couldn't generate url. But the assignment is posted`
                                    res.status(apiStatusCode).send(response);
                                }
                            }
                            else{
                                response.message = `Couldn't upload file`
                                console.log(`Couldn't upload file`);
                                res.status(apiStatusCode).send(response);
                            }
                        }
                        else{
                            response.message = `You can only post assignment for your subject`
                            console.log(`You can only post assignment for your subject`);
                            res.status(apiStatusCode).send(response);
                        }
                    })
                }
                else{
                    apiStatusCode=401
                    response.message = "Sorry you don't have the permission to post assignment"
                    console.log("Sorry you don't have the permission to post assignment");
                    res.status(apiStatusCode).send(response);
                }
                }
            });
        }
        else{
            response.message = "Bearer token is missing"
            console.log("Bearer token is missing");
            res.status(apiStatusCode).send(response);
        }
        
    }
    catch(err){
        console.log("error",err)
    }

};

const submitAssignment = async (req,res,next)=>{
    try{
        console.log("Submission file======>",req.files[0])
        let apiStatusCode = 200;
        let response = {}
        let token = req?.headers?.authorization;
        token = token?token.split(" ")[1]:'';

        if(token){
            jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
                if (err) {
                    apiStatusCode=401
                    response.message = "Session expired. Please login again"
                    console.log("Session expired. Please login again");
                    res.status(apiStatusCode).send(response);
                } else {
                let userDetails = authData.user;
                let assignmentCode = req.body.assignmentCode;
                console.log("userDetails===>",userDetails)
                if((userDetails.role).toLowerCase() !== 'admin'){
                    let fileObject = req.files[0];
                    const bufferStream = new stream.PassThrough();
                    bufferStream.end(fileObject.buffer);
                    const uploadedDocument = await uploadToGoogle(bufferStream, fileObject.mimeType, fileObject.fieldname, driveSubmissionFolderID);
                    if(uploadedDocument.name && uploadedDocument.id){
                        const driveUrl = await getDriveUrl(uploadedDocument.client, uploadedDocument.id)
                        if(driveUrl.webViewLink){
                            let submitAssignmentQuery = `insert into submissions(submission, assignmentCode, user) values("${driveUrl.webViewLink}",${assignmentCode}, ${userDetails.userId})`;
                            db.query(submitAssignmentQuery,function(err,result){
                                if(err) throw err;
                                response.message = `Submission file ${uploadedDocument.name} posted. Please find below the urls to view or download file`
                                response.urls=driveUrl
                                console.log(`Submission file ${uploadedDocument.name} posted. Please find below the urls to view or download file`);
                                res.status(apiStatusCode).send(response);
                            });
                        }
                        else{
                            response.message = `Couldn't generate url. But the submission is posted`
                            res.status(apiStatusCode).send(response);
                        }
                    }
                    else{
                        response.message = `Couldn't upload file`
                        console.log(`Couldn't upload file`);
                        res.status(apiStatusCode).send(response);
                    }
                }
                else{
                    apiStatusCode=401
                    response.message = "Sorry you don't have the permission to post assignment"
                    console.log("Sorry you don't have the permission to post assignment");
                    res.status(apiStatusCode).send(response);
                }
                }
            });
        }
        else{
            response.message = "Bearer token is missing"
            console.log("Bearer token is missing");
            res.status(apiStatusCode).send(response);
        }
    }
    catch(err){
        console.log("error",err)
    }
};

const getSubmissions = async(req, res, next)=>{
    try{
        let apiStatusCode = 200;
        let response = {}
        let token = req?.headers?.authorization;
        token = token?token.split(" ")[1]:'';

        if(token){
            jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
                if (err) {
                    apiStatusCode=401
                    response.message = "Session expired. Please login again"
                    console.log("Session expired. Please login again");
                    res.status(apiStatusCode).send(response);
                } else {
                let userDetails = authData.user;
                let assignmentCode = req.query?.assignmentCode;
                let subjectCode = req.query?.subjectCode;
                let classCode = req.query?.classCode;
                let user = req.query?.user;
                if((userDetails.role).toLowerCase() !== 'admin'){
                    let getAssignmentSubmittedQuery = `select a.assignment, sub.submission, s.subject, u.name, c.class from submissions sub inner join assignments a on sub.assignmentCode=a.assignmentCode inner join subject s on a.subjectCode=s.subjectCode inner join classes c on s.classCode=c.classCode inner join users u on c.user=u.id `;
                    if(assignmentCode)
                        getAssignmentSubmittedQuery = getAssignmentSubmittedQuery + `where a.assignmentCode=${assignmentCode}`;    
                    else if(subjectCode)
                        getAssignmentSubmittedQuery = getAssignmentSubmittedQuery + `where s.subjectCode=${subjectCode}`;
                    else if(classCode)
                        getAssignmentSubmittedQuery = getAssignmentSubmittedQuery + `where c.classCode=${classCode}`;
                    else if(user)
                        getAssignmentSubmittedQuery = getAssignmentSubmittedQuery + `where u.id=${user}`;
                    else
                        getAssignmentSubmittedQuery = getAssignmentSubmittedQuery + `where u.id=${userDetails.userId}`;
                    
                    console.log("assignment==>",getAssignmentSubmittedQuery);
                    db.query(getAssignmentSubmittedQuery,async (err,result,fields)=>{
                        if(err) throw err;
                        if(result && result.length){
                            response.submissions = result;
                            response.message = `All submissions for the above query`
                            console.log(`All submissions for the above query`);
                            res.status(apiStatusCode).send(response);
                        }
                        else{
                            response.message = `No submissions found for above query`
                            console.log(`No submissions found for above query`);
                            res.status(apiStatusCode).send(response);
                        }
                    })
                }
                else{
                    apiStatusCode=401
                    response.message = "Sorry you don't have the permission to view submissions"
                    console.log("Sorry you don't have the permission to view submissions");
                    res.status(apiStatusCode).send(response);
                }
                }
            });
        }
        else{
            response.message = "Bearer token is missing"
            console.log("Bearer token is missing");
            res.status(apiStatusCode).send(response);
        }
    }
    catch(err){
        console.log("error",err);
    }
}

const getAssignments = async(req, res, next)=>{
    try{
        let apiStatusCode = 200;
        let response = {}
        let token = req?.headers?.authorization;
        token = token?token.split(" ")[1]:'';

        if(token){
            jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
                if (err) {
                    apiStatusCode=401
                    response.message = "Session expired. Please login again"
                    console.log("Session expired. Please login again");
                    res.status(apiStatusCode).send(response);
                } else {
                let userDetails = authData.user;
                let assignmentCode = req.query?.assignmentCode;
                let subjectCode = req.query?.subjectCode;
                let classCode = req.query?.classCode;
                let user = req.query?.user;
                if((userDetails.role).toLowerCase() !== 'admin'){
                    let getAssignmentQuery = `select a.assignment, s.subject, u.name, c.class from assignments a inner join subject s on a.subjectCode = s.subjectCode inner join classes c on s.classCode=c.classCode inner join users u on c.user=u.id `;
                    if(assignmentCode)
                        getAssignmentQuery = getAssignmentQuery + `where a.assignmentCode=${assignmentCode}`;    
                    else if(subjectCode)
                        getAssignmentQuery = getAssignmentQuery + `where s.subjectCode=${subjectCode}`;
                    else if(classCode)
                        getAssignmentQuery = getAssignmentQuery + `where c.classCode=${classCode}`;
                    else if(user)
                        getAssignmentQuery = getAssignmentQuery + `where u.id=${user}`;
                    else
                        getAssignmentQuery = getAssignmentQuery + `where u.id=${userDetails.userId}`;
                    
                    console.log("assignment==>",getAssignmentQuery);
                    db.query(getAssignmentQuery,async (err,result,fields)=>{
                        if(err) throw err;
                        if(result && result.length){
                            response.assignments = result;
                            response.message = `All assignment for the above query`
                            console.log(`All assignment for the above query`);
                            res.status(apiStatusCode).send(response);
                        }
                        else{
                            response.message = `No assignment found for above query`
                            console.log(`No assignment found for above query`);
                            res.status(apiStatusCode).send(response);
                        }
                    })
                }
                else{
                    apiStatusCode=401
                    response.message = "Sorry you don't have the permission to view assignments"
                    console.log("Sorry you don't have the permission to view assignments");
                    res.status(apiStatusCode).send(response);
                }
                }
            });
        }
        else{
            response.message = "Bearer token is missing"
            console.log("Bearer token is missing");
            res.status(apiStatusCode).send(response);
        }
    }
    catch(err){
        console.log("error",err);
    }
}


module.exports = {
    postAssignment,
    submitAssignment,
    getSubmissions,
    getAssignments
}