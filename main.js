// 1. Initial State - Load from LocalStorage or use defaults
let tasks = JSON.parse(localStorage.getItem('rpg-todo-tasks')) || [];
let stats = JSON.parse(localStorage.getItem('rpg-todo-stats')) || {
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100
};

// 2. Core Functions
function addTask() {
    const input = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-input');
    const dateInput = document.getElementById('due-date-input');
    const text = input.value.trim();

    if (!text) {
        alert("Enter a quest name, Hero!");
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: text,
        priority: prioritySelect.value, // 'low', 'medium', or 'high'
        dueDate: dateInput.value,
        completed: false
    };

    tasks.push(newTask);
    input.value = ''; // Reset input
    dateInput.value = ''; // Reset date
    saveAndRender();
}

function completeTask(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];

    if (!task.completed) {
        // Award XP based on priority
        const rewards = { low: 10, medium: 20, high: 50 };
        gainXP(rewards[task.priority]);

        task.completed = true;
        saveAndRender();

        // Optional: Remove the task after a short delay
        setTimeout(() => {
            deleteTask(id);
        }, 1000);
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function gainXP(amount) {
    stats.currentXP += amount;

    // Level Up Logic
    while (stats.currentXP >= stats.xpToNextLevel) {
        stats.currentXP -= stats.xpToNextLevel;
        stats.level++;
        stats.xpToNextLevel = Math.floor(stats.xpToNextLevel * 1.5);
        alert(`🎉 LEVEL UP! You reached Level ${stats.level}!`);
    }
}

// 3. Data & UI Management
function saveAndRender() {
    localStorage.setItem('rpg-todo-tasks', JSON.stringify(tasks));
    localStorage.setItem('rpg-todo-stats', JSON.stringify(stats));
    render();
}

function updateStatsUI() {
    document.getElementById('level-display').textContent = stats.level;
    document.getElementById('xp-current').textContent = stats.currentXP;
    document.getElementById('xp-next').textContent = stats.xpToNextLevel;

    const percentage = (stats.currentXP / stats.xpToNextLevel) * 100;
    document.getElementById('xp-bar-fill').style.width = `${percentage}%`;
}

function render() {
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');

    taskList.innerHTML = '';
    updateStatsUI();

    if (tasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <button class="btn-complete" onclick="completeTask('${task.id}')"><i class="fas fa-check"></i></button>
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    ${task.dueDate ? `<small class="due-date-text"><i class="far fa-clock"></i> Due: ${new Date(task.dueDate).toLocaleString()}</small>` : ''}
                </div>
                <button class="btn-delete" onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
            `;
            taskList.appendChild(li);
        });
    }
}

// 4. Initialize Event Listeners when page loads
window.onload = () => {
    const addBtn = document.getElementById('add-btn');
    const taskInput = document.getElementById('task-input');

    addBtn.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Make functions global so the 'onclick' in HTML can find them
    window.completeTask = completeTask;
    window.deleteTask = deleteTask;

    render();
};