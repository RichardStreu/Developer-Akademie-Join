/**
 * @module "apiService.js"
 */

/**
 * The base URL for the Firebase Realtime Database.
 *
 * @constant {string}
 */
const baseUrl = "https://join-bf16e-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Imports various functions and references for handling user interactions in the contact modal.
 *
 * @module contactModal
 * @function getNewUser - Retrieves the new user object.
 * @function hideAddNewUserDialog - Hides the dialog for adding a new user.
 * @function getEditUserObject - Retrieves the object for editing a user.
 * @function hideEditChosenUserDialog - Hides the dialog for editing the chosen user.
 * @function hideConfirmDeleteUserDialog - Hides the dialog for confirming user deletion.
 * @function newUserFeedback - Provides feedback for adding a new user.
 * @function clearAddInputFields - Clears the input fields in the add user dialog.
 * @function validateAllInputs - Validates all input fields.
 * @function editUserFeedback - Provides feedback for editing a user.
 */
import {
  getNewUser,
  hideAddNewUserDialog,
  getEditUserObject,
  hideEditChosenUserDialog,
  hideConfirmDeleteUserDialog,
  newUserFeedback,
  clearAddInputFields,
  editUserFeedback,
} from "../components/contactModal/contactModal.js";

/**
 * Imports the function to validate all inputs in the contact modal.
 *
 * @module contactModalValidation
 * @function validateAllInputs - Validates all inputs in the contact modal.
 */
import { validateAllInputs } from "../components/contactModal/contactModalValidation.js";

/**
 * Imports the function to retrieve the array of tasks.
 *
 * @module script
 * @function getTasksArray - Retrieves the array of tasks from the script.
 */
import { getTasksArray } from "./script.js";

/**
 * Imports the function to update a task in the database service.
 *
 * @module tasksApiService
 * @function patchTaskUpdate - Updates a task in the database.
 */
import { patchTaskUpdate } from "./tasksApiService.js";

/**
 * Imports the function to render the contact list.
 *
 * @module contactList
 * @function renderContactList - Renders the contact list on the user interface.
 */
import { renderContactList } from "../components/contactList/contactList.js";

/**
 * Imports functions and variables for rendering contact details and managing the selected user.
 *
 * @module contactDetails
 * @function renderContactDetails - Renders the details of a contact.
 * @variable selectedUser - The currently selected user.
 */
import { renderContactDetails, selectedUser } from "../components/contactDetails/contactDetails.js";

/**
 * Adds a new contact after validating all input fields.
 *
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>} - A promise that resolves when the contact is added and the UI is updated.
 *
 * @async
 * @function addContact
 */
export async function addContact(event) {
  event.stopPropagation();
  if (validateAllInputs("add")) {
    let id = await patchNewUser();
    await loadUsers();
    renderContactList();
    setTimeout(() => {
      selectedUser(id);
    }, 100);
    hideAddNewUserDialog();
    newUserFeedback();
    clearAddInputFields();
  }
}

/**
 * Deletes a user by their ID, reloads the user list, and updates the UI.
 *
 * This function performs the following actions:
 * 1. Deletes the user data associated with the given ID.
 * 2. Reloads the list of users.
 * 3. Renders the updated contact list.
 * 4. Renders the updated contact details.
 * 5. Hides the confirmation dialog for deleting a user.
 * 6. Hides the dialog for editing the chosen user.
 *
 * @async
 * @param {number} id - The ID of the user to be deleted.
 * @returns {Promise<void>} A promise that resolves when all actions are complete.
 */
export async function deleteChosenUser(id) {
  await deleteUserData(id);
  await loadUsers();
  renderContactList();
  renderContactDetails();
  hideConfirmDeleteUserDialog();
  hideEditChosenUserDialog();
}

/**
 * Deletes user data from the server.
 *
 * @param {string} id - The ID of the user to delete.
 * @throws {Error} Throws an error if the network response is not ok.
 * @returns {Promise<void>} A promise that resolves when the user data is deleted.
 */
async function deleteUserData(id) {
  let path = `/user/${id}`;
  let response = await fetch(baseUrl + path + ".json", {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Network response was not ok");
  deletUserFromTasks(id);
}

export async function deletUserFromTasks(id) {
  let allTasks = await getTasksArray();
  allTasks.forEach((element) => {
    let currentAssignationIdsArray = Object.keys(element[1].assignedTo);
    let indexToRemove = currentAssignationIdsArray.indexOf(id);
    if (indexToRemove != -1) {
      currentAssignationIdsArray.splice(indexToRemove, 1);
      let assignedToObject = {};
      currentAssignationIdsArray.forEach((e) => {
        assignedToObject[e] = e;
      });
      element[1].assignedTo = assignedToObject;
      let currentTaskId = element[1].id;
      let currentTask = element[1];
      patchTaskUpdate(currentTask, currentTaskId);
    }
  });
}

/**
 * Patches a new user to the server.
 *
 * @param {Object} userObject - The user object to be patched. If not provided, a new user object will be generated.
 * @returns {Promise<string>} - The ID of the patched user.
 * @throws {Error} - Throws an error if the network response is not ok.
 */
export async function patchNewUser(userObject) {
  let newUser;
  if (userObject) {
    newUser = userObject;
  } else {
    newUser = getNewUser();
  }
  let id = newUser.id;
  let response = await fetch(baseUrl + "/user/" + id + ".json", {
    method: "PATCH",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });
  if (!response.ok) throw new Error("Network response was not ok");
  return id;
}

/**
 * Edits an existing user's profile.
 *
 * @param {string} id - The ID of the user to be edited.
 * @param {Object} user - The user object containing updated information.
 * @returns {Promise<void>} - A promise that resolves when the user's profile has been successfully edited.
 * @throws {Error} - Throws an error if the network response is not ok.
 */
export async function editExistingUser(id, user) {
  if (validateAllInputs("edit")) {
    let editedUserProfil = getEditUserObject(user);
    let response = await fetch(baseUrl + `/user/${id}/profile.json`, {
      method: "PATCH",
      header: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedUserProfil),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    selectedUser(id, true);
    hideEditChosenUserDialog();
    editUserFeedback();
  }
}

/**
 * Loads users from the specified JSON endpoint.
 *
 * @async
 * @function loadUsers
 * @returns {Promise<Array>} A promise that resolves to an array of user entries.
 * @throws {Error} If the network response is not ok.
 */
export async function loadUsers() {
  let response = await fetch(baseUrl + "user" + ".json");
  if (!response.ok) throw new Error("Network response was not ok");
  let responseAsJson = await response.json();
  let users = Object.entries(responseAsJson);
  return users;
}
