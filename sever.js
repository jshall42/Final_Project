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

        // insert the course into the database
        const insertCourseSql = `
            INSERT INTO tblCourse (CourseName, CourseNumber, CourseSection, CourseTerm, StartDate, EndDate, CourseCode)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        db.run(insertCourseSql, [
            strCourseName,
            strCourseNumber,
            strCourseSection,
            strCourseTerm,
            strStartDate,
            strEndDate,
            strCourseCode
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

app.listen(HTTP_PORT,() => {
    console.log('App listening on',HTTP_PORT)
})
