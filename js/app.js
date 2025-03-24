
// Swap to Registration form with Login
document.getElementById('btnSwapRegister').addEventListener('click', function() {
    document.getElementById('frmLogin').style.display = 'none'
    document.getElementById('frmRegister').style.display = 'block'
})

// Swap to Login form with Registration
document.getElementById('btnSwapLogin').addEventListener('click', function() {
    document.getElementById('frmRegister').style.display = 'none'
    document.getElementById('frmLogin').style.display = 'block'
})

// Home  There is currently no Home but when we make the Main Page/Page to sell the site then this will do more then just hide the others
document.getElementById('btnHome').addEventListener('click', function() {
    document.getElementById('frmLogin').style.display = 'none'
    document.getElementById('frmRegister').style.display = 'none'
    document.getElementById('homeContent').style.display = 'block'
})

// Registration form
document.getElementById('btnShowRegister').addEventListener('click', function() {
    document.getElementById('frmLogin').style.display = 'none'
    document.getElementById('frmRegister').style.display = 'block'
    document.getElementById('homeContent').style.display = 'none'
})

// Login form
document.getElementById('btnShowLogin').addEventListener('click', function() {
    document.getElementById('frmLogin').style.display = 'block'
    document.getElementById('frmRegister').style.display = 'none'
    document.getElementById('homeContent').style.display = 'none'
})



document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded")
    // make sure the document is loaded before running any code
    const loginForm = document.getElementById("loginPage");
    const signUpForm = document.getElementById("signupPage");

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
                Swal.fire({
                    title: "Success!",
                    html: "<p class='mb-0 mt-0'>Login Successful</p>",
                    icon: "success"
                });
            }
        })
    }

    if (signUpForm){
        document.querySelector("#btnSubmit").addEventListener("click",(e) => {
            const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
            const regPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
            let strUserName = document.querySelector("#txtUsername").value
            const strPassword = document.querySelector("#txtPassword").value
            let strFirstName = document.querySelector("#txtFirstname").value
            let strLastName = document.querySelector("#txtLastname").value
            let strContactUsername = document.querySelector("#txtUsernameContact").value
            let contactMethod = document.querySelector("#inputGroupSelect01").value
    
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

            if(strFirstName.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a First Name</p>"
            }

            if(strLastName.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Last Name</p>"
            }

            if(strContactUsername.trim().length < 1) {
                blnError = true
                strMessage += "<p class='mb-0 mt-0'>Must Provide a Contact Info Email/Number/Number</p>"
            }

            if (contactMethod === "Best way to contact") {
                blnError = true;
                strMessage += "<p class='mb-0 mt-0'>Please choose a contact method</p>";
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
    }

})