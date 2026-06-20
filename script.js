import { db } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { firebaseConfig } from "./firebase.js";

// Firebase App aur Auth ko initialize karna
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// SECURITY CHECK: Agar koi user logged in nahi hai to use login page (index.html) par bhej do
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        console.log("Logged in user:", user.email);
    }
});

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
console.log("Firebase Connected:", db);

// 1. HTML elements ko select karna
const todoInput = document.querySelector('.input-section input[type="text"]');
const todoTime = document.getElementById('todo-time');
const addBtn = document.querySelector('.add-btn');
const todoList = document.querySelector('.todo-list');
const searchInput = document.getElementById('search-input');

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Notification Permission
if ("Notification" in window) {
    Notification.requestPermission();
}

// Save Todos
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Sort Todos By Time
function sortTodos() {
    todos.sort((a, b) => {
        return (a.time || "23:59").localeCompare(b.time || "23:59");
    });
}

// Render Todos
function renderTodos() {

    sortTodos();

    const searchText =
        searchInput ? searchInput.value.toLowerCase() : "";

    todoList.innerHTML = "";

    todos.forEach((todo, index) => {

        if (
            searchText &&
            !todo.text.toLowerCase().includes(searchText) &&
            !(todo.time || "").includes(searchText)
        ) {
            return;
        }

        const todoItem = document.createElement("div");
        todoItem.classList.add("todo-item");
        todoItem.dataset.index = index;

        todoItem.innerHTML = `
            <div class="todo-left">

                <input type="checkbox"
                ${todo.completed ? "checked" : ""}>

                <div class="todo-details">

                    <span class="todo-text"
                    style="
                    text-decoration:${todo.completed ? "line-through" : "none"};
                    opacity:${todo.completed ? "0.5" : "1"};
                    ">
                        ${todo.text}
                    </span>

                    <span class="todo-time">
                        ${todo.time || "No Time"}
                    </span>

                </div>

            </div>

            <button class="delete-btn">
                Delete
            </button>
        `;

        // Checkbox
        const checkbox =
            todoItem.querySelector('input[type="checkbox"]');

        checkbox.addEventListener("change", () => {

            todos[index].completed = checkbox.checked;

            saveTodos();
            renderTodos();
        });

        // Delete
        const deleteBtn =
            todoItem.querySelector(".delete-btn");

        deleteBtn.addEventListener("click", () => {

            const confirmDelete =
                confirm(`Are you sure you want to delete "${todo.text}" ?`);

            if (confirmDelete) {

                todos.splice(index, 1);

                saveTodos();
                renderTodos();
            }
        });

        todoList.appendChild(todoItem);
    });
}

// Add Todo
function addTodo() {

    const text = todoInput.value.trim();
    const time = todoTime.value;

    if (text === "") {
        alert("Please enter a task");
        return;
    }

    const exists = todos.some(
        todo =>
        todo.text.toLowerCase() === text.toLowerCase()
    );

    if (exists) {
        alert("Task already exists!");
        return;
    }

    todos.push({
        text,
        time,
        completed: false,
        reminded: false
    });

    saveTodos();
    renderTodos();

    // Firebase Firestore me task save karna
    addDoc(collection(db, "todos"), {
    text: text,
    time: time,
    completed: false,
    reminded: false
})
.then(() => {
    console.log("Todo saved to Firebase");
})
.catch((error) => {
    console.error("Firebase Error:", error);
});


    scheduleNotification(text, time);

    todoInput.value = "";
    todoTime.value = "";
}

// Notification Scheduler
function scheduleNotification(task, time) {

    if (!time) return;

    const now = new Date();

    const [hour, minute] = time.split(":");

    const target = new Date();

    target.setHours(hour);
    target.setMinutes(minute);
    target.setSeconds(0);

    const delay = target.getTime() - now.getTime();

    if (delay > 0) {

        setTimeout(() => {

            if (Notification.permission === "granted") {

                new Notification("⏰ Reminder", {
                    body: task
                });

            }

        }, delay);
    }
}

// Pending Reminder
setInterval(() => {

    const now = new Date();

    const currentTime =
        String(now.getHours()).padStart(2, "0")
        + ":" +
        String(now.getMinutes()).padStart(2, "0");

    todos.forEach(todo => {

        if (
            !todo.completed &&
            !todo.reminded &&
            todo.time === currentTime
        ) {

            if (Notification.permission === "granted") {

                new Notification(
                    "⚠ Pending Task",
                    {
                        body: `You still need to complete: ${todo.text}`
                    }
                );
            }

            todo.reminded = true;
            saveTodos();
        }
    });

}, 60000);

// Add Button
addBtn.addEventListener("click", addTodo);

// Enter Key
todoInput.addEventListener("keypress", e => {

    if (e.key === "Enter") {
        addTodo();
    }

});

// Search Functionality
if (searchInput) {

    searchInput.addEventListener("input", () => {
        renderTodos();
    });

}

// Double Click Edit
todoList.addEventListener("dblclick", e => {

    const span = e.target.closest(".todo-text");

    if (!span) return;

    const todoItem =
        span.closest(".todo-item");

    const index =
        Number(todoItem.dataset.index);

    const oldText = span.innerText;

    const input =
        document.createElement("input");

    input.type = "text";
    input.value = oldText;
    input.classList.add("edit-input");

    span.replaceWith(input);

    input.focus();

    function saveEdit() {

        const newText =
            input.value.trim() || oldText;

        todos[index].text = newText;

        saveTodos();
        renderTodos();
    }

    input.addEventListener("blur", saveEdit);

    input.addEventListener("keypress", e => {

        if (e.key === "Enter") {
            saveEdit();
        }

    });

});

// Load Existing Notifications
todos.forEach(todo => {

    if (!todo.completed) {

        scheduleNotification(
            todo.text,
            todo.time
        );

    }

});

// Initial Render
renderTodos();


/* ==========================================================================
   NEW CODE: LOGOUT FUNCTIONALITY
   ========================================================================== */
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            alert("Logged out successfully!");
            window.location.href = "index.html"; // Wapas Login Page par bhejna
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    });
}