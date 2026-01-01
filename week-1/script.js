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
const openAddTaskBtn = document.querySelector('#openAddTaskPopup');
const closeAddTaskBtn = document.querySelector('#closeAddTaskPopup');
const taskInput = document.querySelector('#taskName');

const toggleAddTaskPopup = (isOpen) => {
    addTaskPopup.style.display = isOpen ? 'flex' : 'none';
    document.body.classList.toggle('no-scroll', isOpen);

    if (isOpen) taskInput.focus();
};

openAddTaskBtn.addEventListener('click', () => toggleAddTaskPopup(true));
closeAddTaskBtn.addEventListener('click', () => toggleAddTaskPopup(false));


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
    toggleAddTaskPopup(false);
});


/* GÖREVLERİ LİSTELEME */

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

const SortOptions = Object.freeze({
    CREATED_DESC: 'created_desc', // Yeniden eskiye
    CREATED_ASC: 'created_asc',   // Eskiden yeniye
    UPDATED_DESC: 'updated_desc', // Son güncellenen en üstte
    UPDATED_ASC: 'updated_asc'    // İlk güncellenen en üstte
});

const tasksContainer = document.querySelector('#tasksContainer');

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const storage = {
    get: () => JSON.parse(localStorage.getItem('tasks') || '[]'),
    save: (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks))
};

const deleteTask = (id) => {
    const tasks = storage.get().filter(task => task.id !== id);
    storage.save(tasks);
    renderTasks();
};

const updateTask = (id, updatedData) => {
    const tasks = storage.get();
    const index = tasks.findIndex(t => t.id === id);

    if (index !== -1) {
        tasks[index] = {
            ...tasks[index],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };
        storage.save(tasks);
        renderTasks();
    }
};

const createTaskElement = (task) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.id = task.id;

    const statusColor = StatusColors[task.status] || StatusColors[TaskStatus.UNKNOWN];

    card.innerHTML = `
        <div class="row row-wrap">
            <div class="task-status-bar" style="background-color: ${statusColor}"></div>
            <div class="status-column">
                <select class="status-select">
                    ${Object.values(TaskStatus).map(s =>
        `<option value="${s}" ${task.status === s ? 'selected' : ''}>${s}</option>`
    ).join('')}
                </select>
                <p class="task-date">${formatDate(task.updatedAt)}</p>
            </div>
            <div class="task-status-divider" style="background-color: ${statusColor}"></div>
        </div>
        <p class="task-title"></p>
        <p class="task-date"><strong>Eklenme Zamanı</strong><br>${formatDate(task.createdAt)}</p>
        <div class="row task-buttons">
            <div class="circle-button mini-button edit-btn" aria-label="Düzenle">
                <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 20H21M3 20H4.67454C5.16373 20 5.40832 20 5.63849 19.9447C5.84256 19.8957 6.03765 19.8149 6.2166 19.7053C6.41843 19.5816 6.59138 19.4086 6.93729 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93726 16.0627C3.59136 16.4086 3.4184 16.5816 3.29472 16.7834C3.18506 16.9624 3.10425 17.1574 3.05526 17.3615C3 17.5917 3 17.8363 3 18.3255V20Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="circle-button mini-button delete-btn" aria-label="Sil">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E60808">
                    <path d="M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>
    `;

    card.querySelector('.task-title').textContent = task.title;

    card.querySelector('.status-select').addEventListener('change', (e) => updateTask(task.id, { status: e.target.value }));

    card.querySelector('.delete-btn').addEventListener('click', () => {
        toggleDeletePopup(true,task)
    });

    card.querySelector('.edit-btn').addEventListener('click', () => {
        toggleEditPopup(true, task);
    });

    return card;
};

let searchQuery = '';
const searchInput = document.querySelector('.search-input');
let currentFilters = [];
let currentSort = SortOptions.CREATED_DESC;

const taskListHeaderText = document.getElementById('taskListHeaderText');

