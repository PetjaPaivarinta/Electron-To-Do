const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        handleSave(); // Call your function
    });

    loadTasks(); // Load tasks when the page loads
});

async function handleSave() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    const newTask = formData.get('todo');

    const tasks = await ipcRenderer.invoke('read-file');
    const taskId = new Date().getTime().toString(); // Generate a unique ID for the task
    tasks[taskId] = newTask;

    const jsonString = JSON.stringify(tasks, null, 2);

    // Send the JSON string to the main process to save the file
    await ipcRenderer.invoke('save-file', jsonString);

    console.log('Form submitted and data sent to main process for saving');

    // Reload tasks to update the UI
    loadTasks();
}

async function loadTasks() {
    const tasks = await ipcRenderer.invoke('read-file');
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ''; // Clear existing tasks

    for (const key in tasks) {
        if (tasks.hasOwnProperty(key)) {
            const task = tasks[key];
            const row = document.createElement('tr');
            const taskCell = document.createElement('td');
            taskCell.textContent = task;

            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => handleDelete(key);

            actionCell.appendChild(deleteButton);
            row.appendChild(taskCell);
            row.appendChild(actionCell);
            taskList.appendChild(row);
        }
    }
}

async function handleDelete(taskId) {
    const tasks = await ipcRenderer.invoke('read-file');
    delete tasks[taskId];

    const jsonString = JSON.stringify(tasks, null, 2);

    // Send the updated JSON string to the main process to save the file
    await ipcRenderer.invoke('save-file', jsonString);

    console.log('Task deleted and data sent to main process for saving');

    // Reload tasks to update the UI
    loadTasks();
}