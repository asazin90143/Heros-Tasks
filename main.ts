// Define interfaces for our data structures
interface Task {
    id: string;
    text: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
}

interface PlayerStats {
    level: number;
    currentXP: number;
    xpToNextLevel: number;
}

// Configuration for XP rewards
const XP_REWARDS = {
    low: 10,
    medium: 20,
    high: 50
};

class TodoApp {
    private tasks: Task[] = [];
    private stats: PlayerStats = {
        level: 1,
        currentXP: 0,
        xpToNextLevel: 100
    };

    // DOM Elements
    private taskInput: HTMLInputElement;
    private priorityInput: HTMLSelectElement;
    private addBtn: HTMLButtonElement;
    private taskList: HTMLUListElement;
    private emptyState: HTMLElement;

    // Stats Elements
    private levelDisplay: HTMLElement;
    private xpCurrentDisplay: HTMLElement;
    private xpNextDisplay: HTMLElement;
    private xpBarFill: HTMLElement;

    constructor() {
        this.initializeElements();
        this.loadData();
        this.render();
        this.attachEventListeners();
    }

    private initializeElements(): void {
        this.taskInput = document.getElementById('task-input') as HTMLInputElement;
        this.priorityInput = document.getElementById('priority-input') as HTMLSelectElement;
        this.addBtn = document.getElementById('add-btn') as HTMLButtonElement;
        this.taskList = document.getElementById('task-list') as HTMLUListElement;
        this.emptyState = document.getElementById('empty-state') as HTMLElement;

        this.levelDisplay = document.getElementById('level-display')!;
        this.xpCurrentDisplay = document.getElementById('xp-current')!;
        this.xpNextDisplay = document.getElementById('xp-next')!;
        this.xpBarFill = document.getElementById('xp-bar-fill')!;
    }

    private attachEventListeners(): void {
        this.addBtn.addEventListener('click', () => this.addTask());

        // Allow pressing Enter to add task
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
    }

    private addTask(): void {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const priority = this.priorityInput.value as 'low' | 'medium' | 'high';

        const newTask: Task = {
            id: Date.now().toString(),
            text,
            priority,
            completed: false
        };

        this.tasks.push(newTask);
        this.taskInput.value = ''; // Clear input
        this.saveData();
        this.render();
    }

    private completeTask(id: string): void {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return;

        const task = this.tasks[taskIndex];

        // We only award XP if it wasn't already completed
        if (!task.completed) {
            this.gainXP(XP_REWARDS[task.priority]);

            // Remove the task with a slight delay for visual satisfaction
            // Or keep it as "done". Let's remove it to keep the list clean in RPG style (Quest Turn-in)
            // But standard Todo behavior is to cross it out. Let's cross it out first.
            task.completed = true;
            this.saveData();
            this.render();

            // Optional: Remove after delay
            setTimeout(() => {
                this.deleteTask(id);
            }, 1000);
        }
    }

    private deleteTask(id: string): void {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveData();
        this.render();
    }

    private gainXP(amount: number): void {
        this.stats.currentXP += amount;

        // Level Up Logic
        if (this.stats.currentXP >= this.stats.xpToNextLevel) {
            this.stats.currentXP -= this.stats.xpToNextLevel;
            this.stats.level++;
            this.stats.xpToNextLevel = Math.floor(this.stats.xpToNextLevel * 1.5); // Increase difficulty
            alert(`🎉 LEVEL UP! You are now Level ${this.stats.level}!`);
        }

        this.saveData();
        this.updateStatsUI();
    }

    private saveData(): void {
        localStorage.setItem('rpg-todo-tasks', JSON.stringify(this.tasks));
        localStorage.setItem('rpg-todo-stats', JSON.stringify(this.stats));
    }

    private loadData(): void {
        const savedTasks = localStorage.getItem('rpg-todo-tasks');
        const savedStats = localStorage.getItem('rpg-todo-stats');

        if (savedTasks) this.tasks = JSON.parse(savedTasks);
        if (savedStats) this.stats = JSON.parse(savedStats);
    }

    private updateStatsUI(): void {
        this.levelDisplay.textContent = this.stats.level.toString();
        this.xpCurrentDisplay.textContent = this.stats.currentXP.toString();
        this.xpNextDisplay.textContent = this.stats.xpToNextLevel.toString();

        const percentage = (this.stats.currentXP / this.stats.xpToNextLevel) * 100;
        this.xpBarFill.style.width = `${percentage}%`;
    }

    private render(): void {
        this.taskList.innerHTML = '';
        this.updateStatsUI();

        if (this.tasks.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';

            this.tasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;

                li.innerHTML = `
                    <div class="task-content">
                        <span class="task-text">${task.text}</span>
                        <small style="opacity: 0.6">(${task.priority.toUpperCase()})</small>
                    </div>
                    <div class="actions">
                        <button class="btn-complete" title="Complete Quest"><i class="fas fa-check"></i></button>
                        <button class="btn-delete" title="Abandon Quest"><i class="fas fa-trash"></i></button>
                    </div>
                `;

                // Add event listeners for buttons
                const completeBtn = li.querySelector('.btn-complete') as HTMLButtonElement;
                const deleteBtn = li.querySelector('.btn-delete') as HTMLButtonElement;

                completeBtn.onclick = () => this.completeTask(task.id);
                deleteBtn.onclick = () => this.deleteTask(task.id);

                this.taskList.appendChild(li);
            });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});