// Import
import {getToken, submitLogout} from './requests.js';
import {createStatusMedia} from './statusFunctions.js';
import {socket, socketPatchStatus} from './sockets.js';

// Select username and status text
const loggedInDiv = document.getElementById('loggedIn');
const username = document.getElementById('username');
const profileLink = document.getElementById('profileLink');
const logoutBtn = document.getElementById('logout');
const statusList = document.getElementById('statusList');

// Listen for logout event
logoutBtn.addEventListener('click', submitLogout);

// Closes any alerts, gets logged in user and requested status
socket.on('connect', async () => {
    $('.alert').alert('close');
    await getUser();
    await getStatus();
});

// Listen for socket patchStatus event
socket.on('patchStatus', socketPatchStatus);

// Listen for socket deleteStatus event
socket.on('deleteStatus', async () => {
    await getUser();
    await getStatus();
});

// Tries to get token to see if user is logged in or out
async function getUser(){
    // Try to get new token
    const {error, message, userId} = await getToken();
    // Display loggedIn section and username if logged in
    if(!error){
        loggedInDiv.className = 'container';
        username.innerText = message;
        profileLink.href = `/user/${userId}`;
        const span = document.createElement('span');
        span.className = 'small';
        span.innerText = ' ▼';
        username.appendChild(span);
    }else{ // Hide loggedIn section if logged out and reset elements
        loggedInDiv.className = 'container d-none';
        username.innerText = '';
        profileLink.href = '';
    }
}

// Get and display specific status
async function getStatus(){
    // Get statusId from URL, send get request, and save response
    const statusId = window.location.href.split("/").pop();
    const res = await fetch(`/status/${statusId}/data`);
    const data = await res.json();
    // Display username and status on success
    if(!data.error){
        statusList.innerHTML = '';
        createStatusMedia(data, false);
        const backBtn = document.createElement('a');
        backBtn.className = 'btn btn-primary align-self-center mr-3';
        backBtn.href = '/';
        backBtn.innerText = 'Back';
        document.querySelector('.view').replaceWith(backBtn);
    }else{ // Send error on failure
        const statusUser = document.querySelector('.statusUser');
        statusUser.innerText = data.error;
        statusUser.className += ' text-decoration-none';
        const statusText = document.querySelector('.statusText');
        statusText.innerText = data.message;
    }
}