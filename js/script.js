class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || []
    this.currentFilter = "all"
    this.init()
  }

  init() {
    this.bindEvents()
    this.render()
    this.setMinDate()
  }

  bindEvents() {
    // Form submission
    document.getElementById("todoForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTodo()
    })

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setFilter(e.target.dataset.filter)
      })
    })

    // Real-time validation
    document.getElementById("todoInput").addEventListener("input", () => {
      this.validateTodoInput()
    })

    document.getElementById("dateInput").addEventListener("change", () => {
      this.validateDateInput()
    })
  }

  setMinDate() {
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("dateInput").setAttribute("min", today)
  }

  validateTodoInput() {
    const input = document.getElementById("todoInput")
    const error = document.getElementById("todoError")
    const value = input.value.trim()

    if (value.length === 0) {
      this.showError(error, "Task description is required")
      return false
    } else if (value.length < 3) {
      this.showError(error, "Task must be at least 3 characters long")
      return false
    } else if (value.length > 100) {
      this.showError(error, "Task must be less than 100 characters")
      return false
    } else {
      this.hideError(error)
      return true
    }
  }

  validateDateInput() {
    const input = document.getElementById("dateInput")
    const error = document.getElementById("dateError")
    const value = input.value
    const today = new Date().toISOString().split("T")[0]

    if (!value) {
      this.showError(error, "Due date is required")
      return false
    } else if (value < today) {
      this.showError(error, "Due date cannot be in the past")
      return false
    } else {
      this.hideError(error)
      return true
    }
  }

  showError(errorElement, message) {
    errorElement.textContent = message
    errorElement.classList.add("show")
  }

  hideError(errorElement) {
    errorElement.textContent = ""
    errorElement.classList.remove("show")
  }

  addTodo() {
    const todoInput = document.getElementById("todoInput")
    const dateInput = document.getElementById("dateInput")

    // Validate inputs
    const isTodoValid = this.validateTodoInput()
    const isDateValid = this.validateDateInput()

    if (!isTodoValid || !isDateValid) {
      return
    }

    const todo = {
      id: Date.now(),
      text: todoInput.value.trim(),
      date: dateInput.value,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.todos.unshift(todo)
    this.saveTodos()
    this.render()

    // Reset form with animation
    todoInput.value = ""
    dateInput.value = ""

    // Add success feedback
    this.showSuccessMessage("Task added successfully!")
  }

  showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement("div")
    successDiv.textContent = message
    successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `

    document.body.appendChild(successDiv)

    setTimeout(() => {
      successDiv.style.animation = "slideOut 0.3s ease-out forwards"
      setTimeout(() => {
        document.body.removeChild(successDiv)
      }, 300)
    }, 2000)
  }

  deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`)

    if (todoElement) {
      todoElement.classList.add("removing")

      setTimeout(() => {
        this.todos = this.todos.filter((todo) => todo.id !== id)
        this.saveTodos()
        this.render()
      }, 500)
    }
  }

  toggleTodo(id) {
    const todo = this.todos.find((todo) => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
      this.saveTodos()
      this.render()
    }
  }

  setFilter(filter) {
    this.currentFilter = filter

    // Update active filter button
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active")

    this.render()
  }

  getFilteredTodos() {
    switch (this.currentFilter) {
      case "completed":
        return this.todos.filter((todo) => todo.completed)
      case "pending":
        return this.todos.filter((todo) => !todo.completed)
      default:
        return this.todos
    }
  }

  isOverdue(dateString) {
    const today = new Date()
    const dueDate = new Date(dateString)
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      return "Today"
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  render() {
    const todoList = document.getElementById("todoList")
    const emptyState = document.getElementById("emptyState")
    const totalTasks = document.getElementById("totalTasks")

    const filteredTodos = this.getFilteredTodos()

    // Update stats
    const completedCount = this.todos.filter((todo) => todo.completed).length
    const totalCount = this.todos.length
    totalTasks.textContent = `${totalCount} task${totalCount !== 1 ? "s" : ""} (${completedCount} completed)`

    if (filteredTodos.length === 0) {
      todoList.innerHTML = ""
      emptyState.classList.add("show")
      return
    }

    emptyState.classList.remove("show")

    todoList.innerHTML = filteredTodos
      .map((todo) => {
        const isOverdue = !todo.completed && this.isOverdue(todo.date)

        return `
                <div class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}">
                    <div class="todo-checkbox ${todo.completed ? "checked" : ""}" onclick="app.toggleTodo(${todo.id})">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="todo-content">
                        <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                        <div class="todo-date ${isOverdue ? "overdue" : ""}">
                            <i class="fas fa-calendar-alt"></i>
                            ${this.formatDate(todo.date)}
                            ${isOverdue ? "(Overdue)" : ""}
                        </div>
                    </div>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `
      })
      .join("")
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  saveTodos() {
    localStorage.setItem("todos", JSON.stringify(this.todos))
  }
}

// Initialize the app
const app = new TodoApp()

// Add some keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to add todo
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault()
    document.getElementById("todoForm").dispatchEvent(new Event("submit"))
  }

  // Escape to clear form
  if (e.key === "Escape") {
    document.getElementById("todoInput").value = ""
    document.getElementById("dateInput").value = ""
    document.getElementById("todoInput").focus()
  }
})

// Add smooth scrolling for better UX
document.addEventListener("DOMContentLoaded", () => {
  // Focus on todo input when page loads
  document.getElementById("todoInput").focus()

  // Add loading animation
  document.body.style.opacity = "0"
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease-out"
    document.body.style.opacity = "1"
  }, 100)
})
