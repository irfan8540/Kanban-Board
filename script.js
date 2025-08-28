//let draggedCard = null;
let rightClickedCard = null;

document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);
function addTask(columnId) {
    const input = document.getElementById(`${columnId}-input`);
    const taskText = input.value.trim();
    //console.log(taskText);

    if(taskText === "") {
        return;
    }

    const taskDate = new Date().toLocaleString();
    //console.log(taskDate);
    const taskElement = createTaskElement(taskText, taskDate);

    document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
    updateTasksCount(columnId);
    saveTasksToLocalStorage(columnId, taskText, taskDate);
    input.value = ""; 
}

function createTaskElement(taskText, taskDate) {
    const element = document.createElement("div");
    element.innerHTML = `<span>${taskText}</span><br><small class="time">${taskDate}</small>`;
    element.classList.add("card");
    element.draggable = true;
    element.addEventListener("dragstart", dragStart);
    element.addEventListener("dragend", dragEnd);
    element.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        rightClickedCard = this;
        console.log(event.pageX, event.pageY);
        showContextMenu(event.pageX, event.pageY);
    });
    return element;

}
function dragStart() {
    this.classList.add("dragging");
    draggedCard = this;
}

function dragEnd() {
    this.classList.remove("dragging");
    //updateTasksCount(columnId);
    ["todo", "doing", "done"].forEach((columnId) => {
        updateTasksCount(columnId);
        updateLocalStorage();
    })
}

const columns = document.querySelectorAll(".tasks");
columns.forEach((column) => {
    column.addEventListener("dragover", dragOver);

});

function dragOver(event) {
    event.preventDefault();
    const draggedCard = document.querySelector(".dragging") 
    //this.appendChild(draggedCard)
    const afterElement = getDragAfterElement(this, event.pageY);
    if(afterElement === null) {
        this.appendChild(draggedCard);
    } else {
        this.insertBefore(draggedCard, afterElement);
    }
} 

function getDragAfterElement(container, y){
    const draggableElements = [...container.querySelectorAll(".card:not(.dragging)"),];       // NodeLisst ---> Array

    const result = draggableElements.reduce(
        (closestElementUnderMouse, currentTask) => {
            const box = currentTask.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if(offset < 0 && offset > closestElementUnderMouse.offset) {
                return { offset: offset, element: currentTask };
            } else {
                return closestElementUnderMouse;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    );
   // console.log(container);
    //let result;
    return result.element;

}

const contextmenu = document.querySelector(".context-menu");
function showContextMenu(x, y) {
    contextmenu.style.left = `${x}px`;
    contextmenu.style.top = `${y}px`;
    contextmenu.style.display = "block";
}

document.addEventListener("click", () => {
    contextmenu.style.display = "none";
});

function editTask() {
    if(rightClickedCard !== null) {
        const newTaskText = prompt("Edit task - ", rightClickedCard.textContent);
        if(newTaskText !== "") {
            rightClickedCard.textContent = newTaskText;
            updateLocalStorage();
        }
    }
    
}

function deleteTask() {
    if(rightClickedCard !== null) {
        const columnId = rightClickedCard.parentElement.id.replace("-tasks", "");
        rightClickedCard.remove();
        console.log(columnId);
        updateLocalStorage();
        updateTasksCount(columnId);
    }
}

function updateTasksCount(columnId) {
    // console.log(columnId);
    // console.log(`#${columnId}-tasks`);
    console.log(`#${columnId}-tasks .card`);
    
    const count = document.querySelectorAll(`#${columnId}-tasks .card`).length;
    document.getElementById(`${columnId}-count`).textContent = count;
}

function saveTasksToLocalStorage(columnId, taskText, taskDate) {
    const tasks = JSON.parse(localStorage.getItem(columnId)) || [];
    tasks.push({ text: taskText, date: taskDate });
    localStorage.setItem(columnId, JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    ["todo", "doing", "done"].forEach((columnId) => {
        const tasks = JSON.parse(localStorage.getItem(columnId)) || [];
        tasks.forEach(({text, date}) => {
            const taskElement = createTaskElement(text, date);
            document.getElementById(`${columnId}-tasks`).appendChild(taskElement);

        });
        updateTasksCount(columnId);
    });
}

function updateLocalStorage() {
    ["todo", "doing", "done"].forEach((columnId) => {
        const tasks = [];
        document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card) => {
            const taskText = card.querySelector("span").textContent;
            const taskDate = card.querySelector("small").textContent;
            tasks.push({ text: taskText, date: taskDate });
        });
        localStorage.setItem(columnId, JSON.stringify(tasks));
    });
}

