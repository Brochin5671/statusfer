// Import
import {createErrorTip, storeBackPage} from './misc.js';
import {getToken, submitLogout} from './requests.js';
import {socket, socketDeleteStatus, socketPatchStatus} from './sockets.js';
import {createStatusMedia, createDateString, getTextAreaCharacters} from './statusFunctions.js';

// Important elements and variables
const username = document.getElementById('username');
const userBio = document.getElementById('userBio');
const userCreationDate = document.getElementById('date');
const statusList = document.getElementById('statusList');
const usernameForm = document.getElementById('usernameForm');
const emailForm = document.getElementById('emailForm');
const passwordForm = document.getElementById('passwordForm');
const deleteAccountForm = document.getElementById('deleteAccountForm');
const logoutBtn = document.getElementById('logoutTab');
let data = null;
let currPosts = 0;

// Listen for new username event
usernameForm.addEventListener('submit', submitNewUsername);

// Listen for new email event
emailForm.addEventListener('submit', submitNewEmail);

// Listen for new password event
passwordForm.addEventListener('submit', submitNewPassword);

// Listen for delete account event
deleteAccountForm.addEventListener('submit', submitDeleteAccount);

// Listen for logout event
logoutBtn.addEventListener('click', submitLogout);

// Closes any alerts, gets logged in user and requested status
socket.on('connect', async () => {
    $('.alert').alert('close');
    $('#profileTab').tab('show');
    storeBackPage();
    await getUserProfile();
});

// Listen for socket postStatus event
socket.on('postStatus', (statusJSON) => {
    // If user matches data from event, clear noPosts element and add status
    if(username.innerText == statusJSON.user){
        $('.noPosts').remove();
        createStatusMedia(statusJSON, true);
    }
});

// Listen for socket deleteStatus event
socket.on('deleteStatus', socketDeleteStatus);

// Listen for socket patchStatus event
socket.on('patchStatus', socketPatchStatus);

// Get requested user and return it when DOM is loaded
async function getUserProfile(){
    // Try to get new token
    await getToken();
    // Get userId from URL, send get request, and save response
    let userId = window.location.href.split("/").pop();
    userId = userId.split('#')[0];
    const res = await fetch(`/user/${userId}/data`);
    data = await res.json();
    // Display username and userid on success
    if(!data.error){
        username.innerText = data.username;
        userBio.innerText = data.bio;
        // Get the creation date of the user
        userCreationDate.innerText = `Created ${createDateString(data.createdAt, data.createdAt)}`;
        // Refresh and fill user's status list with 10 items if exists
        statusList.innerHTML = '';
        if(data.userStatusList.length > 0){
            $('.noPosts').remove();
            for(let i = 0; i < data.userStatusList.length && i < 10; i++){
                createStatusMedia(data.userStatusList[i+currPosts], false);
            }
            // If more can be added, add load more button
            currPosts += 10
            if(data.userStatusList.length > currPosts){
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.textContent = 'Load More';
                loadMoreBtn.type = 'click';
                loadMoreBtn.className = 'btn btn-primary mb-5 shadow';
                loadMoreBtn.addEventListener('click', loadMoreStatuses);
                document.getElementById('loadMore').appendChild(loadMoreBtn);
            }
        }else{ // Display no posts message
            // Create media element
            const statusMedia = document.createElement('li');
            statusMedia.className = 'media position-relative border-bottom noPosts';
            // Create body element
            const statusBody = document.createElement('div');
            statusBody.className = 'media-body m-3 text-break align-items-center';
            // Create username element
            const username = document.createElement('h5');
            username.className = 'text-center m-0';
            username.innerText = `${data.username} hasn't posted any statuses yet.`;
            // Append by linking parents
            statusBody.appendChild(username);
            statusMedia.appendChild(statusBody);
            statusList.appendChild(statusMedia);
        }
        // Display settings if profile owned by user
        const userInfo = localStorage.getItem('userInfo').split(',');
        if(userInfo[0] === data.username){
            $('.user').removeClass('d-none');
            createEditBioTool();
        }else{
            $('.user').addClass('d-none');
        }
    }else{ // Send error on failure
        username.innerText = data.error;
        userBio.innerText = data.message;
    }
}

// Adds edit button to bio if owned by user
function createEditBioTool(){
    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.type = 'click';
    editBtn.className = 'btn btn-primary mb-3 edit';
    userBio.insertAdjacentElement('afterEnd', editBtn);
    editBtn.addEventListener('click', createEditBioArea);
}

