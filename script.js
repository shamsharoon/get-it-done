// TODO: 1. Fix the drag and drop feature to make it more like sticky notes.
// TODO  2. Add a feature to delete all completed tasks.
// TODO  3. Add a feature to edit a task.
// TODO  4. Add a feature to filter tasks by active, completed, and all.
// TODO  5. Add a feature to show the number of active, completed, and all tasks.

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
                alert('Todo item should be a maximum of 15 words.');
                return;
            }
            this.todos.push({ title: this.newTodo, completed: false });
            this.saveTodos();
            this.newTodo = '';
        },
        editTodo(index) {
            let newTitle = prompt('Edit task:', this.todos[index].title);
            if (newTitle !== null) {
                this.todos[index].title = newTitle;
                this.saveTodos();
            }
        },
        deleteTodo(index) {
            this.todos.splice(index, 1);
            this.saveTodos();
        },
        // ! This function is not working as expected.
        filter(type) {
            switch (type) {
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
        // ! This function is not working as expected.
        onDragStart(event) {
            this.isDragging = true;
            this.initialX = event.clientX - this.offsetX;
            this.initialY = event.clientY - this.offsetY;
        },
        // ! This function is not working as expected.
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
        // ! This function is not working as expected.
        onDragEnd() {
            this.isDragging = false;
        },
        saveTodos() {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        }
    };
}
