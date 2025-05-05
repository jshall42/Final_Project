const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')

const intSalt = 10
const dbSource = "server.db"
const HTTP_PORT = 8000
const db = new sqlite3.Database(dbSource)

var app = express()
app.use(cors())
app.use(express.json())


app.post('/peerreview/user', (req, res, next) => {
    try {
        // getting info from user
        let strEmail = req.body.email.trim().toLowerCase()
        let strPassword = req.body.password
        let strFirstName = req.body.firstName.trim()
        let strLastName = req.body.lastName.trim()
        let strContactType = req.body.contactType
        let strContactInfo = req.body.contactInfo
        let creationDateTime = new Date().toISOString()
        let lastLoginDateTime = null
        let strUserType = req.body.userType

        // double checking to see if user input is good
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(strEmail)) {
            return res.status(400).json({ 
                status: "error",
                message: "You must provide a valid email address" 
            })
        }

        if (strPassword.length < 8 ||
            !/[A-Z]/.test(strPassword) ||
            !/[a-z]/.test(strPassword) ||
            !/[0-9]/.test(strPassword)) {
            return res.status(400).json({ 
                status: "error",
                message: "Password must meet complexity requirements" 
            })
        }

        // check if user exist
        let checkUserSql = `SELECT Email FROM tblUsers WHERE Email = ?`
        
        db.get(checkUserSql, [strEmail], (err, row) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Database error checking existing user: " + err.message
                })
            }
            
            if (row) {
                return res.status(400).json({
                    status: "error",
                    message: "User with this email already exists"
                })
            }
            
            // bcrypt password
            const hashedPassword = bcrypt.hashSync(strPassword, intSalt)

            // insert the user
            let userInsert = `INSERT INTO tblUsers (Email, Password, FirstName, LastName, CreationDateTime, LastLoginDateTime, UserType) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`

            db.run(userInsert, [strEmail, hashedPassword, strFirstName, strLastName, creationDateTime, lastLoginDateTime, strUserType], function (err) {
                if (err) {
                    console.log("User insert error:", err)
                    return res.status(500).json({
                        status: "error",
                        message: "Failed to create user: " + err.message
                    })
                }
                
                // insert social contact info
                let socialInsert = `INSERT INTO tblSocials (SocialType, ContactInfo, UserEmail) VALUES (?, ?, ?)`
                db.run(socialInsert, [strContactType, strContactInfo, strEmail], function (err) {
                    if (err) {
                        console.log("Social insert error:", err)
                        return res.status(500).json({
                            status: "error",
                            message: "User created but failed to save social info: " + err.message
                        })
                    }

                    res.status(201).json({
                        status: "success",
                        message: "User and social info created successfully"
                    })
                })
            })
        })
    } catch (error) {
        console.error("Uncaught error in registration:", error)
        res.status(500).json({
            status: "error",
            message: "Server error during registration: " + error.message
        })
    }
})

app.post('/peerreview/login', (req, res, next) => {
    try {
        // getting the user info from the front
        let strEmail = req.body.email.trim().toLowerCase()
        let strPassword = req.body.password
        
        //selecting the user from the db to see if they exist
        let strSelect = `SELECT * FROM tblUsers WHERE Email = ?`
        db.get(strSelect, [strEmail], (err, row) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ status: "error", message: "Internal server error" })
            }
            // If they dont exist or password is wrong send invalid credentials
            if (!row) {
                return res.status(401).json({ status: "error", message: "Invalid credentials" })
            }

            const result = bcrypt.compareSync(strPassword, row.Password)
            if (!result) {
                return res.status(401).json({ status: "error", message: "Invalid credentials" })
            }
            // Update last login time
            const lastLoginDateTime = new Date().toISOString()
            const strUpdate = `UPDATE tblUsers SET LastLoginDateTime = ? WHERE Email = ?`

            db.run(strUpdate, [lastLoginDateTime, strEmail], function (err) {
                if (err) {
                    console.error(err)
                    return res.status(500).json({ status: "error", message: "Error updating login time" })
                }

                res.status(200).json({
                    status: "success",
                    message: "Login successful",
                    userType: row.UserType,
                    firstName: row.FirstName,
                    email: row.Email
                })
            })
        })
    } catch (error) {
        console.error("Uncaught error in login:", error)
        res.status(500).json({
            status: "error",
            message: "Server error during login: " + error.message
        })
    }
})

