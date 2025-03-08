const calendarContainer = document.querySelector('.calendar-container');
const taskContainer = document.querySelector('.task-container');

let tasks = {};
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;
let allTasksVisible = false;

// Function to initialize and render the calendar controls
function setupCalendarControls() {
    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('calendar-controls');

    const prevButton = document.createElement('button');
    prevButton.classList.add('control-button');
    prevButton.textContent = '‹';
    prevButton.addEventListener('click', () => changeMonth(-1));

    const nextButton = document.createElement('button');
    nextButton.classList.add('control-button');
    nextButton.textContent = '›';
    nextButton.addEventListener('click', () => changeMonth(1));

    const monthYearDisplay = document.createElement('h3');
    monthYearDisplay.classList.add('current-month-year');
    monthYearDisplay.id = 'currentMonthYear';

    controlsDiv.append(prevButton, monthYearDisplay, nextButton);
    calendarContainer.appendChild(controlsDiv);

    const calendarDiv = document.createElement('div');
    calendarDiv.classList.add('calendar');
    calendarDiv.id = 'calendar';

    calendarContainer.appendChild(calendarDiv);
}

// Function to set up task input and controls
function setupTaskControls() {
    const selectedDateDisplay = document.createElement('div');
    selectedDateDisplay.id = 'selectedDateDisplay';
    selectedDateDisplay.classList.add('selected-date-display');

    const taskHeading = document.createElement('h2');
    taskHeading.textContent = 'Daily Writing Goal Tracker';

    const taskInput = document.createElement('textarea');
    taskInput.id = 'taskInput';
    taskInput.placeholder = 'Write your goal or task for the day...';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Task';
    saveButton.addEventListener('click', saveTask);

    const taskList = document.createElement('ul');
    taskList.id = 'taskList';
    taskList.classList.add('task-list');

    const showAllButton = document.createElement('button');
    showAllButton.classList.add('show-all-button');
    showAllButton.textContent = 'Show All Tasks';
    showAllButton.addEventListener('click', showAllTasks);

    taskContainer.append(selectedDateDisplay, taskHeading, taskInput, saveButton, taskList, showAllButton);
}

// Calendar generation logic
function generateCalendar() {
    const calendarElement = document.getElementById('calendar');
    calendarElement.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty spaces for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
        calendarElement.appendChild(document.createElement('div'));
    }

  
    for (let day = 1; day <= lastDate; day++) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
        const dayDiv = document.createElement('div');
        dayDiv.textContent = day;

        if (tasks[dateKey]) {
            dayDiv.classList.add('completed');
        }

        dayDiv.addEventListener('click', () => selectDate(dateKey));
        calendarElement.appendChild(dayDiv);
    }
}


function updateMonthYearDisplay() {
    const monthYearElement = document.getElementById('currentMonthYear');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
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


function selectDate(date) {
    selectedDate = date;

    document.querySelectorAll('.calendar div').forEach(div => div.classList.remove('selected'));
    const dayElement = [...document.getElementById('calendar').children]
        .find(div => div.textContent == new Date(date).getDate());
    if (dayElement) {
        dayElement.classList.add('selected');
    }

    displaySelectedDate(date);
    loadTasksForDate(date);
}


function displaySelectedDate(date) {
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const dateObj = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];
    selectedDateDisplay.textContent = `${dayNames[dateObj.getDay()]}, ${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}

function saveTask() {
    const taskInput = document.getElementById('taskInput');
    if (!selectedDate || !taskInput.value.trim()) return;

    tasks[selectedDate] = tasks[selectedDate] || [];
    tasks[selectedDate].push(taskInput.value.trim());
    taskInput.value = '';

    generateCalendar();
    loadTasksForDate(selectedDate);
    saveToLocalStorage();
}


function loadTasksForDate(date) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const dateTasks = tasks[date] || [];
    dateTasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.textContent = task;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTask(date, index));

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => editTask(date, index));

        taskItem.append(deleteButton, editButton);
        taskList.appendChild(taskItem);
    });
}


function deleteTask(date, index) {
    tasks[date].splice(index, 1);
    if (!tasks[date].length) delete tasks[date];

    generateCalendar();
    loadTasksForDate(date);
    saveToLocalStorage();
}


function editTask(date, index) {
    const taskInput = document.getElementById('taskInput');
    taskInput.value = tasks[date][index];
    deleteTask(date, index);
    selectDate(date);
}


function showAllTasks() {
    allTasksVisible = !allTasksVisible;
    const showAllButton = document.querySelector('.show-all-button');
    const taskList = document.getElementById('taskList');

    showAllButton.textContent = allTasksVisible ? 'Hide All Tasks' : 'Show All Tasks';
    taskList.innerHTML = '';

    if (allTasksVisible) {
        for (const date in tasks) {
            tasks[date].forEach(task => {
                const listItem = document.createElement('li');
                listItem.textContent = `${task} (Date: ${date})`;
                taskList.appendChild(listItem);
            });
        }
    } else if (selectedDate) {
        loadTasksForDate(selectedDate);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


function loadFromLocalStorage() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (storedTasks) tasks = storedTasks;

    generateCalendar();
}


function init() {
    setupCalendarControls();
    setupTaskControls();
    loadFromLocalStorage();
    updateMonthYearDisplay();
    generateCalendar();
}

init();
