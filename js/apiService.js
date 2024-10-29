const baseUrl = "https://join-storage-460c8-default-rtdb.europe-west1.firebasedatabase.app/";

import {
  getNewUser,
  hideAddNewUserDialog,
  getEditUserObject,
  hideEditChosenUserDialog,
  hideConfirmDeleteUserDialog,
  newUserFeedback,
  clearAddInputFields,
  validateAllInputs,
  editUserFeedback,
} from "../components/contactModal/contactModal.js";

import { renderContactList } from "../components/contactList/contactList.js";
import { renderContactDetails, selectedUser } from "../components/contactDetails/contactDetails.js";

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

export async function deleteChosenUser(id) {
  await deleteUserData(id);
  await loadUsers();
  renderContactList();
  renderContactDetails();
  hideConfirmDeleteUserDialog();
  hideEditChosenUserDialog();
}

async function deleteUserData(id) {
  let path = `/user/${id}`;
  let response = await fetch(baseUrl + path + ".json", {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
}

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
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return id;
}

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
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    selectedUser(id, true);
    hideEditChosenUserDialog();
    editUserFeedback();
  }
}

export async function loadUsers() {
  let response = await fetch(baseUrl + "user" + ".json");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  let responseAsJson = await response.json();
  let users = Object.entries(responseAsJson);
  return users;
}
