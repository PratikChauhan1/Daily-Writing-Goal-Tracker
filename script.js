
const calendarElement = document.getElementById('calendar');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');
let selectedDate = null;
let tasks = {};
let allTasksVisible = false;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();


function generateCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    calendarElement.innerHTML = '';

    

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        calendarElement.appendChild(emptyDiv);
    }
    

    for (let i = 1; i <= lastDate; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = i;
        const dateKey = `${currentYear}-${currentMonth + 1}-${i}`;
        dayDiv.onclick = () => selectDate(dateKey);
        if (tasks[dateKey]) {
            dayDiv.classList.add('completed');
        }
        calendarElement.appendChild(dayDiv);
    }
}



const currentMonthYearElement = document.getElementById('currentMonthYear');

function updateMonthYearDisplay() {
    const monthNames = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October", "November", "December"
    ];
    currentMonthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

function changeMonth(direction) {
    currentMonth += direction;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    generateCalendar();
    updateMonthYearDisplay();
}

// Initial setup
updateMonthYearDisplay();
generateCalendar();


function selectDate(date) {
    selectedDate = date;
    document.querySelectorAll('.calendar div').forEach(div => div.classList.remove('selected'));
    const dayDiv = Array.from(calendarElement.children).find(div => div.textContent == new Date(date).getDate());
    if (dayDiv) {
        dayDiv.classList.add('selected');
    }
    displayFullDate(date);
    loadTasksForSelectedDate();
}

function displayFullDate(date) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const dateObj = new Date(date);
    const dayName = dayNames[dateObj.getDay()];
    const monthName = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    
    // Display the full date on the screen
    selectedDateDisplay.textContent = `${dayName}, ${monthName} ${day}, ${year}`;
}

function saveTask() {
    if (selectedDate === null || taskInput.value.trim() === '') return;

    if (!tasks[selectedDate]) {
        tasks[selectedDate] = [];
    }

    tasks[selectedDate].push(taskInput.value.trim());
    taskInput.value = '';

    document.querySelectorAll('.calendar div').forEach(div => {
        if (div.textContent == new Date(selectedDate).getDate()) {
            div.classList.add('completed');
        }
    });

    loadTasksForSelectedDate();
    saveToLocalStorage();
}

function deleteTask(date, index) {
    tasks[date].splice(index, 1);
    if (tasks[date].length === 0) delete tasks[date];
    saveToLocalStorage();
    generateCalendar();
    loadTasksForSelectedDate();
}

function editTask(date, index) {
    selectedDate = date;
    taskInput.value = tasks[date][index];
    tasks[date].splice(index, 1);
    selectDate(date);
}

function loadTasksForSelectedDate() {
    if (selectedDate === null || allTasksVisible) return;

    taskList.innerHTML = '';
    const taskArray = tasks[selectedDate] || [];
    taskArray.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = task;

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-button';
        editButton.onclick = () => editTask(selectedDate, index);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'edit-button';
        deleteButton.onclick = () => deleteTask(selectedDate, index);

        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        taskList.appendChild(listItem);
    });
}

function displayAllTasks() {
    taskList.innerHTML = '';
    for (let date in tasks) {
        tasks[date].forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${task} (Date: ${date})`;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-button';
            editButton.onclick = () => editTask(date, index);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'edit-button';
            deleteButton.onclick = () => deleteTask(date, index);

            listItem.appendChild(editButton);
            listItem.appendChild(deleteButton);
            taskList.appendChild(listItem);
        });
    }
}

function showAllTasks() {
    allTasksVisible = !allTasksVisible;

    if (allTasksVisible) {
        document.querySelector('.show-all-button').textContent = 'Hide All Tasks';
        displayAllTasks();
    } else {
        document.querySelector('.show-all-button').textContent = 'Show All Tasks';
        loadTasksForSelectedDate();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadFromLocalStorage() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (storedTasks) {
        tasks = storedTasks;
    }
    generateCalendar();
    if (selectedDate) {
        loadTasksForSelectedDate();
    }
}

document.getElementById('saveTaskButton').addEventListener('click', saveTask);
document.getElementById('toggleAllTasksButton').addEventListener('click', showAllTasks);

function generateCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    calendarElement.innerHTML = '';

    // Add empty spaces for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
        calendarElement.appendChild(document.createElement('div'));
    }

    // Add day elements
    for (let i = 1; i <= lastDate; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = i;
        dayDiv.dataset.date = `${currentYear}-${currentMonth + 1}-${i}`;

        if (tasks[dayDiv.dataset.date]) {
            dayDiv.classList.add('completed');
        }

        dayDiv.addEventListener('click', () => selectDate(dayDiv.dataset.date));
        calendarElement.appendChild(dayDiv);
    }
}

function saveTask() {
    if (!selectedDate || !taskInput.value.trim()) return;

    tasks[selectedDate] = tasks[selectedDate] || [];
    tasks[selectedDate].push(taskInput.value.trim());
    taskInput.value = '';

    document.querySelector(`[data-date='${selectedDate}']`).classList.add('completed');
    loadTasksForSelectedDate();
    saveToLocalStorage();
}

 

loadFromLocalStorage();
generateCalendar();
