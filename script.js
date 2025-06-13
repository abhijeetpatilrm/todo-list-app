const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const errorMessage = document.getElementById("error-message");
const prioritySelect = document.getElementById("priority-select");
const filterTasksSelect = document.getElementById("filter-tasks");
const sortTasksSelect = document.getElementById("sort-tasks");

let theme = "light-mode";

function addTask() {
  errorMessage.textContent = ""; // Clear previous error message

  if (inputBox.value.trim() === "") {
    errorMessage.textContent = "You must write something!";
  } else {
    const li = createTaskElement(inputBox.value, prioritySelect.value);
    listContainer.appendChild(li);
    saveData();
  }

  inputBox.value = "";
}

function createTaskElement(taskText, priority) {
  const li = document.createElement("li");
  li.setAttribute("role", "listitem");
  li.setAttribute("data-priority", priority);
  li.innerHTML = taskText;

  const deleteSpan = document.createElement("span");
  deleteSpan.innerHTML = "\u00d7";
  deleteSpan.classList.add("delete");
  li.appendChild(deleteSpan);

  const editSpan = document.createElement("span");
  editSpan.innerHTML = "✏️";
  editSpan.classList.add("edit");
  li.appendChild(editSpan);

  li.setAttribute("draggable", true); // Enable drag-and-drop
  li.addEventListener("dragstart", handleDragStart);
  li.addEventListener("dragover", handleDragOver);
  li.addEventListener("drop", handleDrop);

  return li;
}

listContainer.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    saveData();
  } else if (e.target.classList.contains("delete")) {
    e.target.parentElement.remove();
    saveData();
  } else if (e.target.classList.contains("edit")) {
    editTask(e.target.parentElement);
  }
});

function editTask(li) {
  const updatedText = prompt("Edit your task:", li.firstChild.textContent);
  if (updatedText !== null) {
    li.firstChild.textContent = updatedText;
    saveData();
  }
}

function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTasks() {
  listContainer.innerHTML = localStorage.getItem("data");
}

function clearTasks() {
  if (confirm("Are you sure you want to clear all tasks?")) {
    localStorage.clear();
    listContainer.innerHTML = "";
  }
}

function toggleTheme() {
  if (theme === "light-mode") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    theme = "dark-mode";
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
    theme = "light-mode";
  }
}

function filterTasks() {
  const filter = filterTasksSelect.value;
  const tasks = listContainer.querySelectorAll("li");

  tasks.forEach((task) => {
    switch (filter) {
      case "completed":
        task.style.display = task.classList.contains("checked")
          ? "block"
          : "none";
        break;
      case "pending":
        task.style.display = task.classList.contains("checked")
          ? "none"
          : "block";
        break;
      default:
        task.style.display = "block";
        break;
    }
  });
}

function sortTasks() {
  const sortBy = sortTasksSelect.value;
  const tasksArray = Array.from(listContainer.children);

  tasksArray.sort((a, b) => {
    if (sortBy === "priority") {
      const priorities = { low: 1, medium: 2, high: 3 };
      return (
        priorities[b.getAttribute("data-priority")] -
        priorities[a.getAttribute("data-priority")]
      );
    } else if (sortBy === "date") {
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
        ? 1
        : -1;
    }
  });

  tasksArray.forEach((task) => listContainer.appendChild(task));
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
  setTimeout(() => e.target.classList.add("dragging"), 0);
}

function handleDragOver(e) {
  e.preventDefault();
  const draggingElement = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(e.clientY);
  if (afterElement == null) {
    listContainer.appendChild(draggingElement);
  } else {
    listContainer.insertBefore(draggingElement, afterElement);
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.target.classList.remove("dragging");
  saveData();
}

function getDragAfterElement(y) {
  const draggableElements = [
    ...listContainer.querySelectorAll("li:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

showTasks();
