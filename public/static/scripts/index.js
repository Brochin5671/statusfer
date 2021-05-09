// Import
import {createErrorTip, storeBackPage} from './misc.js';
import {getToken, submitLogout} from './requests.js';
import {createStatus, createStatusMedia, getTextAreaCharacters} from './statusFunctions.js';
import {socket, socketPostStatus, socketDeleteStatus, socketPatchStatus} from './sockets.js';

// Important variables
const statusList = document.getElementById('statusList');
const userTitle = document.getElementById('userTitle');
const profileLink = document.getElementById('profileLink');
const logoutBtn = document.getElementById('logoutBtn');
const statusForm = document.getElementById('statusForm');
const statusArea = document.getElementById('statusArea');
let listJSON = null;
let currPosts = 0

// Listen for logout event
logoutBtn.addEventListener('click', submitLogout);

// Listen for submit status event
statusForm.addEventListener('submit', createStatus);

// Listen for status textarea input event
statusArea.addEventListener('input', getTextAreaCharacters);

// Closes any alerts, tries to get user info, and fetches all statuses when connected
socket.on('connect', async () => {
    $('.alert').alert('close');
    $('#userNav').removeClass('d-none');
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
    listJSON = await res.json();
    // Fill status list on success
    if(!listJSON.error){
        // Refresh and append 10 media objects to status list
        statusList.innerHTML = '';
        for(let i = 0; i < listJSON.length && i < 10; i++){
            createStatusMedia(listJSON[i+currPosts], false);
        }
        // If more can be added, add load more button
        currPosts += 10
        if(listJSON.length > currPosts){
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.textContent = 'Load More';
            loadMoreBtn.type = 'click';
            loadMoreBtn.className = 'btn btn-primary mb-5 shadow';
            loadMoreBtn.addEventListener('click', loadMoreStatuses);
            document.getElementById('loadMore').appendChild(loadMoreBtn);
        }
    }else{ // Display error tip on failure
        createErrorTip(document.querySelector('main').firstElementChild, listJSON.message);
    }
}

// Tries to get token to see if user is logged in or out
async function getUser(){
    // Try to get new token and user info
    await getToken();
    const userInfo = localStorage.getItem('userInfo').split(',');
    // Display loggedIn section if logged in
    if(userInfo[0]){
        $('.loggedIn').removeClass('d-none');
        $('.loggedOut').addClass('d-none');
        userTitle.innerText = userInfo[0];
        profileLink.href = `/user/${userInfo[1]}`;
    }else{ // Display loggedOut section if logged out and reset elements
        $('.loggedIn').addClass('d-none');
        $('.loggedOut').removeClass('d-none');
        userTitle.innerHTML = 'Statusfer <span class="badge">Beta</span>';
        profileLink.href = '';
        statusArea.value = '';
        const charCounter = statusArea.nextElementSibling;
        charCounter.innerText = `0/${statusArea.maxLength}`;
    }
}

// When load more button is clicked, more statuses are added
function loadMoreStatuses(){
    // Fill status list with 10 more items
    if(!listJSON.error){
        for(let i = currPosts; i < listJSON.length && i < currPosts+10; i++){
            createStatusMedia(listJSON[i], false);
        }
        // If no more can be added, remove load more button
        currPosts += 10
        if(listJSON.length <= currPosts){
            document.getElementById('loadMore').remove();
        }
    }
}