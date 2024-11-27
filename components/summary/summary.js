/**
 * @module "summary.js"
 */

/**
 * The base URL for the Firebase Realtime Database.
 *
 * @constant {string}
 */
const baseUrl = "https://join-bf16e-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Initializes the summary by fetching summary data and rendering it.
 * Displays a welcome message on mobile devices if the previous page was the index page.
 *
 * @async
 * @function initSummary
 * @returns {Promise<void>} A promise that resolves when the summary has been initialized.
 */
export async function initSummary() {
  let [currentTasksAmount, urgentTasksAmount, toDoAmount, inProgressAmount, awaitFeedbackAmount, doneAmount, closestDueDate, isDueDateInThePast, welcomeMessage, loggedInUser] = await getSummaryData();
  const previousPage = sessionStorage.get;
  if (window.innerWidth <= 1400 && document.referrer.includes("index.html")) {
    showWelcomeMessageInMobile(welcomeMessage, loggedInUser);
  }
  renderSummary(currentTasksAmount, urgentTasksAmount, toDoAmount, inProgressAmount, awaitFeedbackAmount, doneAmount, closestDueDate, isDueDateInThePast, welcomeMessage, loggedInUser);
}

/**
 * Asynchronously retrieves summary data for tasks.
 *
 * @returns {Promise<Array>} A promise that resolves to an array containing:
 * - {number} currentTasksAmount - The total number of tasks.
 * - {number} urgentTasksAmount - The number of urgent tasks.
 * - {number} toDoAmount - The number of tasks with "To Do" status.
 * - {number} inProgressAmount - The number of tasks with "In Progress" status.
 * - {number} awaitFeedbackAmount - The number of tasks awaiting feedback.
 * - {number} doneAmount - The number of tasks with "Done" status.
 * - {Date|null} closestDueDate - The closest due date among the tasks, or null if no due dates are present.
 * - {boolean} isDueDateInThePast - Whether the closest due date is in the past.
 * - {string} welcomeMessage - A welcome message for the user.
 * - {Object} loggedInUser - The currently logged-in user.
 */
async function getSummaryData() {
  let tasks = await loadTasks();
  let currentTasksAmount = tasks.length;
  let urgentTasksAmount = getUrgentTasksAmount(tasks);
  let [closestDueDate, isDueDateInThePast] = getClosestDueDate(tasks);
  let [toDoAmount, inProgressAmount, awaitFeedbackAmount, doneAmount] = getEveryStatusAmount(tasks);
  let welcomeMessage = getWelcomeMessage();
  let loggedInUser = await getLoggedInUser();
  return [currentTasksAmount, urgentTasksAmount, toDoAmount, inProgressAmount, awaitFeedbackAmount, doneAmount, closestDueDate, isDueDateInThePast, welcomeMessage, loggedInUser];
}

/**
 * Renders the summary section of the application.
 *
 * @param {number} currentTasksAmount - The total number of current tasks.
 * @param {number} urgentTasksAmount - The number of urgent tasks.
 * @param {number} toDoAmount - The number of tasks to do.
 * @param {number} inProgressAmount - The number of tasks in progress.
 * @param {number} awaitFeedbackAmount - The number of tasks awaiting feedback.
 * @param {number} doneAmount - The number of completed tasks.
 * @param {Date} closestDueDate - The closest due date among the tasks.
 * @param {boolean} isDueDateInThePast - Indicates if the closest due date is in the past.
 * @param {string} welcomeMessage - The welcome message to display.
 * @param {string} loggedInUser - The name of the logged-in user.
 * @returns {Promise<void>} A promise that resolves when the summary is rendered.
 */
async function renderSummary(currentTasksAmount, urgentTasksAmount, toDoAmount, inProgressAmount, awaitFeedbackAmount, doneAmount, closestDueDate, isDueDateInThePast, welcomeMessage, loggedInUser) {
  document.getElementById("summaryContent").innerHTML = getSummaryTemplate(
    currentTasksAmount,
    urgentTasksAmount,
    toDoAmount,
    inProgressAmount,
    awaitFeedbackAmount,
    doneAmount,
    closestDueDate,
    isDueDateInThePast,
    welcomeMessage,
    loggedInUser
  );
}

