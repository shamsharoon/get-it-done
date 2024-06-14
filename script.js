function todoList() {
    let savedTodos = JSON.parse(localStorage.getItem('todos')) || [];

    return {
        newTodo: '',
        todos: savedTodos,
        filteredTodos: savedTodos,
        isDragging: false,
        initialX: 0,
        initialY: 0,
        offsetX: 0,
        offsetY: 0,
        containerStyle: { top: '0px', left: '0px' },
        addTodo() {
            if (this.newTodo.trim() === '') return;
            if (this.newTodo.split(' ').length > 5) {
                alert('Todo item should be a maximum of 5 words.');
                return;
            }
            this.todos.push({ title: this.newTodo, completed: false });
            this.saveTodos();
            this.newTodo = '';
            this.applyFilter();
        },
        editTodo(index) {
            let newTitle = prompt('Edit task:', this.todos[index].title);
            if (newTitle !== null) {
                this.todos[index].title = newTitle;
                this.saveTodos();
            }
        },
        deleteTodo(todo) {
            this.todos = this.todos.filter(item => item !== todo);
            this.saveTodos();
            this.filteredTodos = this.filteredTodos.filter(item => item !== todo); // Update filteredTodos
        },
        deleteCompleted() {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.filteredTodos = this.filteredTodos.filter(todo => !todo.completed); // Update filteredTodos after deleting completed todos
        },
        deleteAll() {
            this.todos = [];
            this.saveTodos();
            this.filteredTodos = [];
        },
        toggleAll() {
            let allCompleted = this.todos.every(todo => todo.completed);
            this.todos.forEach(todo => (todo.completed = !allCompleted));
            this.saveTodos();
        },
        clearCompleted() {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
        },
        applyFilter() {
            switch (this.filterType) {
                case 'all':
                    this.filteredTodos = this.todos;
                    break;
                case 'active':
                    this.filteredTodos = this.todos.filter(todo => !todo.completed);
                    break;
                case 'completed':
                    this.filteredTodos = this.todos.filter(todo => todo.completed);
                    break;
            }
        },
        filter(type) {
            this.filterType = type;
            this.applyFilter(); // Update filteredTodos when filter changes
        },
        onDragStart(event) {
            this.isDragging = true;
            this.initialX = event.clientX - this.offsetX;
            this.initialY = event.clientY - this.offsetY;
        },
        onDrag(event) {
            if (this.isDragging) {
                this.offsetX = event.clientX - this.initialX;
                this.offsetY = event.clientY - this.initialY;
                this.containerStyle = {
                    top: this.offsetY + 'px',
                    left: this.offsetX + 'px'
                };
            }
        },
        onDragEnd() {
            this.isDragging = false;
        },
        saveTodos() {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        },
        get activeCount() {
            return this.todos.filter(todo => !todo.completed).length;
        },
        get completedCount() {
            return this.todos.filter(todo => todo.completed).length;
        },
        get totalCount() {
            return this.todos.length;
        }
    };
}