const getProcessedTasks = () => {
    let tasks = storage.get();

    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        tasks = tasks.filter(task =>
            task.title.toLowerCase().includes(query)
        );
    }

    if (currentFilters.length > 0) {
        tasks = tasks.filter(task => currentFilters.includes(task.status));
    }

    tasks.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        const updateA = new Date(a.updatedAt);
        const updateB = new Date(b.updatedAt);

        switch (currentSort) {
            case SortOptions.CREATED_DESC: return dateB - dateA;
            case SortOptions.CREATED_ASC: return dateA - dateB;
            case SortOptions.UPDATED_DESC: return updateB - updateA;
            case SortOptions.UPDATED_ASC: return updateA - updateB;
            default: return 0;
        }
    });

    const totalItems = tasks.length;
    const totalPages = Math.ceil(totalItems / tasksPerPage);

    // Eğer filtreleme sonucu sayfa sayısı azalırsa mevcut sayfayı koru
    if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;

    const paginatedTasks = tasks.slice(startIndex, endIndex);

    return {
        tasks: paginatedTasks,
        totalPages,
        totalItems
    };
};

const renderTasks = () => {
    const { tasks, totalPages, totalItems } = getProcessedTasks();

    tasksContainer.innerHTML = '';

    if (currentFilters.length !== 0) {
        filterCounterText.innerText = `(${currentFilters.length})`;
    } else {
        filterCounterText.innerText = "";
    }

    if(searchQuery.length === 0) {
        taskListHeaderText.innerText = "Bütün Liste";
    } else {
        taskListHeaderText.innerText = `Arama Sonuçları (${tasks.length})`;
    }

    if (tasks.length === 0) {
        if(currentFilters.length !== 0) {
            tasksContainer.innerHTML = '<p class="empty-list">Filtrelere uygun görev bulunamadı</p>';

        } else {
            tasksContainer.innerHTML = '<p class="empty-list">Görev bulunamadı</p>';
        }
        return;
    }

    totalTask.innerHTML = totalItems.toString();
    shownTask.innerHTML = tasks.length.toString();

    const fragment = document.createDocumentFragment();
    tasks.forEach(task => {
        fragment.appendChild(createTaskElement(task));
    });

    tasksContainer.appendChild(fragment);

    renderPagination(totalPages);
};

document.addEventListener('DOMContentLoaded', renderTasks);


/// SIRALAMA - POPUP AÇMA KAPATMA

const sortPopup = document.querySelector('#sortPopup');
const openSortPopupBtn = document.querySelector('#openSortPopup');
const closeSortPopupBtn = document.querySelector('#closeSortPopup');

const toggleSortPopup = (isOpen) => {
    sortPopup.style.display = isOpen ? 'flex' : 'none';
    document.body.classList.toggle('no-scroll', isOpen);
    if(isOpen) {
        document.querySelector(`input[value="${currentSort}"]`).checked = true;
        sortPopup.classList.add('active');
    }
};

openSortPopupBtn.addEventListener('click', () => toggleSortPopup(true));
closeSortPopupBtn.addEventListener('click', () => toggleSortPopup(false));


document.querySelectorAll('input[name="sortOrder"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        renderTasks();
        setTimeout(() => toggleSortPopup(false), 200);
    });
});


/// FİLTRELEME - POPUP AÇMA KAPATMA

const filterPopup = document.querySelector('#filterPopup');
const openFilterPopupBtn = document.querySelector('#openFilterPopup');
const closeFilterPopupBtn = document.querySelector('#closeFilterPopup');

const toggleFilterPopup = (isOpen) => {
    filterPopup.style.display = isOpen ? 'flex' : 'none';
    document.body.classList.toggle('no-scroll', isOpen);
    if(isOpen) {
        document.querySelector(`input[value="${currentSort}"]`).checked = true;
        filterPopup.classList.add('active');
    }
};

openFilterPopupBtn.addEventListener('click', () => toggleFilterPopup(true));
closeFilterPopupBtn.addEventListener('click', () => toggleFilterPopup(false));

const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
const filterCounterText = document.getElementById('filterCounter');
filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        currentFilters = Array.from(filterCheckboxes)
            .filter(i => i.checked)
            .map(i => i.value);

        currentPage = 1;
        renderTasks();
    });
});