/**
 * Retrieves the name of the logged-in user from local storage and user data.
 * If no user is logged in, returns "Dear Guest".
 *
 * @async
 * @function getLoggedInUser
 * @returns {Promise<string>} The full name of the logged-in user or "Dear Guest" if no user is logged in.
 */
async function getLoggedInUser() {
  const users = await loadUsers();
  const loggedInUserData = localStorage.getItem("loggedInUserId");
  const convertedLoggedInUserData = JSON.parse(loggedInUserData);
  let loggedInUserName = "";
  for (let index = 0; index < users.length; index++) {
    if (loggedInUserData && users[index][1].id === convertedLoggedInUserData.userID) {
      loggedInUserName = users[index][1].profile.first_name + " " + users[index][1].profile.last_name;
    } else if (!convertedLoggedInUserData.userID) {
      loggedInUserName = "Dear Guest";
    }
  }
  return loggedInUserName;
}

/**
 * Asynchronously loads user data from a specified URL.
 *
 * Fetches user data from a JSON file located at the base URL concatenated with "user.json".
 * If the network response is not ok, it throws an error.
 * Converts the response to JSON and returns the user data as an array of key-value pairs.
 *
 * @async
 * @function loadUsers
 * @returns {Promise<Array>} A promise that resolves to an array of user data as key-value pairs.
 * @throws {Error} Throws an error if the network response is not ok.
 */
async function loadUsers() {
  let response = await fetch(baseUrl + "user" + ".json");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  let responseAsJson = await response.json();
  let users = Object.entries(responseAsJson);
  return users;
}

/**
 * Finds the closest due date from a list of tasks that are not marked as "done".
 *
 * @param {Array} tasks - An array of tasks, where each task is an array with the task details.
 * @param {Object} tasks[].1 - The task details object.
 * @param {string} tasks[].1.status - The status of the task.
 * @param {string} tasks[].1.dueDate - The due date of the task in a string format.
 * @returns {Array} An array containing the formatted closest due date and a boolean indicating if the due date is in the past.
 */

function getClosestDueDate(tasks) {
  const currentDate = new Date();
  let closestDueDate = null,
    smallestDateDifference = Infinity,
    isDueDateInThePast = false;
  for (let index = 0; index < tasks.length; index++) {
    if (tasks[index][1].status !== "done") {
      const dueDate = new Date(tasks[index][1].dueDate);
      const dateDifference = dueDate - currentDate;
      if (dateDifference < smallestDateDifference) {
        smallestDateDifference = dateDifference;
        closestDueDate = dueDate;
      }
    }
  }
  let currentDay = currentDate.getDay();
  let closestDueDateDay = closestDueDate.getDay();
  let formattedDate = getFormattedUpcomingDueDate(closestDueDate);
  if (closestDueDate < currentDate && closestDueDateDay < currentDay) isDueDateInThePast = true;
  return [formattedDate, isDueDateInThePast];
}

/**
 * Formats the closest due date to a readable string in "en-US" locale.
 *
 * @param {Date|null} closestDueDate - The closest due date to format. If null, indicates no urgent due dates.
 * @returns {string} The formatted date string in "Month Day, Year" format if a date is provided,
 *                   or "No urgent due dates found" if no date is provided.
 */
function getFormattedUpcomingDueDate(closestDueDate) {
  if (closestDueDate) {
    const formattedDate = closestDueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formattedDate;
  } else {
    const noUrgentDeadline = "No urgent due dates found";
    return noUrgentDeadline;
  }
}

/**
 * Calculates the number of tasks in each status category.
 *
 * @param {Array} tasks - An array of tasks, where each task is an array with the second element being an object containing a `status` property.
 * @returns {Array<number>} An array containing the count of tasks in each status category in the following order:
 *                          [toDoAmount, inProgressAmount, awaitFeedbackAmount, doneAmount].
 */
