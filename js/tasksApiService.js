/**
 * @module "tasksApiService.js"
 */

/**
 * The base URL for the Firebase Realtime Database.
 *
 * @constant {string}
 */
const baseUrl = "https://join-bf16e-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Imports the function to retrieve a new task template.
 *
 * @module addTask
 * @function getNewTaskTemplate - Retrieves the template for creating a new task.
 */
import { getNewTaskTemplate } from "../components/addTask/addTask.js";

/**
 * Imports the function to render tasks.
 *
 * @module taskCards
 * @function renderTasks - Renders the tasks on the user interface.
 */
import { renderTasks } from "../components/taskCards/taskCards.js";

/**
 * Imports the function to hide the confirmation dialog for deleting a user.
 *
 * @module contactModal
 * @function hideConfirmDeleteUserDialog - Hides the dialog for confirming user deletion.
 */
import { hideConfirmDeleteUserDialog } from "../components/contactModal/contactModal.js";

/**
 * Imports the function to provide feedback for a new task.
 *
 * @module addTask
 * @function newTaskUserFeedback - Provides feedback for adding a new task.
 */
import { newTaskUserFeedback } from "../components/addTask/addTask.js";

/**
 * Loads tasks from the specified API endpoint.
 *
 * @async
 * @function loadTasks
 * @returns {Promise<Array>} A promise that resolves to an array of tasks.
 * @throws {Error} Throws an error if the network response is not ok.
 */
export async function loadTasks() {
  let response = await fetch(baseUrl + "tasks" + ".json");
  if (!response.ok) throw new Error("Network response was not ok");
  let responseAsJson = await response.json();
  let tasks = Object.entries(responseAsJson);
  return tasks;
}

/**
 * Patches a new task to the server.
 *
 * This function retrieves a new task template, sends a PATCH request to update the task on the server,
 * provides user feedback, and re-renders the tasks.
 *
 * @async
 * @function patchNewTask
 * @returns {Promise<string|undefined>} The ID of the patched task if successful, otherwise undefined.
 * @throws {Error} If the network response is not ok.
 */
export async function patchNewTask() {
  let newTask = getNewTaskTemplate();
  if (newTask) {
    let id = newTask.id;
    let response = await fetch(baseUrl + "/tasks/" + id + ".json", {
      method: "PATCH",
      header: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    newTaskUserFeedback();
    await renderTasks();
    return id;
  } else {
    return;
  }
}

/**
 * Deletes an existing task from the server.
 *
 * @param {string} status - The status of the task to be deleted.
 * @param {string} taskID - The ID of the task to be deleted.
 * @throws {Error} Throws an error if the network response is not ok.
 * @returns {Promise<void>} A promise that resolves when the task is deleted and the UI is updated.
 */
export async function deleteExistungTask(status, taskID) {
  let response = await fetch(baseUrl + "/tasks/" + taskID + ".json", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Network response was not ok");
  toggleTaskDetailView();
  hideConfirmDeleteUserDialog();
  await renderTasks(status, status);
}

/**
 * Updates the status of a single subtask in the database.
 *
 * @param {string} taskID - The ID of the task containing the subtask.
 * @param {string} subtaskID - The ID of the subtask to update.
 * @param {boolean} isChecked - The new status of the subtask (true if done, false otherwise).
 * @throws {Error} Throws an error if the network response is not ok.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
export async function patchUpdateSingleSubtaskDatabase(taskID, subtaskID, isChecked) {
  let response = await fetch(baseUrl + "/tasks/" + taskID + "/subtasks/" + subtaskID + ".json", {
    method: "PATCH",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isDone: isChecked }),
  });
  if (!response.ok) throw new Error("Network response was not ok");
}

/**
 * Updates the progress of subtasks for a given task by sending a PATCH request.
 *
 * @param {string} taskID - The ID of the task to update.
 * @param {number} currentProgress - The current progress value to be updated.
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 * @throws {Error} - Throws an error if the network response is not ok.
 */
export async function patchUpdateSubtasksProgress(taskID, currentProgress) {
  let response = await fetch(baseUrl + "/tasks/" + taskID + ".json", {
    method: "PATCH",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ progress: currentProgress }),
  });
  if (!response.ok) throw new Error("Network response was not ok");
}

/**
 * Updates a task with the given data and renders the updated tasks.
 *
 * @param {Object} updateData - The data to update the task with.
 * @param {string} id - The ID of the task to update.
 * @param {string} oldCategory - The old category of the task.
 * @throws {Error} Throws an error if the network response is not ok.
 */
export async function patchTaskUpdate(updateData, id, oldCategory) {
  let response = await fetch(baseUrl + "/tasks/" + id + ".json", {
    method: "PATCH",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) throw new Error("Network response was not ok");
  if (oldCategory) renderTasks(`${updateData.status}`, `${oldCategory}`);
}
