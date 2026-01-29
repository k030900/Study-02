const todoInput = document.getElementById('todoInput');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

const CATEGORY_LABELS = {
    work: '업무',
    personal: '개인',
    study: '공부'
};

let todos = [];

// --- localStorage ---

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const data = localStorage.getItem('todos');
    if (data) {
        todos = JSON.parse(data);
    }
}

// --- CRUD ---

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    todos.push({
        id: Date.now(),
        text: text,
        category: categorySelect.value,
        completed: false
    });

    saveTodos();
    render();
    todoInput.value = '';
    todoInput.focus();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    render();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        render();
    }
}

function updateTodoText(id, newText) {
    const todo = todos.find(t => t.id === id);
    if (todo && newText.trim()) {
        todo.text = newText.trim();
        saveTodos();
        render();
    } else {
        render();
    }
}

// --- 인라인 수정 ---

function startEdit(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const li = document.querySelector(`[data-id="${id}"]`);
    const textSpan = li.querySelector('.todo-text');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = todo.text;

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            updateTodoText(id, this.value);
        } else if (e.key === 'Escape') {
            render();
        }
    });

    input.addEventListener('blur', function () {
        updateTodoText(id, this.value);
    });

    textSpan.replaceWith(input);
    input.focus();
    input.select();
}

// --- 렌더링 ---

function render() {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item category-${todo.category}`;
        li.dataset.id = todo.id;
        if (todo.completed) li.classList.add('completed');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const content = document.createElement('div');
        content.className = 'todo-content';

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;
        span.addEventListener('click', () => startEdit(todo.id));

        const badge = document.createElement('span');
        badge.className = `category-badge badge-${todo.category}`;
        badge.textContent = CATEGORY_LABELS[todo.category];

        content.appendChild(span);
        content.appendChild(badge);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(content);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });

    updateProgress();
}

function updateProgress() {
    const total = todos.length;
    const done = todos.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    progressFill.style.width = percent + '%';
    progressText.textContent = `${done} / ${total} 완료`;
}

// --- 이벤트 ---

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// --- 초기화 ---

loadTodos();
render();
