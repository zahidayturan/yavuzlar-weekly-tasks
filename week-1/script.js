/// TEMA DEĞİŞTİRME

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById("themeButton");
    const themeIcons = document.querySelectorAll(".icon");
    const currentTheme = localStorage.getItem("theme");
    
    if (currentTheme === "dark") {
        setDarkMode();
    } else {
        setLightMode();
    }

    btn.addEventListener("click", function () {
        const isDark = document.documentElement.getAttribute("theme") === "dark";
        if (isDark) {
            setLightMode();
        } else {
            setDarkMode();
        }
    });

    function setDarkMode() {
        document.documentElement.setAttribute("theme", "dark");
        localStorage.setItem("theme", "dark");

        themeIcons.forEach((icon) => {
            icon.src = icon.getAttribute("src-light");
        });
    }

    function setLightMode() {
        document.documentElement.removeAttribute("theme");
        localStorage.setItem("theme", "light");

        themeIcons.forEach((icon) => {
            icon.src = icon.getAttribute("src-dark");
        });
    }
});

/// GÖREV EKLEME POPUP AÇMA KAPATMA

const addTaskPopup = document.querySelector('#addTaskPopup');
const openBtn = document.querySelector('#openAddTaskPopup');
const closeBtn = document.querySelector('#closeAddTaskPopup');
const taskInput = document.querySelector('#taskName');

const togglePopup = (isOpen) => {
    addTaskPopup.style.display = isOpen ? 'flex' : 'none';
    document.body.classList.toggle('no-scroll', isOpen);

    if (isOpen) taskInput.focus();
};

openBtn.addEventListener('click', () => togglePopup(true));
closeBtn.addEventListener('click', () => togglePopup(false));

window.addEventListener('click', (e) => {
    if (e.target === addTaskPopup) togglePopup(false);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addTaskPopup.style.display === 'flex') {
        togglePopup(false);
    }
});

/// FORM İLE GÖREV EKLEME İŞLEMLERİ

const taskForm = document.querySelector('#addTaskForm');

const getTasksFromStorage = () => JSON.parse(localStorage.getItem('tasks') || '[]');
const saveTasksToStorage = (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks));

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskNameInput = document.querySelector('#taskName');
    const taskName = taskNameInput.value.trim();

    if (!taskName) return;

    const newTask = {
        id: crypto.randomUUID(),
        title: taskName,
        status: TaskStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const allTasks = getTasksFromStorage();
    allTasks.push(newTask);
    saveTasksToStorage(allTasks);

    taskNameInput.value = '';
    renderTasks();
    togglePopup(false);
});


/* GÖREVLERİ LİSTELEME */
const tasksContainer = document.querySelector('#tasksContainer');

const renderTasks = () => {
    const tasks = getTasksFromStorage();

    tasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p class="empty-list">Henüz bir görev eklenmemiş.</p>';
        return;
    }

    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card`;
        taskCard.dataset.id = task.id;

        const dateOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        const createdDate = new Date(task.createdAt).toLocaleString('tr-TR', dateOptions);
        const updatedDate = new Date(task.updatedAt).toLocaleString('tr-TR', dateOptions);

        taskCard.innerHTML = `
            <div class="row row-wrap">
                <div class="task-status-bar" style="background-color: ${StatusColors[task.status] || '#ccc'}"></div>
                
                <div class="status-column">
                    <select class="status-select">
                        ${Object.values(TaskStatus).map(status =>
                            `<option value="${status}" ${task.status === status ? 'selected' : ''}>${status}</option>`
                        ).join('')}
                    </select>
                    <p class="task-date">${updatedDate}</p>
                </div>
                
                <div class="task-status-divider" style="background-color: ${StatusColors[task.status] || '#ccc'}"></div>
            </div>
            
            <p class="task-title"></p>
            
            <p class="task-date"><strong>Eklenme Zamanı</strong><br>${createdDate}</p>
            
            <div class="row task-buttons">
                <div class="circle-button mini-button edit-btn">
                    <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 20H21M3 20H4.67454C5.16373 20 5.40832 20 5.63849 19.9447C5.84256 19.8957 6.03765 19.8149 6.2166 19.7053C6.41843 19.5816 6.59138 19.4086 6.93729 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93726 16.0627C3.59136 16.4086 3.4184 16.5816 3.29472 16.7834C3.18506 16.9624 3.10425 17.1574 3.05526 17.3615C3 17.5917 3 17.8363 3 18.3255V20Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            
                <div class="circle-button mini-button delete-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6" stroke="#E60808" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            
            </div>
        `;

        taskCard.querySelector('.task-title').textContent = task.title;

        taskCard.querySelector('.status-select').addEventListener('change', (e) => {
            updateTask(task.id, { status: e.target.value });
            renderTasks();
        });

        taskCard.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                deleteTask(task.id);
                renderTasks();
            }
        });

        taskCard.querySelector('.edit-btn').addEventListener('click', () => {
            const newTitle = prompt('Görevi düzenle:', task.title);
            if (newTitle && newTitle.trim() !== '') {
                updateTask(task.id, { title: newTitle.trim() });
                renderTasks();
            }
        });

        tasksContainer.appendChild(taskCard);
    });
};

document.addEventListener('DOMContentLoaded', renderTasks);


const deleteTask = (id) => {
    const tasks = getTasksFromStorage();
    const filteredTasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage(filteredTasks);
};

const updateTask = (id, updatedData) => {
    const tasks = getTasksFromStorage();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex !== -1) {
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };
        saveTasksToStorage(tasks);
    }
};

const TaskStatus = Object.freeze({
    PENDING: 'Bekliyor',
    IN_PROGRESS: 'İşlemde',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi',
    UNKNOWN: 'Bilinmiyor'
});

const StatusColors = {
    [TaskStatus.PENDING]: '#C5C800',
    [TaskStatus.IN_PROGRESS]: '#006695',
    [TaskStatus.COMPLETED]: '#00952F',
    [TaskStatus.CANCELLED]: '#E60808',
    [TaskStatus.UNKNOWN]: '#CCC',
};