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


app.post('/user', (req, res, next) => {
    // Getting all the info from the front
    let strEmail = req.body.email.trim().toLowerCase()
    let strPassword = req.body.password
    let strFirstName = req.body.firstName.trim()
    let strLastName = req.body.lastName.trim()
    let strContactType = req.body.contactType
    let strContactInfo = req.body.contactInfo
    let creationDateTime = new Date().toISOString()
    let lastLoginDateTime = null

    // Checking to see if the info is good
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(strEmail)) {
        return res.status(400).json({ error: "You must provide a valid email address" })
    }

    if (strPassword.length < 8 ||
        !/[A-Z]/.test(strPassword) ||
        !/[a-z]/.test(strPassword) ||
        !/[0-9]/.test(strPassword) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(strPassword)) {
        return res.status(400).json({ error: "Password must meet complexity requirements" })
    }
    // Password bcrypt
    strPassword = bcrypt.hashSync(strPassword, intSalt)

    // Inserting the new user
    let userInsert = `INSERT INTO tblUsers (Email, Password, FirstName, LastName, CreationDateTime, LastLoginDateTime) 
                      VALUES (?, ?, ?, ?, ?, ?)`

    db.run(userInsert, [strEmail, strPassword, strFirstName, strLastName, creationDateTime, lastLoginDateTime], function (err) {
        if (err) {
            console.log(err)
            return res.status(400).json({
                status: "error",
                message: "Failed to create user: " + err.message
            })
        }
        
        // Inserting there socials
        let socialInsert = `INSERT INTO tblSocials (SocialType, ContactInfo, UserEmail) VALUES (?, ?, ?)`
        db.run(socialInsert, [strContactType, strContactInfo, strEmail], function (err) {
            if (err) {
                console.log(err)
                return res.status(400).json({
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

app.post('/login', (req, res, next) => {
    let strEmail = req.body.email.trim().toLowerCase()
    let strPassword = req.body.password

    // get user based on the email
    let strSelect = `SELECT * FROM tblUsers WHERE Email = ?`
    db.get(strSelect, [strEmail], (err, row) => {
        if (err) {
            console.log(err)
            return res.status(400).json({ status: "error", message: err.message })
        }

        if (!row) {
            return res.status(404).json({ status: "error", message: "User not found" })
        }

        // check if the password matches
        bcrypt.compare(strPassword, row.Password, (err, result) => {
            if (err || !result) {
                return res.status(401).json({ status: "error", message: "Invalid credentials" })
            }

            // updating LastLoginDateTime with the current time
            let lastLoginDateTime = new Date().toISOString()
            let strUpdate = `UPDATE tblUsers SET LastLoginDateTime = ? WHERE Email = ?`
            db.run(strUpdate, [lastLoginDateTime, strEmail], function (err) {
                if (err) {
                    console.log(err)
                    return res.status(400).json({ status: "error", message: err.message })
                }

                res.status(200).json({
                    status: "success",
                    message: "Login successful"
                })
            })
        })
    })
})