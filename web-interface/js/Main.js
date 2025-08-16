import RouterAuth from "./Auth.js";

const auth = new RouterAuth();

window.login = function() {
    var inputUsername = document.querySelector("#username").value;
    var inputPassword = document.querySelector("#password").value;

    auth.login({ username: inputUsername, password: inputPassword }).then(result => {
        if (result.success) {
            var loginButton = document.querySelector("#loginButton");

            loginButton.disabled = true;
            loginButton.style.pointerEvents = 'none';

            loginButton.style.animation = 'none';
            void loginButton.offsetHeight;
            loginButton.style.animation = "success 0.3s ease-in-out forwards";
            loginButton.innerHTML = "Authenticating...";

            setTimeout(() => {
                window.location.href = "Dashboard.html";
            }, 4000);
        } else {
            showError(result.message);
        }
    });

};


window.toggleVisibility = function() {
    var passwordInput = document.querySelector("#password");
    var visibilityIcon = document.querySelector("#visibility");

    if (passwordInput && visibilityIcon) {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            visibilityIcon.textContent = "🙉";
        } else {
            passwordInput.type = "password";
            visibilityIcon.textContent = "🙈";
        }
    }
};

function showError(message) {
    var errorMessage = document.querySelector(".error-message");
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
        errorMessage.style.animation = 'none';
        void errorMessage.offsetHeight;
        errorMessage.style.animation = "slideIn 0.5s ease-out, fadeOut 0.5s ease-out 2s forwards";
    }
}


document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        window.login();
    }
});
