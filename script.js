// 1. HTML elements ko select karna
const todoInput = document.querySelector('.input-section input[type="text"]');
const todoTime = document.getElementById('todo-time');
const addBtn = document.querySelector('.add-btn');
const todoList = document.querySelector('.todo-list');

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Notification Permission
if ("Notification" in window) {
    Notification.requestPermission();
}

// Save Local Storage
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Sort Tasks By Time
function sortTodos() {
    todos.sort((a, b) => {
        return (a.time || "23:59").localeCompare(b.time || "23:59");
    });
}

// Render Todos
function renderTodos() {

    sortTodos();

    todoList.innerHTML = "";

    todos.forEach((todo, index) => {

        const todoItem = document.createElement("div");
        todoItem.classList.add("todo-item");

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

        // Delete Confirmation
        const deleteBtn =
            todoItem.querySelector(".delete-btn");

        deleteBtn.addEventListener("click", () => {

            const confirmDelete =
                confirm(`Delete "${todo.text}" ?`);

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

    todos.push({
        text,
        time,
        completed: false,
        reminded: false
    });

    saveTodos();
    renderTodos();

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

                new Notification(
                    "⏰ Reminder",
                    {
                        body: task
                    }
                );

            }

        }, delay);
    }
}

// Pending Task Reminder
setInterval(() => {

    const now = new Date();

    const currentTime =
        String(now.getHours()).padStart(2, "0")
        + ":" +
        String(now.getMinutes()).padStart(2, "0");

    todos.forEach(todo => {

        if (
            !todo.completed &&
            todo.time === currentTime
        ) {

            if (Notification.permission === "granted") {

                new Notification(
                    "⚠ Pending Task",
                    {
                        body:
                        `You still need to complete: ${todo.text}`
                    }
                );
            }
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

// Double Click Edit
todoList.addEventListener("dblclick", e => {

    const span = e.target.closest(".todo-text");

    if (!span) return;

    const todoItem =
        span.closest(".todo-item");

    const index =
        [...todoList.children].indexOf(todoItem);

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

// Initial Render
renderTodos();