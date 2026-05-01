// ------------------- DOM ELEMENTS -----------------
const addBtn = document.querySelector(".add-btn");
const removeBtn = document.querySelector(".remove-btn");
const modalCont = document.querySelector(".modal-cont");
// const textAreaCont = document.querySelector(".textArea-cont")
const mainCont = document.querySelector(".main-cont");
const textAreaCont = document.querySelector(".textArea-cont");
const lockClose = "fa-lock";
const lockOpen = "fa-lock-open";
const colors = ["lightpink", "lightgreen", "lightblue", "black"]; // 4 % 4 -> 0
let ticketsArr = [];
//iflocal storage contains the ticket

if (localStorage.getItem("tickets")) {
  //stored the array  in string format, when we are reading back we will be using json.parse
  ticketsArr = JSON.parse(localStorage.getItem("tickets"));

  // rebuilding the UI from saved data
  for (let i = 0; i < ticketsArr.length; i++) {
    const { ticketColor, ticketID, ticketTask } = ticketsArr[i];
    //call our createticket function
    createTicket(ticketColor, ticketID, ticketTask);
  }
}

function addNewTicket(ticketColor, ticketTask) {
  const id = shortid();
  ticketsArr.push({ ticketColor, ticketID: id, ticketTask }); // ES5
  //this array willl pushing local storage
  localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  createTicket(ticketColor, id, ticketTask);
}

function getTicketIndex(id) {
  for (let i = 0; i < ticketsArr.length; i++) {
    if (ticketsArr[i].ticketID === id) {
      return i;
    }
  }
  return -1;
}

function updateLocalStorage() {
  localStorage.setItem("tickets", JSON.stringify(ticketsArr));
}

// ----------------- STATE FLAGS ---------------------------
let addTaskFlag = false; // tracks whether modal is open or closed
let removeTaskFlag = false;

// ------------------ EVENT LISTENERS -----------------------
addBtn.addEventListener("click", function () {
  // flip the flag value
  addTaskFlag = !addTaskFlag;

  // Show or hide based on the flag
  //   if (addTaskFlag) {
  //     modalCont.style.display = "flex";
  //   } else {
  //     modalCont.style.display = "none";
  //   }
  modalCont.style.display = addTaskFlag ? "flex" : "none";
});

removeBtn.addEventListener("click", function () {
  removeTaskFlag = !removeTaskFlag;
  if (removeTaskFlag) {
    alert("Delete mode activated");
    removeBtn.style.color = "red";
  } else {
    removeBtn.style.color = "white";
  }
});

/****
 * include lock icon in html
 * whenthe icon is clicked -> change iucon to unlocked
 * - make the text editable
 * else
 *  change icon to locked
 *  - make the tast text non editable
 *
 */
// function to remove tickets when delete mode is active
function handleRemoval(ticket, id) {
  // newly created ticket -> add event listener to remove here
  ticket.addEventListener("click", function () {
    if (!removeTaskFlag) return;
    ticket.remove();
    let idx = getTicketIndex(id);
    // remove the ticket from ticketArr using the idx
    ticketsArr.splice(idx, 1);
    updateLocalStorage();
  });
}

function handleLock(ticket, id) {
  /**
   *
   * select the lock element
   * figure out the child - i tag is with the class
   * if the class is open lock -> make it locked and vice versa
   */
  const ticketLockElem = ticket.querySelector(".ticket-lock");
  const ticketLockIcon = ticketLockElem.children[0]; // icon element
  const ticketTaskArea = ticket.querySelector(".task-area");
  let index = getTicketIndex(id);
  console.log("updating ticket", id);

  ticketLockIcon.addEventListener("click", function () {
    if (ticketLockIcon.classList.contains(lockClose)) {
      ticketLockIcon.classList.remove(lockClose);
      ticketLockIcon.classList.add(lockOpen);
      // make the task area editable
      ticketTaskArea.setAttribute("contenteditable", "true");
    } else {
      ticketLockIcon.classList.remove(lockOpen);
      ticketLockIcon.classList.add(lockClose);
      // make the taske area as non editable
      ticketTaskArea.setAttribute("contenteditable", "false");
    }
    // update the stored data in the array
    ticketsArr[index].ticketTask = ticketTaskArea.innerText;
    localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  });
}