/* ARAMA FİLTRESİ */

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    renderTasks();
});

const searchBtn = document.getElementById('searchButton');
searchBtn.addEventListener('click', () => renderTasks());


/* SİLME POPUP */

const deletePopup = document.querySelector('#deletePopup');
const closeDeletePopupBtn = document.querySelector('#closeDeletePopup');
const deletePopupTask = document.querySelector('#deletePopupTask');

let taskIdToDelete = null;
const confirmDeleteBtn = document.querySelector('#deletePopup .add-form-button.orange');

const toggleDeletePopup = (isOpen, task = null) => {
    deletePopup.style.display = isOpen ? 'flex' : 'none';
    document.body.classList.toggle('no-scroll', isOpen);

    if (isOpen && task) {
        deletePopupTask.textContent = task.title;
        taskIdToDelete = task.id;
        deletePopup.classList.add('active');
    } else {
        taskIdToDelete = null;
        deletePopup.classList.remove('active');
    }
};

confirmDeleteBtn.addEventListener('click', () => {
    if (taskIdToDelete) {
        deleteTask(taskIdToDelete);
        toggleDeletePopup(false);
    }
});
closeDeletePopupBtn.addEventListener('click', () => toggleDeletePopup(false));


/* DÜZENLEME POPUP İŞLEMLERİ */

let taskIdToEdit = null;

const editTaskPopup = document.querySelector('#editTaskPopup');
const editTaskInput = document.querySelector('#oldTaskName');
const editTaskForm = document.querySelector('#editTaskForm');
const closeEditPopupBtn = document.querySelector('#closeEditTaskPopup');
const toggleEditPopup = (isOpen, task = null) => {
    editTaskPopup.style.display = isOpen ? 'flex' : 'none';
    document.body.classList.toggle('no-scroll', isOpen);

    if (isOpen && task) {
        taskIdToEdit = task.id;
        editTaskInput.value = task.title;
        editTaskPopup.classList.add('active');

        setTimeout(() => editTaskInput.focus(), 100);
    } else {
        taskIdToEdit = null;
        editTaskPopup.classList.remove('active');
    }
};

closeEditPopupBtn.addEventListener('click', () => toggleEditPopup(false));

editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTitle = editTaskInput.value.trim();

    if (newTitle && taskIdToEdit) {
        updateTask(taskIdToEdit, { title: newTitle });
        toggleEditPopup(false);
    }
});


/* GENEL POPUP KAPATMA İŞLEMLERİ */

const popups = [
    { element: addTaskPopup, toggle: toggleAddTaskPopup },
    { element: sortPopup, toggle: toggleSortPopup },
    { element: filterPopup, toggle: toggleFilterPopup },
    { element: deletePopup, toggle: toggleDeletePopup },
    { element: editTaskPopup, toggle: toggleEditPopup }
];

window.addEventListener('click', (e) => {
    const targetPopup = popups.find(p => p.element === e.target);
    if (targetPopup) targetPopup.toggle(false);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activePopup = popups.find(p => p.element.style.display === 'flex');
        if (activePopup) activePopup.toggle(false);
    }
});

/* PAGINATION */

let currentPage = 1;
const tasksPerPage = 10;
const totalTask = document.querySelector('#totalTask');
const shownTask = document.querySelector('#shownTask');

const renderPagination = (totalPages) => {
    const paginationContainer = document.querySelector('#paginationContainer');
    paginationContainer.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = `
        <svg class="page-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
        </svg>
    `;

    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
            window.scrollTo(0, 0);
        }
    };

    const pageInfo = document.createElement('div');
    pageInfo.className = 'page-info';
    pageInfo.innerHTML = `<span>Sayfa ${currentPage} / ${totalPages}</span>`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = `
        <svg class="page-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
        </svg>
    `;
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTasks();
            window.scrollTo(0, 0);
        }
    };

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);
};


/* DİĞER */

document.getElementById('helpButton').addEventListener('click', () => window.open("https://github.com/zahidayturan", '_blank'));