function getEveryStatusAmount(tasks) {
  let toDoAmount = 0;
  let inProgressAmount = 0;
  let awaitFeedbackAmount = 0;
  let doneAmount = 0;
  for (let index = 0; index < tasks.length; index++) {
    if (tasks[index][1].status == "todo") {
      toDoAmount++;
    } else if (tasks[index][1].status == "inProgress") {
      inProgressAmount++;
    } else if (tasks[index][1].status == "awaitFeedback") {
      awaitFeedbackAmount++;
    } else if (tasks[index][1].status == "done") {
      doneAmount++;
    }
  }
  return [toDoAmount, inProgressAmount, awaitFeedbackAmount, doneAmount];
}

/**
 * Calculates the number of tasks with an "Urgent" priority.
 *
 * @param {Array} tasks - An array of tasks where each task is an array and the second element is an object containing a priority property.
 * @returns {number} The number of tasks with an "Urgent" priority.
 */
function getUrgentTasksAmount(tasks) {
  let currentTasksAmount = 0;
  for (let index = 0; index < tasks.length; index++) {
    if (tasks[index][1].priority == "Urgent") {
      currentTasksAmount++;
    }
  }
  return currentTasksAmount;
}

/**
 * Generates a welcome message based on the current time of day.
 *
 * @returns {string} A welcome message appropriate for the current time of day.
 */
function getWelcomeMessage() {
  let welcomeMessage = "";
  const currentDate = new Date();
  const currentDailyHour = currentDate.getHours();
  if (currentDailyHour >= 5 && currentDailyHour <= 11) {
    welcomeMessage = "Good morning,";
  } else if (currentDailyHour >= 12 && currentDailyHour <= 17) {
    welcomeMessage = "Good afternoon,";
  } else if (currentDailyHour >= 18 && currentDailyHour <= 22) {
    welcomeMessage = "Good evening,";
  } else if (currentDailyHour > 22 || currentDailyHour < 5) {
    welcomeMessage = "Good night,";
  }
  return welcomeMessage;
}

/**
 * Displays a welcome message and the logged-in user's name on a mobile view.
 * The message is shown for a brief period before being hidden.
 *
 * @param {string} welcomeMessage - The welcome message to display.
 * @param {string} loggedInUser - The name of the logged-in user to display.
 */
function showWelcomeMessageInMobile(welcomeMessage, loggedInUser) {
  document.getElementById("dynamicWelcome").innerHTML = welcomeMessage;
  document.getElementById("dynamicUser").innerHTML = loggedInUser;
  document.getElementById("summaryWelcomeMessageMobile").classList.remove("d_none");
  setTimeout(() => {
    document.getElementById("summaryWelcomeMessageMobile").classList.add("d_none");
  }, 2000);
}

/**
 * Asynchronously loads tasks from a specified URL.
 *
 * Fetches task data from the server, converts the response to JSON,
 * and returns the tasks as an array of key-value pairs.
 *
 * @async
 * @function loadTasks
 * @returns {Promise<Array>} A promise that resolves to an array of tasks.
 * @throws {Error} Throws an error if the network response is not ok.
 */
async function loadTasks() {
  let response = await fetch(baseUrl + "tasks" + ".json");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  let responseAsJson = await response.json();
  let tasks = Object.entries(responseAsJson);
  return tasks;
}

/**
 * Generates the HTML template for the summary section.
 *
 * @param {number} currentTasksAmount - The total number of current tasks.
 * @param {number} urgentTasksAmount - The number of urgent tasks.
 * @param {number} toDoAmount - The number of tasks to do.
 * @param {number} inProgressAmount - The number of tasks in progress.
 * @param {number} awaitFeedbackAmount - The number of tasks awaiting feedback.
 * @param {number} doneAmount - The number of completed tasks.
 * @param {string} closestDueDate - The closest due date for urgent tasks.
 * @param {boolean} isDueDateInThePast - Indicates if the closest due date is in the past.
 * @param {string} welcomeMessage - The welcome message to display.
 * @param {string} loggedInUser - The name of the logged-in user.
 * @returns {string} The HTML template for the summary section.
 */
