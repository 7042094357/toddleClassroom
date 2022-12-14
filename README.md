# Requirement: 

The main idea is to create a classroom where the participants would be teachers and students. They will have different access to the classroom and those access will help them to manage their work
It will also help teachers among themself to look and learn from each other's assignments and posts.
A teacher's life would be easy if they could just keep track of all the class works and students at one place and keeping the idea of toddle in mind this micro service has been built with features mentioned below.


# Features:

Admin features : 
Login
Logout
Add users (admin, teachers and students)

Teacher features :
Login
Logout
Create Class
Add subject to class
Add Assignment
Submit Solution
Comment under subject page
Post assignments for a subject
Look at number of submissions for an assignment
Look at particular students assignments
 Find number of students in a class
 Look at all the comments made by them or under a particular subject.
 Active users




Students features:
Login
Logout
Join particular class using classCode
Submit Solution
Comment under subject page
Look at number of submissions 
Look at assignments and submit solutions for them
 Look at all the comments made by them or under a particular subject.


# Postman Documentation:

Documentation includes all the requests and their examples. Please find below the url for the documentation : 
[Postman collection](https://documenter.getpostman.com/view/14107473/2s83tGnWrr)

# Technologies used:
- JWT tokens
- Google APIs
- Nodejs
- MySql
- Cron Job
- Express
- AES Encryption
- stream

# Feature Explanation:

* Create User : This feature can only be used by the admin to add teachers and students to the classroom.

    Required parameter : username, email, password, role, contact

* Login : This feature allows users to login using username and password which is generated by the admin when the user is first added to the classroom. 
    JWT token would be assigned to the user once they login and have expiration time which is configurable through env.

    Required parameter : usernameOrEmail, password

* Logout : This feature allows users to logout from the classroom.

    Required parameter : bearer token


* Create class : This feature allows teachers to create classes which could then be used to add subjects and students to the class.

    Required parameter : class , bearer token

* Create subject : This feature allows the teacher to create a subject under a class.

    Required parameter : classCode , subject, bearer token

* Join class : This feature allows the student to join the class using the classCode.

    Required parameter : classCode, bearer token

* Post Assignment : This feature allows teachers to add assignments for their subjects. The assignments are being uploaded to google drive.

    Required parameter : postAssignment, subjectCode, bearer token

* Submit Assignment : This feature allows teachers and students to post assignment solutions for their subjects. The submissions are being uploaded to google drive.

    Required parameter : postAssignment, assignmentCode, bearer token

* Add Comment : This feature allows teachers and students to post comments under the subjects.

    Required parameter : subjectCode, classCode, comment, bearer token

* Get Assignments : This feature allows teachers and students to get assignments under the subjects.

    Required parameter : bearer token
    Optional parameter : subjectCode, classCode, assignmentCode, user

* Get Submissions : This feature allows teachers and students to get submissions under the subjects.

    Required parameter : bearer token
    Optional parameter : subjectCode, classCode, assignmentCode, user

* Get class strength : This feature allows teachers to get class strength and student details under the subjects.

    Required parameter : bearer token
    Optional parameter : classCode

* Get Comments : This feature allows teachers and students to get comments under the subjects.

    Required parameter : bearer token
    Optional parameter : subjectCode

* Get active users : This feature allows teachers to get active students.

    Required parameter : bearer token

# Future Possibilities : 


- Using redis to get the active users.
- Shared room for teachers to comment and share assignments
