document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const titleInput = document.getElementById('task-title');
  const deadlineInput = document.getElementById('task-deadline');
  const categorySelect = document.getElementById('task-category');
  const tasksList = document.getElementById('tasks');

  const searchInput = document.getElementById('search-input');
  const filterSelect = document.getElementById('filter-select');
  const sortBtn = document.getElementById('sort-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  const totalCount = document.getElementById('total-count');
  const pendingCount = document.getElementById('pending-count');
  const completedCount = document.getElementById('completed-count');

  const confirmModal = document.getElementById('confirm-modal');
  const confirmMessage = document.getElementById('modal-message');
  const confirmBtn = document.getElementById('modal-confirm');
  const cancelBtn = document.getElementById('modal-cancel');

  const editModal = document.getElementById('edit-modal');
  const editForm = document.getElementById('edit-form');
  const editTitleInput = document.getElementById('edit-title');
  const editDeadlineInput = document.getElementById('edit-deadline');
  const editCategorySelect = document.getElementById('edit-category');
  const editCancelBtn = document.getElementById('edit-cancel');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let sortAscending = true;
  let pendingAction = null;
  let currentEditId = null;

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const showConfirmation = (message, action) => {
    confirmMessage.textContent = message;
    pendingAction = action;
    confirmModal.classList.remove('hidden');
  };
  confirmBtn.addEventListener('click', () => {
    if (pendingAction) pendingAction();
    confirmModal.classList.add('hidden');
    pendingAction = null;
  });
  cancelBtn.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
    pendingAction = null;
  });

  const openEditModal = (task) => {
    currentEditId = task.id;
    editTitleInput.value = task.title;
    editDeadlineInput.value = task.deadline;
    editCategorySelect.value = task.category;
    editModal.classList.remove('hidden');
  };
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const task = tasks.find(t => t.id === currentEditId);
    if (task) {
      task.title = editTitleInput.value.trim();
      task.deadline = editDeadlineInput.value;
      task.category = editCategorySelect.value;
      saveTasks();
      renderTasks();
    }
    editModal.classList.add('hidden');
  });
  editCancelBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
  });

  const updateStatistics = () => {
    totalCount.textContent = tasks.length;
    pendingCount.textContent = tasks.filter(t => !t.completed).length;
    completedCount.textContent = tasks.filter(t => t.completed).length;
  };

  const renderTasks = () => {
    let displayList = [...tasks];

    if (filterSelect.value === 'pending') {
      displayList = displayList.filter(t => !t.completed);
    } else if (filterSelect.value === 'completed') {
      displayList = displayList.filter(t => t.completed);
    }

    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      displayList = displayList.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    displayList.sort((a, b) => {
      const dateA = new Date(a.deadline);
      const dateB = new Date(b.deadline);
      return sortAscending ? dateA - dateB : dateB - dateA;
    });

    tasksList.innerHTML = '';
    displayList.forEach(task => {
      const li = document.createElement('li');
      const itemDiv = document.createElement('div');
      itemDiv.className = 'task-item';
      if (task.completed) itemDiv.classList.add('completed');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => {
        const newState = checkbox.checked;
        checkbox.checked = !newState;
        showConfirmation(
          `${newState ? 'Mark' : 'Unmark'} task "${task.title}"?`,
          () => {
            task.completed = newState;
            saveTasks();
            renderTasks();
          }
        );
      });

      const label = document.createElement('label');
      label.textContent = `${task.title} [${task.category}] - ${task.deadline}`;

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = '✎';
      editBtn.addEventListener('click', () => openEditModal(task));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✖';
      deleteBtn.addEventListener('click', () => {
        showConfirmation(
          `Delete task "${task.title}"?`,
          () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
          }
        );
      });

      itemDiv.append(checkbox, label);
      li.append(itemDiv, editBtn, deleteBtn);
      tasksList.appendChild(li);
    });

    updateStatistics();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const deadline = deadlineInput.value;
    const category = categorySelect.value;
    if (!title || !deadline || !category) return;
    tasks.push({
      id: Date.now(),
      title,
      deadline,
      category,
      completed: false
    });
    saveTasks();
    form.reset();
    renderTasks();
  });

  filterSelect.addEventListener('change', renderTasks);
  searchInput.addEventListener('input', renderTasks);
  sortBtn.addEventListener('click', () => {
    sortAscending = !sortAscending;
    sortBtn.textContent = `Sort by Deadline ${sortAscending ? '(Asc)' : '(Desc)'}`;
    renderTasks();
  });
  clearCompletedBtn.addEventListener('click', () => {
    showConfirmation(
      'Delete all completed tasks?',
      () => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
      }
    );
  });

  renderTasks();
});