// Todo class representing a todo
class Todo {
    // tracks the number of todos present in the list currently
    static numberOfTodos = 0;
    constructor(task, id = this.constructor.numberOfTodos, isDone = false) {
        this.task = task;
        this.id = id;
        this.isDone = isDone;

        this.constructor.numberOfTodos++;
    }
}

// UI class for handling the UI
class UI {
    // Display List
    static displayList() {
        // get previous todos
        const todoList = Store.getTodos();

        // reset ids of previous todo
        todoList.forEach((todo) => {
            todo.id = Todo.numberOfTodos++;
        });

        todoList.forEach((todo) => {
            UI.addTodoToList(todo)
        });
    }

    // adds new todo list item to the list
    static addTodoToList(todo) {
        // 1. Creates an LI 
        const todoLI = document.createElement('li');
        todoLI.className = `
                        todo-list-item list-group-item rounded-lg mb-3
                        d-flex align-items-center justify-content-between
                        animate__animated animate__fadeInDown
                    `
        // set todoLI id to todo id for easy deletion from storage
        todoLI.id = `${todo.id}`
        // 2. Creates a span for task text in LI
        const todoText = document.createElement('span');
        todoText.className = "todo-list-task lead";
        todoText.innerText = todo.task;

        // add task to LI
        todoLI.appendChild(todoText);

        // 3. Creates controls (mark done and remove) for LI
        const controls = UI.createControls(todo.id);

        todoLI.appendChild(controls);

        // check before adding if its done
        UI.markDone(todoLI, todo.isDone);

        // add TodoLI to list
        document.querySelector('#todo-list').prepend(todoLI);
    }

    // removes a new todo list item from the list
    static removeTodoFromList(todoLI) {
        // add fading animation before removing 
        todoLI.classList.add('animate__fadeOutDown');

        // after animation complete - remove list item
        todoLI.addEventListener('animationend', (e) => {
            todoLI.remove()
        });
    }

    // marks a todo list item done in the list
    static markDone(todoLI, isDone) {
        if (isDone === true) {
            // add success class to whole list item
            todoLI.classList.add('list-group-item-success');
            // add line through to only the text inside list item
            todoLI.firstElementChild.style.textDecoration = "line-through";
            todoLI.lastElementChild.firstElementChild.firstElementChild.checked = true;
        }
        else {
            todoLI.classList.remove('list-group-item-success');
            todoLI.firstElementChild.style.textDecoration = "none";
            todoLI.lastElementChild.firstElementChild.firstElementChild.checked = false;
        }
    }

    // create controls buttons, needs a uniqueID to associate each control with a unique label
    static createControls(uniqueID) {
        const controls = document.createElement('div');
        controls.className = "controls"
        // creates checkbox for mark done
        const markDone = document.createElement('div');
        markDone.className = "custom-control d-inline custom-checkbox";
        markDone.innerHTML = `
                                <input type="checkbox" class="custom-control-input done-checkbox" name="done-btn" id="done-${uniqueID}">
                                <label class="custom-control-label done-label" for="done-${uniqueID}""></label>
                            `
        controls.appendChild(markDone);
        // create button for removing
        const removeBtn = document.createElement('span');
        removeBtn.className = "remove-btn material-icons text-danger";
        removeBtn.innerText = "remove_circle_outline";
        controls.appendChild(removeBtn);

        return controls;
    }

    static clearFormFields() {
        document.querySelector('#task-input').value = "";
    }
}

// Storage class for persistance storage of todo list
class Store {
    // get existing todos in storage
    static getTodos() {
        let todoList;
        if (localStorage.getItem('todoList') === null) {
            todoList = [];
        }
        else {
            todoList = JSON.parse(localStorage.getItem('todoList'));
        }
        return todoList;
    }

    // add todos to storage
    static addTodo(todo) {
        let todoList = Store.getTodos();
        todoList.push(todo);
        localStorage.setItem('todoList', JSON.stringify(todoList));
    }

    static removeTodo(todoID) {
        let todoList = Store.getTodos();
        // loop through todoList checking for target todo
        todoList.forEach((todo, index) => {
            if (todo.id == todoID) {
                todoList.splice(index, 1);
            }
        });
        // store the new todoList
        localStorage.setItem('todoList', JSON.stringify(todoList));
    }

    static markDone(todoID, isDone) {
        let todoList = Store.getTodos();
        // loop through todoList checking for target todo
        todoList.forEach((todo, index) => {
            if (todo.id == todoID) {
                todo.isDone = isDone;
            }
        });
        // store the new todoList
        localStorage.setItem('todoList', JSON.stringify(todoList));
    }
}

// Event: page opened, add previous tasks to TodoList
document.addEventListener('DOMContentLoaded', UI.displayList);


// Event: add a todo when form submitted
const todoForm = document.querySelector('#todo-form');
todoForm.addEventListener('submit', (e) => {
    // prevents the form from submitting
    e.preventDefault();

    // do validation
    if(todoForm.checkValidity() === false) {
        todoForm.classList.add('was-validated');
        return;
    }

    // get todo task input value
    const todoTask = document.querySelector('#task-input').value;

    // create a new todo
    const newTodo = new Todo(todoTask);

    // add todo to UI
    UI.addTodoToList(newTodo);

    // add todo to storage
    Store.addTodo(newTodo);

    UI.clearFormFields();
});

// Event: task complete
// adding event on whole todo list and using event propagation to determine target
document.querySelector('#todo-list').addEventListener('click', (e) => {
    // if target of event is other than mark done checkbox then do nothing
    if (!e.target.classList.contains('done-checkbox'))
        return;
    
    const doneCheckbox = e.target;
    // associated LI with doneCheckbox
    const todoLI = doneCheckbox.parentElement.parentElement.parentElement;
    
    // mark todo done in UI
    UI.markDone(todoLI, doneCheckbox.checked);

    // mark todo done in Storage
    Store.markDone(todoLI.id, doneCheckbox.checked);
});


// Event: remove a todo
// adding event on whole todo list and using event propagation to determine target
document.querySelector('#todo-list').addEventListener('click', (e) => {
    // if target of event is other than remove button then do nothing
    if (!e.target.classList.contains('remove-btn'))
        return;

    const removeBtn = e.target;
    const todoLI = removeBtn.parentElement.parentElement;

    // remove todo list item from UI
    UI.removeTodoFromList(todoLI);

    // remove todo list item from storage
    Store.removeTodo(todoLI.id);

    // Decrement total number of todos
    Todo.numberOfTodos--;
});
