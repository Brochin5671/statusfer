// Import important functions
import {getToken, submitLogout} from './requests.js';
import {createStatusMedia} from './statusFunctions.js';
import {socket, socketPatchStatus} from './sockets.js';

// Select important elements
const userTitle = document.getElementById('userTitle');
const profileLink = document.getElementById('profileLink');
const logoutBtn = document.getElementById('logoutBtn');
const statusList = document.getElementById('statusList');
const backBtn = document.getElementById('backBtn');

// Listen for logout event
logoutBtn.addEventListener('click', submitLogout);

// Closes any alerts, gets logged in user and requested status
socket.on('connect', async () => {
    $('.alert').alert('close');
    $('#userNav').removeClass('d-none');
    await getUser();
    await getStatus();
});

// Listen for socket patchStatus event
socket.on('patchStatus', socketPatchStatus);

// Listen for socket deleteStatus event
socket.on('deleteStatus', async () => {
    await getStatus();
});

// Tries to get token to see if user is logged in or out
async function getUser(){
    // Try to get new token
    await getToken();
    const userInfo = localStorage.getItem('userInfo').split(',');
    // Display loggedIn section if logged in
    if(userInfo[0]){
        $('.loggedIn').removeClass('d-none');
        $('.loggedOut').addClass('d-none');
        userTitle.innerText = userInfo[0];
        profileLink.href = `/user/${userInfo[1]}`;
    }else{ // Hide loggedIn section if logged out and reset elements
        $('.loggedIn').addClass('d-none');
        $('.loggedOut').removeClass('d-none');
        userTitle.innerText = 'Statusfer';
        profileLink.href = '';
    }
}

// Get and display specific status
async function getStatus(){
    // Get statusId from URL, send get request, and save response
    const statusId = window.location.href.split("/").pop();
    const res = await fetch(`/status/${statusId}/data`);
    const data = await res.json();
    // Display status media on success
    if(!data.error){
        // Refresh list and create status media
        statusList.innerHTML = '';
        createStatusMedia(data, false);
        // Replace view button with back button
        document.querySelector('.view').replaceWith(backBtn);
    }else{ // Display error on failure
        const statusUser = document.querySelector('.statusUser');
        statusUser.innerText = data.error;
        statusUser.className += ' text-decoration-none';
        const statusText = document.querySelector('.statusText');
        statusText.innerText = data.message;
    }
    // Store backPage link in back button
    if(sessionStorage.getItem('backPage')) backBtn.href = sessionStorage.getItem('backPage');
    else backBtn.href = '/';
}