function getSummaryTemplate(currentTasksAmount, urgentTasksAmount, toDoAmount, inProgressAmount, awaitFeedbackAmount, doneAmount, closestDueDate, isDueDateInThePast, welcomeMessage, loggedInUser) {
  return /*html*/ `              
          <div id="summaryWrapper" class="summaryWrapper">                 
              <div id="summaryHeadline" class="summaryHeadline">
                  <h1>Join 360</h1>
                  <div class="headlineSeparator"></div>
                  <span>Key Metrics at a Glance</span>
                  <div class="headlineSeparatorMobile"></div>
              </div>  
              <div id="summaryMiddleContent" class="summaryMiddleContent">
                  <div id="summaryTasksStatus" class="summaryTasksStatus">
                      <div id="statusFirstLine" class="statusFirstLine">  
                        <div onclick="redirectToBoard()" id="toDoWrapper" class="toDoWrapper">
                            <div id="" class="iconContainer">
                                <img src="./assets/icons/pencil_white.png" alt="">
                            </div>
                            <div id="" class="amountContainer">
                                <p id="amountToDo" class="amount">${toDoAmount}</p>
                                <span>To-do</span>
                            </div>
                        </div>
                        <div onclick="redirectToBoard()" id="DoneWrapper" class="toDoWrapper">
                            <div id="" class="iconContainer">
                                <img src="./assets/icons/check_white_fat.png" alt="">
                            </div>
                            <div id="" class="amountContainer">
                                <p id="amountDone" class="amount">${doneAmount}</p>
                                <span>Done</span>
                            </div>
                        </div>
                      </div>  
                      <div onclick="redirectToBoard()" id="statusSecondLine" class="statusSecondLine" style = "${isDueDateInThePast ? "border: 2px solid red;" : ""}">
                          <div id="urgentAmountWrapper" class="urgentAmountWrapper">
                              <div id="" class="iconContainer">
                                  <img src="./assets/icons/urgent_Icon_white_big.png" alt="">
                              </div>
                              <div id="" class="amountContainer">
                                  <p id="amountUrgent" class="amount">${urgentTasksAmount}</p>
                                  <span>Urgent</span>
                              </div>
                          </div>
                          <div class="urgentSeparator"></div>
                          <div id="urgentDeadlineContainer" class="urgentDeadlineContainer">
                              <p id="urgentDeadline" style="${isDueDateInThePast ? "color: red;" : ""}">${closestDueDate}</p>
                              <span style="${isDueDateInThePast ? "color: red;" : ""}">${isDueDateInThePast ? "Deadline missed" : "Upcoming Deadline"}</span>
                          </div>
                      </div>  
                      <div id="statusThirdLine" class="statusThirdLine">
                          <div onclick="redirectToBoard()" id="" class="amountContainer">
                              <p id="amountUrgent" class="amount">${currentTasksAmount}</p>
                              <span>Tasks in Board</span>
                          </div>
                          <div onclick="redirectToBoard()" id="" class="amountContainer">
                              <p id="amountUrgent" class="amount">${inProgressAmount}</p>
                              <span>Tasks In Progress</span>
                          </div>
                          <div onclick="redirectToBoard()" id="" class="amountContainer">
                              <p id="amountUrgent" class="amount">${awaitFeedbackAmount}</p>
                              <span>Awaiting Feedback</span>
                          </div>
                      </div>
                  </div>
                  <div id="summaryWelcomeMessage" class="summaryWelcomeMessage">
                      <h2 id="dynamicWelcome">${welcomeMessage}</h2>
                      <h1 id="dynamicUser">${loggedInUser}</h1>
                  </div>
              </div>
          </div>
      `;
}

/**
 * Redirects the user to the board page.
 */
export function redirectToBoard() {
  window.location.href = "./board.html";
}