app.post('/peerreview/course', (req, res, next) => {
    try {
        // getting the course info from the front end
        let strCourseName = req.body.name
        let strCourseNumber = req.body.number
        let strCourseSection = req.body.section
        let strCourseTerm = req.body.term
        let strStartDate = req.body.start
        let strEndDate = req.body.end
        let strCourseCode = req.body.code
        let strInstructorEmail = req.body.email

        // check the user input
        if (!strCourseName || !strCourseNumber || !strCourseSection || !strCourseTerm ||
            !strStartDate || !strEndDate || !strCourseCode) {
            return res.status(400).json({
                status: "error",
                message: "All course fields are required"
            })
        }

        strCourseName = strCourseName.trim()
        strCourseNumber = strCourseNumber.trim()
        strCourseSection = strCourseSection.trim()
        strCourseTerm = strCourseTerm.trim()
        strStartDate = strStartDate.trim()
        strEndDate = strEndDate.trim()
        strCourseCode = strCourseCode.trim()
        strInstructorEmail = strInstructorEmail.trim()

        // insert the course into the database
        const insertCourseSql = `
            INSERT INTO tblCourse (CourseName, CourseNumber, CourseSection, CourseTerm, StartDate, EndDate, CourseCode, UserEmail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
        db.run(insertCourseSql, [
            strCourseName,
            strCourseNumber,
            strCourseSection,
            strCourseTerm,
            strStartDate,
            strEndDate,
            strCourseCode,
            strInstructorEmail
        ], function (err) {
            if (err) {
                console.error("Insert course error:", err)
                return res.status(500).json({
                    status: "error",
                    message: "Failed to add course: " + err.message
                })
            }

            res.status(201).json({
                status: "success",
                message: "Course created successfully",
                courseId: this.lastID
            })
        })
    } catch (error) {
        console.error("Uncaught error in /peerreview/course:", error)
        res.status(500).json({
            status: "error",
            message: "Server error while creating course: " + error.message
        })
    }
})

app.get('/peerreview/courses', (req, res, next) => {
    // getting the user email from the front end
    const userEmail = req.query.userEmail.trim().toLowerCase()

    // check if the user email is provided
    if (!userEmail) {
        return res.status(400).json({
            status: "error",
            message: "User email is required"
        })
    }

    // SQL query to get courses for the user
    // This query fetches courses where the user is either an instructor or a student
    const getCoursesSql = `
        SELECT 
            c.CourseName,
            c.CourseNumber, 
            c.CourseCode, 
            c.CourseSection, 
            c.CourseTerm, 
            u.FirstName || ' ' || u.LastName AS InstructorName
        FROM tblCourse c
        JOIN tblUsers u ON c.UserEmail = u.Email
        WHERE c.UserEmail = ? OR c.CourseCode IN (
            SELECT CourseID FROM tblEnrollments WHERE UserID = ?
        )
    `

    db.all(getCoursesSql, [userEmail, userEmail], (err, rows) => {
        if (err) {
            console.error("Error fetching courses:", err)
            return res.status(500).json({
                status: "error",
                message: "Failed to fetch courses"
            })
        }

        res.status(200).json({
            status: "success",
            courses: rows
        })
    })
})

app.post('/peerreview/enroll', (req, res, next) => {
    try {
        // getting the user email and course code from the front end
        const userEmail = req.body.email.trim().toLowerCase()
        const courseCode = req.body.code.trim()

        // check if the user email and course code are provided
        if (!userEmail || !courseCode) {
            return res.status(400).json({
                status: "error",
                message: "User email and course code are required"
            })
        }

        // SQL query to enroll the user in the course
        const enrollSql = `
            INSERT INTO tblEnrollments (UserID, CourseID)
            VALUES (?, ?)
        `

        db.run(enrollSql, [userEmail, courseCode], function (err) {
            if (err) {
                console.error("Error enrolling in course:", err)
                return res.status(500).json({
                    status: "error",
                    message: "Failed to enroll in course"
                })
            }

            res.status(201).json({
                status: "success",
                message: "Successfully enrolled in course"
            })
        })
    } catch (error) {
        console.error("Uncaught error in /peerreview/enroll:", error)
        res.status(500).json({
            status: "error",
            message: "Server error while enrolling in course: " + error.message
        })
    }
})


app.post('/peerreview/course-group', (req, res) => {
    const { groupName, courseNumber } = req.body;
  
    if (!groupName || !courseNumber) {
      return res.status(400).json({ status: 'error', message: 'Group name and course number are required.' });
    }
  
    const sql = `INSERT INTO tblCourseGroups (GroupName, CourseNumber) VALUES (?, ?)`;
  
    db.run(sql, [groupName.trim(), courseNumber], function (err) {
      if (err) {
        console.error('Error inserting group:', err.message);
        return res.status(500).json({ status: 'error', message: 'Failed to create group.' });
      }
  
      res.status(201).json({ status: 'success', message: 'Group created.', groupName });
    });
});

app.get('/peerreview/course-groups', (req, res) => {
    const sql = `SELECT * FROM tblCourseGroups`;
  
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Select error:', err.message);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to retrieve groups'
        });
      }
  
      res.status(200).json({
        status: 'success',
        groups: rows
      });
    });
});
  
app.get('/peerreview/users', (req, res) => {
    const sql = `SELECT FirstName, LastName, Email, CreationDateTime, LastLoginDateTime, UserType FROM tblUsers`;
  
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err.message);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch users.' });
      }
  
      res.status(200).json({ status: 'success', users: rows });
    });
});

app.get('/peerreview/users/:email', (req, res) => {
    const email = req.params.email;
  
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email parameter is required.' });
    }
  
    const sql = `SELECT FirstName, LastName, Email, CreationDateTime, LastLoginDateTime, UserType FROM tblUsers WHERE Email = ?`;
  
    db.get(sql, [email], (err, row) => {
      if (err) {
        console.error('Error fetching user:', err.message);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch user.' });
      }
  
      if (!row) {
        return res.status(404).json({ status: 'error', message: 'User not found.' });
      }
  
      res.status(200).json({ status: 'success', user: row });
    });
});
  
app.post('/peerreview/group-member', (req, res) => {
    const { groupName, studentEmail } = req.body;
  
    if (!groupName || !studentEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Group name and student email are required.'
      });
    }
  
    const insertSql = `
      INSERT INTO tblGroupMembers (GroupName, StudentEmail)
      VALUES (?, ?)
    `;
  
    db.run(insertSql, [groupName, studentEmail], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({
            status: 'error',
            message: 'This student is already in the group.'
          });
        }
  
        console.error('Error assigning student to group:', err.message);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to assign student: ' + err.message
        });
      }
  
      return res.status(201).json({
        status: 'success',
        message: 'Student added to group successfully',
        rowId: this.lastID
      });
    });
});
// -------------------------------------------------------------------------------

// Post and Get for tblAssessments
app.post('/peerreview/assessments', (req, res) => 
{

    let strCourseID = req.body.CourseID
    let strStartDate = req.body.StartDate
    let strEndDate = req.body.EndDate
    let strName = req.body.Name
    let strStatus = req.body.Status
    let strType = req.body.Type

    let arrParameters = [strCourseID, strStartDate, strEndDate, strName, strStatus, strType]

    const Insert = `INSERT INTO tblAssessments (CourseID, StartDate, EndDate, Name, Status, Type) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(Insert, arrParameters, function (err) {
        if (err) {
            console.error("Insert assessment error:", err);
            return res.status(500).json({ status: 'error', message: 'Failed' });
        }

        res.status(201).json({ status: 'success', message: 'Assessment created'});
    })
})

// Gets all assessments for a course
app.get('/peerreview/assessments/:CourseID', (req, res) => 
{
    let strCourseID = req.params.CourseID;

    let Select = `SELECT * FROM tblAssessments WHERE CourseID = ?`

    db.all(Select,[strCourseID],function(err,result){
        if(err)
        {
            console.log(err)
            res.status(500).json
            ({
                status:"error",
                message:err.message
            })
        }
        else
        {
            res.status(200).json
            ({
                status:"success",
                items:result
            })
        }
    })
})

//Post and Get for tblAssessmentQuestions

app.post('/peerreview/questions', (req, res) => 
{

    let intAssessmentID = req.body.AssessmentID
    let strQuestionType = req.body.QuestionType
    let strOptions = req.body.Options
    let strQuestionNarrative = req.body.QuestionNarrative
    let strHelperText = req.body.HelperText

    let arrParameters = [intAssessmentID, strQuestionType, strOptions, strQuestionNarrative, strHelperText]

    const Insert = `INSERT INTO tblAssessmentQuestions (AssessmentID, QuestionType, Options, QuestionNarrative, HelperText) VALUES (?, ?, ?, ?, ?)`;

    db.run(Insert, arrParameters, function (err) {
        if (err) {
            console.error("Insert assessment error:", err);
            return res.status(500).json({ status: 'error', message: 'Failed' });
        }

        res.status(201).json({ status: 'success', message: 'Assessment created'});
    })
})

// gets all questions for an assessment
app.get('/peerreview/questions/:AssessmentID', (req, res) => 
{
    let intAssessmentID = req.params.AssessmentID;

    let Select = `SELECT * FROM tblAssessmentQuestions WHERE AssessmentID = ?`

    db.all(Select,[intAssessmentID],function(err,result){
        if(err)
        {
            console.log(err)
            res.status(500).json
            ({
                status:"error",
                message:err.message
            })
        }
        else
        {
            res.status(200).json
            ({
                status:"success",
                items:result
            })
        }
    })
})

//Post and Get for tblAssessmentResponses

app.post('/peerreview/responses', (req, res) => 
{

    let intAssessmentID = req.body.AssessmentID
    let strUserEmail = req.body.UserEmail
    let strTargetEmail = req.body.TargetEmail
    let intQuestionID = req.body.QuestionID
    let strResponse = req.body.Response
    let strPublic = req.body.Public

    let arrParameters = [intAssessmentID, strUserEmail, strTargetEmail, intQuestionID, strResponse, strPublic]

    const Insert = `INSERT INTO tblAssessmentResponses (AssessmentID, UserEmail, TargetEmail, QuestionID, Response, Public) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(Insert, arrParameters, function (err) {
        if (err) {
            console.error("Insert assessment error:", err);
            return res.status(500).json({ status: 'error', message: 'Failed' });
        }

        res.status(201).json({ status: 'success', message: 'Assessment created'});
    })
})

//gets all responses from an assessment towards the target student
app.get('/peerreview/responses/:AssessmentID/:TargetEmail', (req, res) => 
{
    let intAssessmentID = req.params.AssessmentID
    let intTargetEmail = req.params.TargetEmail

    let Select = `SELECT * FROM tblAssessmentResponses WHERE AssessmentID = ? AND TargetEmail = ?`

    db.all(Select,[intAssessmentID, intTargetEmail],function(err,result){
        if(err)
        {
            console.log(err)
            res.status(500).json
            ({
                status:"error",
                message:err.message
            })
        }
        else
        {
            res.status(200).json
            ({
                status:"success",
                items:result
            })
        }
    })
})

//gets all the student's courses

app.get('/peerreview/studentassessments/:UserID', (req, res) => {
    let strUserID = req.params.UserID;

    const Select = `
        SELECT a.* 
        FROM tblAssessments a
        JOIN tblEnrollments e ON a.CourseID = e.CourseID
        WHERE e.UserID = ?
    `;

    db.all(Select, [strUserID], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).json({ status: "error", message: err.message });
        } else {
            res.status(200).json({ status: "success", items: result });
        }
    });
});

app.get('/peerreview/course-groups', (req, res) => {
    const sql = `SELECT GroupName, CourseNumber FROM tblCourseGroups`;
  
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error fetching course groups:', err.message);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to retrieve course groups'
        });
      }
  
      res.status(200).json({
        status: 'success',
        groups: rows
      });
    });
  });
  
  
app.listen(HTTP_PORT,() => {
    console.log('App listening on',HTTP_PORT)
})
