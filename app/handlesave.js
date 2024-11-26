const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        handleSave(); // Call your function
    });

    loadTasks(); // Load tasks when the page loads
});

function handleSave() {
    const form = document.querySelector('form');
    const formData = new FormData(form);
    const newTask = formData.get('todo');

    const filePath = path.join(__dirname, 'data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        let tasks = {};
        if (!err) {
            tasks = JSON.parse(data);
        }

        const taskId = new Date().getTime().toString(); // Generate a unique ID for the task
        tasks[taskId] = newTask;

        const jsonString = JSON.stringify(tasks, null, 2);

        // Send the JSON string to the main process to save the file
        ipcRenderer.send('save-file', jsonString);

        console.log('Form submitted and data sent to main process for saving');

        // Reload tasks to update the UI
        loadTasks();
    });
}

function loadTasks() {
    const filePath = path.join(__dirname, 'data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read file:', err);
            return;
        }

        const tasks = JSON.parse(data);
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = ''; // Clear existing tasks

        for (const key in tasks) {
            if (tasks.hasOwnProperty(key)) {
                const task = tasks[key];
                const row = document.createElement('tr');
                const taskCell = document.createElement('td');
                taskCell.textContent = task;
                row.appendChild(taskCell);
                taskList.appendChild(row);
            }
        }
    });
}