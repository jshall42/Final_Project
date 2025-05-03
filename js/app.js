document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded")
    
    // dom elements
    const loginForm = document.getElementById("frmLogin")
    const signUpForm = document.getElementById("frmRegister")

    // generate a random course code
    function generateCourseCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)]
        }
        return code
    }
    
    // Swap to Registration form from Login
    document.getElementById('btnSwapRegister').addEventListener('click', function() {
        document.getElementById('frmLogin').style.display = 'none'
        document.getElementById('frmRegister').style.display = 'block'
    })

    // Swap to Registration form from home
    document.getElementById('btnReg').addEventListener('click', function() {
        document.getElementById('homeContent').style.display = 'none'
        document.getElementById('frmRegister').style.display = 'block'
    })

    // Swap to Login form from home
    document.getElementById('btnLog').addEventListener('click', function() {
        document.getElementById('homeContent').style.display = 'none'
        document.getElementById('frmLogin').style.display = 'block'
    })

    // Swap to Login from Registration
    document.getElementById('btnSwapLogin').addEventListener('click', function() {
        document.getElementById('frmRegister').style.display = 'none'
        document.getElementById('frmLogin').style.display = 'block'
    })

    // Swap to Password Reset from login
    document.getElementById('btnSwapPassword').addEventListener('click', function() {
        document.getElementById('frmLogin').style.display = 'none'
        document.getElementById('frmPassword').style.display = 'block'
    })

    // Home
    document.getElementById('btnHome').addEventListener('click', function() {
        document.getElementById('frmLogin').style.display = 'none'
        document.getElementById('frmRegister').style.display = 'none'
        document.getElementById('divContent').style.display = 'none'
        document.getElementById('homeContent').style.display = 'block'
    })

    // Registration form
    document.getElementById('btnShowRegister').addEventListener('click', function() {
        document.getElementById('frmLogin').style.display = 'none'
        document.getElementById('frmPassword').style.display = 'none'
        document.getElementById('frmRegister').style.display = 'block'
        document.getElementById('homeContent').style.display = 'none'
    })

    // Login form
    document.getElementById('btnShowLogin').addEventListener('click', function() {
        document.getElementById('frmLogin').style.display = 'block'
        document.getElementById('frmPassword').style.display = 'none'
        document.getElementById('frmRegister').style.display = 'none'
        document.getElementById('homeContent').style.display = 'none'
    })

    // logs out the user and hides the course page
    document.getElementById('btnLogout').addEventListener('click', function() {
        document.getElementById('divContent').style.display = 'none'
        document.getElementById('homeContent').style.display = 'block'
        // turn back on the login and register buttons
        document.getElementById("btnShowRegister").classList.remove("d-none")
        document.getElementById("btnShowLogin").classList.remove("d-none")
        document.getElementById("btnLogout").classList.add("d-none")
        // remove the course page   
        document.querySelector('#divContent').innerHTML = ""
    })

    // function to initialize event listeners for dynamically loaded course page
    function initializeCoursePageEventListeners() {
        // generate unique course code
        document.getElementById("btnGenerateCode").addEventListener("click", () => {
            document.getElementById("courseCode").value = generateCourseCode()
        })

        // show the add course modal when the button is clicked
        document.getElementById("btnAdd")?.addEventListener("click", () => {
            const modal = new bootstrap.Modal(document.getElementById("addCourseModal"))
            modal.show()
        })
        
        // show the create course form/modal
        document.getElementById("btnCreate")?.addEventListener("click", () => {
            const modal = new bootstrap.Modal(document.getElementById("createCourseModal"))
            modal.show()
        })
        
        document.getElementById("btnSubmitCourseCode").addEventListener("click", () => {
            const courseCode = document.getElementById("courseCodeInput").value
            const userEmail = sessionStorage.getItem("userEmail")

            blnError = false
            strMessage = ""
            // check if the course code is valid
            if (!courseCode) strMessage += "<p class='mb-0 mt-0'>Course Code is required</p>", blnError = true
            if (blnError) {
                Swal.fire({
                    title: "Error",
                    html: strMessage,
                    icon: "error"
                })
                return
            }
            // send the course code to the backend
            fetch("http://localhost:8000/peerreview/enroll", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: courseCode,
                    email: userEmail
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || "Failed to enroll in course")
                    })
                }
                return response.json()
            })
            .then(data => {
                Swal.fire({
                    title: "Success!",
                    html: "<p class='mb-0 mt-0'>Enrolled in course successfully</p>",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    // clear the course code input field
                    fetchAndDisplayCourses(userEmail) // refresh the course list
                    document.getElementById("courseCodeInput").value = ""
                    // hide the modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById("addCourseModal"))
                    modal.hide()
                })
            })
            .catch(error => {
                console.error("Error enrolling in course:", error)
                Swal.fire({
                    title: "Error",
                    html: `<p class='mb-0 mt-0'>${error.message}</p>`,
                    icon: "error"
                })
            })
        })

        document.getElementById("createCourseForm").addEventListener("submit", (e) => {
            e.preventDefault() // prevent the form from submitting normally
            // get the course info from the form
            const courseName = document.getElementById("courseName").value.trim()
            const courseNumber = document.getElementById("courseNumber").value.trim()
            const courseSection = document.getElementById("courseSection").value.trim()
            const courseTerm = document.getElementById("courseTerm").value.trim()
            const startDate = document.getElementById("startDate").value.trim()
            const endDate = document.getElementById("endDate").value.trim()
            const courseCode = document.getElementById("courseCode").value.trim()
            const instructorEmail = sessionStorage.getItem("userEmail")
            

            let blnError = false
            let strMessage = ""

            // check if the course info is valid
            if (!courseName) strMessage += "<p class='mb-0 mt-0'>Course Name is required</p>", blnError = true
            if (!courseNumber) strMessage += "<p class='mb-0 mt-0'>Course Number is required</p>", blnError = true
            if (!courseSection) strMessage += "<p class='mb-0 mt-0'>Course Section is required</p>", blnError = true
            if (!courseTerm) strMessage += "<p class='mb-0 mt-0'>Course Term is required</p>", blnError = true
            if (!startDate) strMessage += "<p class='mb-0 mt-0'>Start Date is required</p>", blnError = true
            if (!endDate) strMessage += "<p class='mb-0 mt-0'>End Date is required</p>", blnError = true
            if (!courseCode) strMessage += "<p class='mb-0 mt-0'>Course Code is required</p>", blnError = true
            if (blnError) {
                Swal.fire({
                    title: "Error",
                    html: strMessage,
                    icon: "error"
                })
                return
            }

            // send the course info to the backend
            fetch("http://localhost:8000/peerreview/course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: courseName,
                    number: courseNumber,
                    section: courseSection,
                    term: courseTerm,
                    start: startDate,
                    end: endDate,
                    code: courseCode,
                    email: instructorEmail
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || "Failed to create course")
                    })
                }
                return response.json()
            })
            .then(data => {
                Swal.fire({
                    title: "Success!",
                    html: "<p class='mb-0 mt-0'>Course created successfully</p>",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then(() => {
                    fetchAndDisplayCourses(instructorEmail) // refresh the course list
                    // clear the form fields
                    document.getElementById("courseName").value = ""
                    document.getElementById("courseNumber").value = ""
                    document.getElementById("courseSection").value = ""
                    document.getElementById("courseTerm").value = ""
                    document.getElementById("startDate").value = ""
                    document.getElementById("endDate").value = ""
                    document.getElementById("courseCode").value = ""

                    // hide the modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById("createCourseModal"))
                    modal.hide()
                })
            })
            .catch(error => {
                console.error("Error creating course:", error)
                Swal.fire({
                    title: "Error",
                    html: `<p class='mb-0 mt-0'>${error.message}</p>`,
                    icon: "error"
                })
            })
        })
    }

    function populateCourseContainer(courses) {
        const courseContainer = document.getElementById("courseContainer")
        courseContainer.innerHTML = "" // clear existing content
    
        courses.forEach(course => {
            const courseCard = `
                <div class="col-md-4 mb-4">
                    <button class="btn w-100 text-start p-3 shadow-sm border-0 bg-white">
                        <h5 class="mb-1">${course.CourseName} ${course.CourseNumber}</h5>
                        <p class="mb-0">Course Code: ${course.CourseCode}</p>
                        <p class="mb-0">Section: ${course.CourseSection}</p>
                        <p class="mb-0">Term: ${course.CourseTerm}</p>
                        <p class="mb-0">Instructor: ${course.InstructorName}</p>
                    </button>
                </div>
            `
            courseContainer.insertAdjacentHTML("beforeend", courseCard)
        })
    }

    function fetchAndDisplayCourses(userEmail) {
        // check if userEmail is available
        if (!userEmail) {
            console.warn("No user email provided. Skipping fetch.")
            return
        }
        // fetch courses from the backend
        fetch(`http://localhost:8000/peerreview/courses?userEmail=${encodeURIComponent(userEmail)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch courses")
                }
                return response.json()
            })
            .then(data => {
                if (data.status === "success") {
                    // populate the course container with the fetched courses
                    populateCourseContainer(data.courses)
                } else {
                    // handle error response from the server
                    console.error("Error fetching courses:", data.message)
                }
            })
            .catch(error => console.error("Error fetching courses:", error))
    }

    // function to load the course page
    function loadCoursePage(userType) {
        // hide login and register forms
        document.getElementById('frmLogin').style.display = 'none'
        document.getElementById('frmRegister').style.display = 'none'
        document.getElementById('homeContent').style.display = 'none'

        // show logout button and hide login/register buttons
        document.getElementById("btnShowRegister").classList.add("d-none")
        document.getElementById("btnShowLogin").classList.add("d-none")
        document.getElementById("btnLogout").classList.remove("d-none")

        fetch("components/course.html")
            .then(response => response.text())
            .then(html => {
                document.querySelector('#divContent').innerHTML = html
                document.querySelector('#divContent').style.display = 'block'

                // show the buttons based on user type
                if (userType === "teacher") {
                    document.getElementById("btnCreate").classList.remove("d-none")
                } else if (userType === "student") {
                    document.getElementById("btnAdd").classList.remove("d-none")
                }

                // event listeners for the course page
                initializeCoursePageEventListeners()

                // fetch and display courses after initializing event listeners
                const userEmail = sessionStorage.getItem("userEmail")
                fetchAndDisplayCourses(userEmail)
            })
            .catch(error => console.error("Error loading course page:", error))
    }

    // login form submission
    if (loginForm) {
        document.querySelector("#btnLogin").addEventListener("click", (e) => {
            e.preventDefault() // prevent the form from submitting normally
            const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
            
            let strUserName = document.querySelector("#txtLoginUsername").value
            const strPassword = document.querySelector("#txtLoginPassword").value

            strUserName = strUserName.toLowerCase()
            let blnError = false
            let strMessage = ""

            // check if the username and password are valid
            if (!regEmail.test(strUserName.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Username Must Be an Email Address</p>"
            }

            if (!regPassword.test(strPassword.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Password Must Be at Least 8 Characters Long and Contain at Least One Uppercase Letter, One Lowercase Letter, and One Number</p>"
            }

            if (blnError) {
                Swal.fire({
                    title: "Oh no, you have error!",
                    html: strMessage,
                    icon: "error"
                })
                return
            }

            // send login info to backend
            fetch("http://localhost:8000/peerreview/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: strUserName, password: strPassword })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    sessionStorage.setItem("userEmail", strUserName)
                    loadCoursePage(data.userType, strUserName)
                    Swal.fire({
                        title: "Success!",
                        html: `<p class='mb-0 mt-0'>Welcome, ${data.firstName} (${data.userType})</p>`,
                        icon: "success",
                        allowOutsideClick: false,
                        confirmButtonText: "Continue"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // clear the login form fields
                            document.querySelector("#txtLoginUsername").value = ""
                            document.querySelector("#txtLoginPassword").value = ""
                            
                            // load the course page based on user type
                            loadCoursePage(data.userType)
                        }
                    })
                } else {
                    Swal.fire({
                        title: "Login Failed",
                        html: "<p class='mb-0 mt-0'>Invalid username or password</p>",
                        icon: "error"
                    })
                }
            })
            .catch(err => {
                console.error("Login request failed:", err)
                Swal.fire({
                    title: "Error",
                    html: "<p class='mb-0 mt-0'>An error occurred during login</p>",
                    icon: "error"
                })
            })
        })
    }

    // registration form submission
    if (signUpForm) {
        document.querySelector("#btnSubmit").addEventListener("click", (e) => {
            const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
            const regPhone = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/
            
            // get the user info from the form
            let strUserName = document.querySelector("#txtUsername").value
            const strPassword = document.querySelector("#txtPassword").value
            let strRegistration = document.querySelector('#registerationType').value
            let strFirstName = document.querySelector("#txtFirstname").value
            let strLastName = document.querySelector("#txtLastname").value
            let strContactUsername = document.querySelector("#txtUsernameContact").value
            let contactMethod = document.querySelector("#inputGroupSelect01").value
            
            strUserName = strUserName.toLowerCase()
            let blnError = false
            let strMessage = ""

            // check if the user info is valid
            if (!regEmail.test(strUserName.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Username Must Be an Email Address</p>"
            }
    
            if (!regPassword.test(strPassword.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Password Must Be at Least 8 Characters Long and Contain at Least One Uppercase Letter, One Lowercase Letter, and One Number</p>"
            }
            
            if (strRegistration != "teacher" && strRegistration != "student") {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Please choose one of the values(Teacher,Student)</p>"
            }
            
            if (strFirstName.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a First Name</p>"
            }

            if (strLastName.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Last Name</p>"
            }
            
            if (contactMethod != "email" && contactMethod != "mobile" && contactMethod != "teams" && contactMethod != "discord") {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Please choose one of the values(Email,Mobile,Teams,Discord)</p>"
            }

            if (contactMethod === "Best way to contact") {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Please choose a contact method</p>"
            }

            if (contactMethod === "email" && !regEmail.test(strContactUsername.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Valid Email Address</p>"
            }

            if (contactMethod === "mobile" && !regPhone.test(strContactUsername.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Valid Phone Number</p>"
            }

            if (contactMethod === "teams" && strContactUsername.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Teams Username</p>"
            }
            
            if (contactMethod === "discord" && strContactUsername.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Discord Username</p>"
            }
            
            if (strContactUsername.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide Contact Info</p>"
            }
            if (blnError) {
                Swal.fire({
                    title: "Oh no, you have error!",
                    html: strMessage,
                    icon: "error"
                })
                return
            }
            
            // send registration info to backend
            fetch("http://localhost:8000/peerreview/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: strUserName,  
                    password: strPassword,
                    firstName: strFirstName,
                    lastName: strLastName,
                    contactType: contactMethod,
                    contactInfo: strContactUsername,
                    userType: strRegistration
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || data.error || "Registration failed")
                    })
                }
                return response.json()
            })
            .then(data => {
                Swal.fire({
                    title: "Success!",
                    html: "<p class='mb-0 mt-0'>Registration Successful</p>",
                    icon: "success",
                    allowOutsideClick: false,
                    confirmButtonText: "Continue to Login"
                }).then((result) => {
                    if (result.isConfirmed) {
                        document.getElementById('frmRegister').style.display = 'none' // Hide Register form
                        document.getElementById('homeContent').style.display = 'none'
                        document.getElementById('frmLogin').style.display = 'block'    // Show login form
                    }
                })
            })
            .catch(error => {
                console.error("Registration error:", error)
                Swal.fire({
                    title: "Registration Failed",
                    html: `<p class='mb-0 mt-0'>${error.message}</p>`,
                    icon: "error"
                })
            })
        })

        // Change txtUsernameContact placeholder based on selected contact method
        document.querySelector("#inputGroupSelect01").addEventListener("change", (e) => {
            const contactMethod = e.target.value
            const txtUsernameContact = document.querySelector("#txtUsernameContact")

            if (contactMethod == "email") {
                txtUsernameContact.placeholder = "Email Address"
            } else if (contactMethod == "mobile") {
                txtUsernameContact.placeholder = "Mobile Number"
            } else if (contactMethod == "teams") {
                txtUsernameContact.placeholder = "Teams Username"
            } else if (contactMethod == "discord") {
                txtUsernameContact.placeholder = "Discord Username"
            }
        })
    }
})