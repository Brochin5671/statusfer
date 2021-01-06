// Import
import {createErrorTip, storeBackPage} from './misc.js';
import {getToken, submitLogout} from './requests.js';
import {createStatus, createStatusMedia, getTextAreaCharacters} from './statusFunctions.js';
import {socket, socketPostStatus, socketDeleteStatus, socketPatchStatus} from './sockets.js';

// Select important elements
const statusList = document.getElementById('statusList');
const loggedInDiv = document.getElementById('loggedIn');
const username = document.getElementById('username');
const profileLink = document.getElementById('profileLink');
const loggedOutDiv = document.getElementById('loggedOut');
const logoutBtn = document.getElementById('logout');
const statusForm = document.getElementById('statusForm');
const statusArea = document.getElementById('statusArea');

// Listen for logout event
logoutBtn.addEventListener('click', submitLogout);

// Listen for submit status event
statusForm.addEventListener('submit', createStatus);

// Listen for status textarea input event
statusArea.addEventListener('input', getTextAreaCharacters);

// Closes any alerts, tries to get user info, and fetches all statuses when connected
socket.on('connect', async () => {
    $('.alert').alert('close');
    storeBackPage();
    await getUser();
    await getStatuses();
});

// Listen for socket postStatus event
socket.on('postStatus', socketPostStatus);

// Listen for socket deleteStatus event
socket.on('deleteStatus', socketDeleteStatus);

// Listen for socket patchStatus event
socket.on('patchStatus', socketPatchStatus);

// Get and display all statuses
async function getStatuses(){
    // Send get request and save response
    const res = await fetch('/status');
    const listJSON = await res.json();
    // Fill status list on success
    if(!listJSON.error){
        // Refresh and append all media objects to status list
        statusList.innerHTML = '';
        for(let i in listJSON){
            createStatusMedia(listJSON[i], false);
        }
    }else{ // Display error tip on failure
        createErrorTip(title, listJSON.message);
    }
}

// Tries to get token to see if user is logged in or out
async function getUser(){
    // Try to get new token
    const {error, message, userId} = await getToken();
    // Display loggedIn section and username if logged in
    if(!error){
        loggedInDiv.className = 'container';
        username.innerText = message;
        profileLink.href = `/user/${userId}`;
        loggedOutDiv.className = 'container d-none';
        const span = document.createElement('span');
        span.className = 'small';
        span.innerText = ' ▼';
        username.appendChild(span);
    }else{ // Display loggedOut section if logged out and reset elements
        loggedOutDiv.className = 'container';
        loggedInDiv.className = 'container d-none';
        username.innerText = '';
        profileLink.href = '';
        statusArea.value = '';
        const charCounter = statusArea.nextElementSibling;
        charCounter.innerText = `0/${statusArea.maxLength}`;
    }
}