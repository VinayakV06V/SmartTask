
const API_URL = "/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");

async function loadTasks() {
    taskList.innerHTML = "<p>Loading tasks...</p>";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load tasks.");
        }

        const tasks = await response.json();
        renderTasks(tasks);
        updateStatistics(tasks);
    } catch (error) {
        taskList.innerHTML =
            "<p>Unable to load tasks. Check that the backend is running.</p>";
        message.textContent = error.message;
    }
}

function updateStatistics(tasks) {
    document.getElementById("totalTasks").textContent = tasks.length;

    const completed = tasks.filter(task =>
        String(task.status).toUpperCase() === "COMPLETED"
    ).length;

    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent =
        tasks.length - completed;
}

function renderTasks(tasks) {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        taskList.innerHTML =
            "<p>No tasks yet. Add your first task above!</p>";
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("article");
        card.className = "task-card";

        const title = document.createElement("h3");
        title.textContent = task.title || "Untitled task";

        const description = document.createElement("p");
        description.textContent = task.description || "No description";

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        priority.textContent = "Priority: " + (task.priority || "MEDIUM");

        const dueDate = document.createElement("span");
        dueDate.textContent = "Due: " + (task.dueDate || "Not set");

        meta.append(priority, dueDate);

        const status = document.createElement("p");
        status.textContent = "Status: " + (task.status || "PENDING");

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.textContent =
            String(task.status).toUpperCase() === "COMPLETED"
                ? "Completed"
                : "Mark Complete";

        completeButton.disabled =
            String(task.status).toUpperCase() === "COMPLETED";

        completeButton.addEventListener("click", () =>
            completeTask(task.id)
        );

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () =>
            deleteTask(task.id)
        );

        actions.append(completeButton, deleteButton);
        card.append(title, description, meta, status, actions);
        taskList.appendChild(card);
    });
}

taskForm.addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "Saving task...";

    const task = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        priority: document.getElementById("priority").value,
        status: "PENDING",
        dueDate: document.getElementById("dueDate").value || null
    };

    if (!task.title) {
        message.textContent = "Please enter a task title.";
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            const details = await response.text();
            throw new Error(details || "Task could not be saved.");
        }

        taskForm.reset();
        document.getElementById("priority").value = "HIGH";
        message.textContent = "Task added successfully!";
        await loadTasks();
    } catch (error) {
        message.textContent = "Error: " + error.message;
    }
});

async function completeTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/complete`, {
            method: "PUT"
        });

        if (!response.ok) {
            throw new Error("Completion endpoint is not available yet.");
        }

        message.textContent = "Task completed!";
        await loadTasks();
    } catch (error) {
        message.textContent = error.message;
    }
}

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete endpoint is not available yet.");
        }

        message.textContent = "Task deleted!";
        await loadTasks();
    } catch (error) {
        message.textContent = error.message;
    }
}

document.getElementById("refreshButton")
    .addEventListener("click", loadTasks);

loadTasks();
