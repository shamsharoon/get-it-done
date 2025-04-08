document.addEventListener("DOMContentLoaded", function () {
  const elements = {
    container: document.getElementById("todoContainer"),
    header: document.getElementById("appHeader"),
    input: document.getElementById("newTodoInput"),
    addBtn: document.getElementById("addTodoBtn"),
    list: document.getElementById("todoList"),
    filterAllBtn: document.getElementById("filterAllBtn"),
    filterActiveBtn: document.getElementById("filterActiveBtn"),
    filterCompletedBtn: document.getElementById("filterCompletedBtn"),
    clearCompletedBtn: document.getElementById("clearCompletedBtn"),
    toggleAllBtn: document.getElementById("toggleAllBtn"),
    deleteAllBtn: document.getElementById("deleteAllBtn"),
    totalCount: document.getElementById("totalCount"),
    activeCount: document.getElementById("activeCount"),
    completedCount: document.getElementById("completedCount"),
  };

  const state = {
    todos: loadTodos(),
    filterType: loadFilterType(),
    filteredTodos: [],
    drag: {
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    },
  };

  function loadTodos() {
    return JSON.parse(localStorage.getItem("todos")) || [];
  }

  function loadFilterType() {
    return localStorage.getItem("filterType") || "all";
  }

  function saveTodosToLocal() {
    localStorage.setItem("todos", JSON.stringify(state.todos));
  }

  function saveFilterType() {
    localStorage.setItem("filterType", state.filterType);
  }

  function initialize() {
    setupEventListeners();
    applyFilter();
    updateCounters();
  }

  function setupEventListeners() {
    elements.input.addEventListener("keydown", handleInputKeydown);
    elements.addBtn.addEventListener("click", addTodo);

    elements.clearCompletedBtn.addEventListener("click", deleteCompleted);
    elements.toggleAllBtn.addEventListener("click", toggleAll);
    elements.deleteAllBtn.addEventListener("click", deleteAll);

    elements.filterAllBtn.addEventListener("click", () => setFilter("all"));
    elements.filterActiveBtn.addEventListener("click", () =>
      setFilter("active")
    );
    elements.filterCompletedBtn.addEventListener("click", () =>
      setFilter("completed")
    );

    // Drag functionality
    elements.header.addEventListener("mousedown", startDrag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("mousemove", drag);
  }

  function handleInputKeydown(e) {
    if (e.key === "Enter") addTodo();
  }

  function addTodo() {
    const title = elements.input.value.trim();
    if (!title) return;

    const newTodo = createTodoObject(title);
    addTodoToList(newTodo);

    elements.input.value = "";
    refreshUI();
    notifyUser("Task added successfully!");
  }

  function createTodoObject(title) {
    return {
      id: generateId(),
      title: title,
      completed: false,
      createdAt: getCurrentTimestamp(),
    };
  }

  function generateId() {
    return Date.now().toString();
  }

  function getCurrentTimestamp() {
    return new Date().toISOString();
  }

  function addTodoToList(todo) {
    state.todos = [todo, ...state.todos];
    saveTodosToLocal();
  }

  function editTodo(id) {
    const todo = findTodoById(id);
    if (!todo) return;

    const newTitle = prompt("Edit task:", currentTitle);
    if (isValidTitle(newTitle)) {
      updateTodoTitle(todo, newTitle);
      refreshUI();
    }
  }

  function findTodoById(id) {
    return state.todos.find((todo) => todo.id === id);
  }

  function isValidTitle(title) {
    return title !== null && title.trim() !== "";
  }

  function updateTodoTitle(todo, newTitle) {
    todo.title = newTitle.trim();
    todo.updatedAt = getCurrentTimestamp();
    saveTodosToLocal();
  }

  function deleteTodo(id) {
    if (confirmAction("Are you sure you want to delete this task?")) {
      removeTodoById(id);
      refreshUI();
      notifyUser("Task deleted!");
    }
  }

  function confirmAction(message) {
    return confirm(message);
  }

  function removeTodoById(id) {
    state.todos = state.todos.filter((todo) => todo.id !== id);
    saveTodosToLocal();
  }

  function toggleTodo(id) {
    const todo = findTodoById(id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodosToLocal();
      refreshUI();
    }
  }

  function deleteCompleted() {
    const completedCount = countCompletedTodos();

    if (completedCount === 0) {
      notifyUser("No completed tasks to delete!");
      return;
    }

    if (confirmAction(`Delete ${completedCount} completed tasks?`)) {
      removeCompletedTodos();
      refreshUI();
      notifyUser("Completed tasks deleted!");
    }
  }

  function countCompletedTodos() {
    return state.todos.filter((todo) => todo.completed).length;
  }

  function removeCompletedTodos() {
    state.todos = state.todos.filter((todo) => !todo.completed);
    saveTodosToLocal();
  }

  function deleteAll() {
    if (state.todos.length === 0) {
      notifyUser("No tasks to delete!");
      return;
    }

    if (confirmAction(`Delete all ${state.todos.length} tasks?`)) {
      clearAllTodos();
      refreshUI();
      notifyUser("All tasks deleted!");
    }
  }

  function clearAllTodos() {
    state.todos = [];
    saveTodosToLocal();
  }

  function toggleAll() {
    const allCompleted = checkIfAllCompleted();
    setAllTodosStatus(!allCompleted);

    refreshUI();
    notifyUser(
      allCompleted ? "All tasks marked as active" : "All tasks completed!"
    );
  }

  function checkIfAllCompleted() {
    return state.todos.every((todo) => todo.completed);
  }

  function setAllTodosStatus(completedStatus) {
    state.todos.forEach((todo) => (todo.completed = completedStatus));
    saveTodosToLocal();
  }

  function setFilter(type) {
    state.filterType = type;
    updateFilterButtonsUI();
    saveFilterType();
    applyFilter();
  }

  function updateFilterButtonsUI() {
    [
      elements.filterAllBtn,
      elements.filterActiveBtn,
      elements.filterCompletedBtn,
    ].forEach((btn) => {
      btn.classList.remove("activated");
    });

    // Add activated class to the appropriate button
    if (state.filterType === "all")
      elements.filterAllBtn.classList.add("activated");
    if (state.filterType === "active")
      elements.filterActiveBtn.classList.add("activated");
    if (state.filterType === "completed")
      elements.filterCompletedBtn.classList.add("activated");
  }

  function applyFilter() {
    switch (state.filterType) {
      case "all":
        state.filteredTodos = [...state.todos];
        break;
      case "active":
        state.filteredTodos = state.todos.filter((todo) => !todo.completed);
        break;
      case "completed":
        state.filteredTodos = state.todos.filter((todo) => todo.completed);
        break;
    }

    renderTodos();
    updateCounters();
  }

  function renderTodos() {
    elements.list.innerHTML = "";

    if (state.filteredTodos.length === 0) {
      renderEmptyState();
      return;
    }

    state.filteredTodos.forEach((todo) => {
      renderTodoItem(todo);
    });
  }

  function renderEmptyState() {
    const emptyItem = document.createElement("li");
    emptyItem.className = "not-found";
    emptyItem.innerHTML = "<p>No todos found.</p>";
    elements.list.appendChild(emptyItem);
  }

  function renderTodoItem(todo) {
    const li = createTodoItemElement(todo);
    elements.list.appendChild(li);
  }

  function createTodoItemElement(todo) {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;

    const checkbox = createCheckboxElement(todo);
    const titleSpan = createTitleElement(todo);
    const deleteBtn = createDeleteButtonElement(todo);

    li.appendChild(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(deleteBtn);

    return li;
  }

  function createCheckboxElement(todo) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));
    return checkbox;
  }

  function createTitleElement(todo) {
    const span = document.createElement("span");
    span.className = "todo-title";
    span.textContent = todo.title;
    span.addEventListener("click", () => editTodo(todo.id));
    return span;
  }

  function createDeleteButtonElement(todo) {
    const button = document.createElement("button");
    button.className = "delete-button";
    button.innerHTML = '<i class="fas fa-trash-alt"></i>';
    button.addEventListener("click", () => deleteTodo(todo.id));
    return button;
  }

  function updateCounters() {
    const counts = calculateCounts();

    elements.totalCount.textContent = counts.total;
    elements.activeCount.textContent = counts.active;
    elements.completedCount.textContent = counts.completed;
  }

  function calculateCounts() {
    return {
      active: state.todos.filter((todo) => !todo.completed).length,
      completed: state.todos.filter((todo) => todo.completed).length,
      total: state.todos.length,
    };
  }

  function refreshUI() {
    applyFilter(); // This will also trigger renderTodos() and updateCounters()
  }

  // --- DRAG FUNCTIONALITY ---
  function startDrag(event) {
    state.drag.isDragging = true;
    state.drag.startX = event.clientX - state.drag.currentX;
    state.drag.startY = event.clientY - state.drag.currentY;
    document.body.style.cursor = "grabbing";
  }

  function drag(event) {
    if (!state.drag.isDragging) return;

    updateDragPosition(event);
    applyBoundaryConstraints();
    updateContainerPosition();
  }

  function updateDragPosition(event) {
    state.drag.currentX = event.clientX - state.drag.startX;
    state.drag.currentY = event.clientY - state.drag.startY;
  }

  function applyBoundaryConstraints() {
    const bounds = calculateViewportBounds();

    state.drag.currentX = Math.max(
      bounds.left,
      Math.min(state.drag.currentX, bounds.right)
    );
    state.drag.currentY = Math.max(
      bounds.top,
      Math.min(state.drag.currentY, bounds.bottom)
    );
  }

  function calculateViewportBounds() {
    const container = elements.container;
    return {
      top: -container.offsetHeight / 2,
      bottom: window.innerHeight - container.offsetHeight / 2,
      left: -container.offsetWidth / 2,
      right: window.innerWidth - container.offsetWidth / 2,
    };
  }

  function updateContainerPosition() {
    elements.container.style.transform = `translate(${state.drag.currentX}px, ${state.drag.currentY}px)`;
  }

  function endDrag() {
    state.drag.isDragging = false;
    document.body.style.cursor = "default";
  }

  // --- NOTIFICATIONS ---
  function notifyUser(message) {
    const toast = getOrCreateToastElement();

    showToastMessage(toast, message);
    hideToastAfterDelay(toast);
  }

  function getOrCreateToastElement() {
    let toast = document.querySelector(".toast");

    if (!toast) {
      toast = createToastElement();
      addToastStyles();
    }

    return toast;
  }

  function createToastElement() {
    const toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
    return toast;
  }

  function addToastStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .toast.show {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  function showToastMessage(toast, message) {
    toast.textContent = message;
    toast.classList.add("show");
  }

  function hideToastAfterDelay(toast) {
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  initialize();
});