function handleColor(ticket, id) {
  /***
   * identify the color band that wqsa clicked
   * find the color index in the array
   * move to the next color index ( cyclically )
   * update the background color
   *
   */
  const index = getTicketIndex(id);
  const ticketColorband = ticket.querySelector(".ticket-color");
  ticketColorband.addEventListener("click", function () {
    // step 1 -> find the current color
    let currentColor = ticketColorband.style.backgroundColor;

    // step 2 -> find the index of the color in the array
    let currentColorIdx = colors.findIndex(function (color) {
      return currentColor === color; // 3
    });

    // for(let i = 0; i < colors.length; i++){
    //     if(colors[i] === currentColor) {
    //         currentColorIdx = i;
    //         break;

    //     }
    // }
    // step 3 nove to the next color index
    let newColorIdx = (currentColorIdx + 1) % colors.length;
    let newColor = colors[newColorIdx];

    // step 4: update the class
    ticketColorband.style.backgroundColor = newColor;
    ticketsArr[index].ticketColor = newColor;
    // localStorage.getItem(id) // ticket
    updateLocalStorage();
  });
}

// function to create ticket

function createTicket(ticketColor, ticketID, ticketTask) {
  console.log("ticket color", ticketColor);
  const ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");
  ticketCont.innerHTML = `
    <div class="ticket-color" style="background-color:${ticketColor}"></div>
    <div class="ticket-id">${ticketID}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock"><i class="fa-solid fa-lock"></i></div>
    `;

  // append the created ticket to the main container
  mainCont.appendChild(ticketCont);

  // add delete funcitonlaity , we will call a handleRemove
  handleRemoval(ticketCont, ticketID);
  handleLock(ticketCont, ticketID);
  handleColor(ticketCont, ticketID);
}

// adding event listener for the SHIFT key to create ticket
modalCont.addEventListener("keydown", function (e) {
  const keyPressed = e.key;

  if (keyPressed === "Shift") {
    const taskContent = textAreaCont.value.trim(); // read the text from text area
    if (taskContent == "") {
      alert("Please enter a task before creating a ticket");
      return;
    }
    // const ticketID = shortid();

    // createTicket(modalPriorityColor, ticketID, taskContent); // call the createTicket function to generate a new ticket
    addNewTicket(modalPriorityColor, taskContent);
    modalCont.style.display = "none";

    addTaskFlag = false;

    textAreaCont.value = ""; // clear the user text for the next input
  }
});

const allPriorityColors = document.querySelectorAll(".priority-color");

let modalPriorityColor = colors[colors.length - 1]; // default = black

// loop over all the colors and attach click listeners
allPriorityColors.forEach(function (colorElem) {
  colorElem.addEventListener("click", function () {
    allPriorityColors.forEach(function (priorityColorElem) {
      priorityColorElem.classList.remove("active");
    });

    // add the active class to the clicked color
    colorElem.classList.add("active");

    // store the selected color
    modalPriorityColor = colorElem.classList[0];
    console.log("selected color", modalPriorityColor);
  });
});

let toolBoxColors = document.getElementsByClassName("color");

for (let i = 0; i < toolBoxColors.length; i++) {
  toolBoxColors[i].addEventListener("click", function () {
    let selectedColor = toolBoxColors[i].classList[0];

    // select all the tickets
    let allTickets = document.getElementsByClassName("ticket-cont");

    // step 3 - loop throught each ticket
    for (let j = 0; j < allTickets.length; j++) {
      // find the ticket color band
      let ticketColor =
        allTickets[j].querySelector(".ticket-color").style.backgroundColor;

      // step 4-> compare colors
      if (ticketColor === selectedColor) {
        allTickets[j].style.display = "block"; // show matching
      } else {
        allTickets[j].style.display = "none"; // hide
      }
    }
  });
  // step 5 : handle the double click
  toolBoxColors[i].addEventListener("dblclick", function () {
    let allTickets = document.getElementsByClassName("ticket-cont");
    for (let k = 0; k < allTickets.length; k++) {
      allTickets[k].style.display = "block"; // show matching
    }
  });
}

// console.log(localStorage.getItem("username"));

// const obj = { name: "Kabil" };
// localStorage.setItem("userObj", JSON.stringify(obj));
// localStorage.setItem("userObj2", JSON.stringify(obj));
// localStorage.setItem("userObj3", JSON.stringify(obj));
// localStorage.setItem("userObj4", JSON.stringify(obj));
// // localStorage.getItem("userObj");
// console.log(localStorage.getItem("userObj"));

// console.log(localStorage.key);

// for (let i = 0; i < localStorage.length; i++) {
//   console.log(localStorage.key(i));
// }

/***
 *
 * [{id:z,,,,,},
 * {id:y,,,,,},
 * id:z,,,,,}
 * ]
 *
 * {
 * x:{},
 * y:{},
 * z:{}
 * }
 *
 * ticketObj[id] = {.....}
 * updateLocalStorage()
 */