// Adds textarea with confirm and cancel buttons to bio when editing
function createEditBioArea(event){
    // Get edit button's main element id
    const editId = event.target.parentNode.id;
    // Create edit textarea
    const editArea = document.createElement('textarea');
    editArea.className = `form-control mb-1 editDeletable${editId}`;
    editArea.id = 'editedText';
    editArea.rows = 2;
    editArea.maxLength = 255;
    const statusText = event.target.parentNode.querySelector('#userBio');
    editArea.value = statusText.innerText;
    editArea.addEventListener('input', getTextAreaCharacters);
    statusText.insertAdjacentElement('afterEnd', editArea);
    // Create character counter
    const charCounter = document.createElement('p');
    charCounter.className = `small text-muted mb-2 ml-1 editDeletable${editId}`;
    charCounter.innerText = `${editArea.value.length}/${editArea.maxLength}`;
    editArea.insertAdjacentElement('afterEnd', charCounter);
    // Create confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'Confirm';
    confirmBtn.type = 'click';
    confirmBtn.className = `btn btn-primary mr-2 mb-3 confirm editDeletable${editId}`;
    const editBtn = event.target;
    editBtn.insertAdjacentElement('beforeBegin', confirmBtn);
    // Listen for confirm button event to send a patch request
    confirmBtn.addEventListener('click', async () => {
        // Send patch request
        await submitNewBio(event);
    });
    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.type = 'click';
    cancelBtn.className = `btn btn-primary cancel mb-3 editDeletable${editId}`;
    confirmBtn.insertAdjacentElement('afterEnd', cancelBtn);
    // Hide non-edit elements
    editBtn.className += ' d-none';
    statusText.className += ' d-none';
    // Listen for cancel button event to un-hide non-edit elements and remove edit elements
    cancelBtn.addEventListener('click', () => {
        editBtn.className = editBtn.className.split(' d-none')[0];
        statusText.className = statusText.className.split(' d-none')[0];
        $(`.editDeletable${editId}`).remove();
    });
}

// Send a patch request to change a bio
async function submitNewBio(event){
    // Prevent refresh
    event.preventDefault();
    // Try to get new token
    await getToken();
    // Get bio body
    const userBody = event.target.parentNode;
    // Send patch request with form data and save response
    const options = {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'bio': userBody.querySelector('#editedText').value,
        })
    };
    const res = await fetch('/user/bio', options);
    const {error, message} = await res.json();
    // Refresh page on success
    if(!error){
        window.location.reload();
    }else{ // Display error tip on failure
        createErrorTip(userBody.firstElementChild, message);
    }
}

// Send a patch request to change a username
async function submitNewUsername(event){
    // Prevent refresh
    event.preventDefault();
    // Try to get new token
    await getToken();
    // Send patch request with form data and save response
    const options = {
        method: 'PATCH',
        credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
            'username': usernameForm.querySelector('#newUsername').value,
        })
    };
    const res = await fetch('/user/username', options);
    const {error, message} = await res.json();
    // Refresh page on success
    if(!error){
        window.location.reload();
    }else{ // Display error tip on failure
        createErrorTip(usernameForm.firstElementChild, message);
    }
}

// Send a patch request to change an email
async function submitNewEmail(event){
    // Prevent refresh
    event.preventDefault();
    // Try to get new token
    await getToken();
    // Send patch request with form data and save response
    const options = {
        method: 'PATCH',
        credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
            'email': emailForm.querySelector('#newEmail').value,
        })
    };
    const res = await fetch('/user/email', options);
    const {error, message} = await res.json();
    // Refresh page on success
    if(!error){
        window.location.reload();
    }else{ // Display error tip on failure
        createErrorTip(emailForm.firstElementChild, message);
    }
}

// Send a patch request to change a password
async function submitNewPassword(event){
    // Prevent refresh
    event.preventDefault();
    // Try to get new token
    await getToken();
    // Send patch request with form data and save response
    const options = {
        method: 'PATCH',
        credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
            'password': passwordForm.querySelector('#currentPassword').value,
            'newPassword': passwordForm.querySelector('#newPassword').value,
            'confirmNewPassword': passwordForm.querySelector('#confirmNewPassword').value
        })
    };
    const res = await fetch('/user/password', options);
    const {error, message} = await res.json();
    // Refresh page on success
    if(!error){
        window.location.reload();
    }else{ // Display error tip on failure
        createErrorTip(passwordForm.firstElementChild, message);
    }
}

// Send a delete request to delete an account
async function submitDeleteAccount(event){
    // Prevent refresh
    event.preventDefault();
    // Try to get new token
    await getToken();
    // Send patch request with form data and save response
    const options = {
        method: 'DELETE',
        credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
            'password': deleteAccountForm.querySelector('#deleteAccountPassword').value,
        })
    };
    const res = await fetch('/user/deactivate', options);
    const {error, message} = await res.json();
    // Refresh page on success
    if(!error){
        window.location.reload();
    }else{ // Display error tip on failure
        createErrorTip(deleteAccountForm.firstElementChild, message);
    }
}

// When load more button is clicked, more statuses are added
function loadMoreStatuses(){
    // Fill list with 10 more items
    if(data.userStatusList){
        for(let i = currPosts; i < data.userStatusList.length && i < currPosts+10; i++){
            createStatusMedia(data.userStatusList[i], false);
        }
        // If no more can be added, remove load more button
        currPosts += 10
        if(data.userStatusList.length <= currPosts){
            document.getElementById('loadMore').remove();
        }
    }
}