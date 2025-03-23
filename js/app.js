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