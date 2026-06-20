import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements ko select kiya
const nameInput = document.getElementById("auth-name"); // Naya Name field
const authTitle = document.getElementById("auth-title"); // Dynamic Title
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

// Yeh track karega ki user abhi Login screen par hai ya Signup screen par
let isSignUpState = false;

// 🔥 Aapka feature: Input fields ko ekdum saaf (clear) karne ka function
function clearInputs() {
    if (nameInput) nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
}

// 1. Sign Up Button Trigger (Toggle + Registration Logic)
signupBtn.addEventListener("click", () => {
    // Agar user abhi login par hai aur pehli baar Sign Up daba raha hai
    if (!isSignUpState) {
        isSignUpState = true;
        nameInput.style.display = "block"; // Name input ko dikhao
        authTitle.innerText = "Create your account";
        signupBtn.innerText = "Register";
        loginBtn.innerText = "Back to Login";
        clearInputs(); // 🔥 State badalte hi input data clear
        return;
    }

    // Agar user 'Register' mode mein aa chuka hai, toh account banao
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !email || !password) {
        alert("Please fill all 3 fields: Name, Email, and Password.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User ka Name (displayName) Firebase profile mein save karna
            return updateProfile(userCredential.user, {
                displayName: name
            });
        })
        .then(() => {
            alert("Account successfully created! Welcome.");
            clearInputs(); // 🔥 Signup safal hote hi data ekdum clear!
            window.location.href = "todo.html"; 
        })
        .catch((error) => {
            alert("Signup Error: " + error.message);
        });
});

// 2. Sign In Button Trigger (Toggle Reset + Login Logic)
loginBtn.addEventListener("click", () => {
    // Agar user Signup mode mein tha aur wapas 'Back to Login' dabata hai
    if (isSignUpState) {
        isSignUpState = false;
        nameInput.style.display = "none"; // Name field chhupao
        authTitle.innerText = "Login to Todo App";
        signupBtn.innerText = "Sign Up";
        loginBtn.innerText = "Sign In";
        clearInputs(); // 🔥 Back to Login aate hi saara data clear
        return;
    }

    // Normal Login Logic
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            clearInputs(); // Login hone par bhi inputs clear
            window.location.href = "todo.html"; 
        })
        .catch((error) => {
            alert("Invalid User! Please check your email and password."); 
        });
});