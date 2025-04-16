
document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded")
    // make sure the document is loaded before running any code
    const loginForm = document.getElementById("frmLogin");
    const signUpForm = document.getElementById("frmRegister");

    
    // Swap to Registration form with Login
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

    // Swap to Login from Registrtion
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

    if (loginForm){
        document.querySelector("#btnLogin").addEventListener("click",(e) => {
            const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
            let strUserName = document.querySelector("#txtLoginUsername").value
            const strPassword = document.querySelector("#txtLoginPassword").value
    
            strUserName = strUserName.toLowerCase()
            let blnError = false
            let strMessage = ""
    
            if (!regEmail.test(strUserName.trim())){
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Username Must Be an Email Address</p>"               
            }
    
            if (!regPassword.test(strPassword.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Password Must Be at Least 8 Characters Long and Contain at Least One Uppercase Letter, One Lowercase Letter, and One Number</p>"
            }
            
            if (blnError){
                Swal.fire({
                    title: "Oh no, you have error!",
                    html: strMessage,
                    icon: "error"
                });
            }
            else {
                // Hide the login and register buttons because they logged in
                document.getElementById("btnShowRegister").classList.add("d-none")
                document.getElementById("btnShowLogin").classList.add("d-none")

                // Show Logout
                document.getElementById("btnLogout").classList.remove("d-none")

                fetch("components/course.html")
                .then(response => response.text())
                .then(html => {
                    document.querySelector('#divContent').innerHTML = html
                    document.querySelector('#frmLogin').style.display = 'none' // Hide login form
                })
                .catch(error => console.error("Error loading course page:", error))
            }
            
        })
    }

    if (signUpForm){
        document.querySelector("#btnSubmit").addEventListener("click",(e) => {
            const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
            const regPhone = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/
            let strUserName = document.querySelector("#txtUsername").value
            const strPassword = document.querySelector("#txtPassword").value
            let strRegistration = document.querySelector('#registerationType').value
            let strFirstName = document.querySelector("#txtFirstname").value
            let strLastName = document.querySelector("#txtLastname").value
            let strContactUsername = document.querySelector("#txtUsernameContact").value
            let contactMethod = document.querySelector("#inputGroupSelect01").value
            console.log(contactMethod)
    
            strUserName = strUserName.toLowerCase()
            let blnError = false
            let strMessage = ""
    
            if (!regEmail.test(strUserName.trim())){
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Username Must Be an Email Address</p>"               
            }
    
            if (!regPassword.test(strPassword.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Password Must Be at Least 8 Characters Long and Contain at Least One Uppercase Letter, One Lowercase Letter, and One Number</p>"
            }
            if (strRegistration != "teacher" && strRegistration != "student") {
                blnError = true;
                strMessage += "<p class='mb-0 mt-0'>Please choose one of the values(Teacher,Student)</p>";
            }
            if(strFirstName.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a First Name</p>"
            }

            if(strLastName.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Last Name</p>"
            }
            if (contactMethod != "email" && contactMethod != "mobile" && contactMethod != "teams" && contactMethod != "discord" ) {
                blnError = true;
                strMessage += "<p class='mb-0 mt-0'>Please choose one of the values(Email,Mobile,Teams,Discord)</p>";
            }

            if (contactMethod === "Best way to contact") {
                blnError = true;
                strMessage += "<p class='mb-0 mt-0'>Please choose a contact method</p>";
            }

            if(contactMethod === "email" && !regEmail.test(strContactUsername.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Valid Email Address</p>"
            }

            if(contactMethod === "mobile" && !regPhone.test(strContactUsername.trim())) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Valid Phone Number</p>"
            }

            if(contactMethod === "teams" && strContactUsername.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Teams Username</p>"
            }
            if(contactMethod === "discord" && strContactUsername.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Discord Username</p>"
            }
            if(strContactUsername.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide Contact Info</p>"
            }

            
            if (blnError){
                Swal.fire({
                    title: "Oh no, you have error!",
                    html: strMessage,
                    icon: "error"
                });
            }
            else {
                Swal.fire({
                    title: "Success!",
                    html: "<p class='mb-0 mt-0'>Login Successful</p>",
                    icon: "success"
                });
            }
        
        })

        // change txtUsernameContact placeholder based on selected contact method
        document.querySelector("#inputGroupSelect01").addEventListener("change", (e) => {
            const contactMethod = e.target.value;
            const txtUsernameContact = document.querySelector("#txtUsernameContact");

            if (contactMethod == "email") {
                txtUsernameContact.placeholder = "Email Address";
            } else if (contactMethod == "mobile") {
                txtUsernameContact.placeholder = "Mobile Number";
            } else if (contactMethod == "teams") {
                txtUsernameContact.placeholder = "Teams Username";
            } else if (contactMethod == "discord") {
                txtUsernameContact.placeholder = "Discord Username";
            }
        })
    }

})