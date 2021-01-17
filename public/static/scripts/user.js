// Import
import {createErrorTip, storeBackPage} from './misc.js';
import {getToken, submitLogout} from './requests.js';
import {socket, socketDeleteStatus, socketPatchStatus} from './sockets.js';
import {createStatusMedia, createDateString} from './statusFunctions.js';

// Select username and userid
const username = document.getElementById('username');
const userIdText = document.getElementById('userId');
const userCreationDate = document.getElementById('date');
const statusList = document.getElementById('statusList');
const usernameForm = document.getElementById('usernameForm');
const emailForm = document.getElementById('emailForm');
const passwordForm = document.getElementById('passwordForm');
const deleteAccountForm = document.getElementById('deleteAccountForm');
const logoutBtn = document.getElementById('logoutTab');

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
    const userId = window.location.href.split("/").pop();
    const res = await fetch(`/user/${userId}/data`);
    const data = await res.json();
    // Display username and userid on success
    if(!data.error){
        username.innerText = data.username;
        userIdText.innerText = data._id;
        // Get the creation date of the user
        userCreationDate.innerText = `Created ${createDateString(data.createdAt, data.createdAt)}`;
        // Refresh and fill user's status list if exists
        statusList.innerHTML = '';
        if(data.userStatusList.length > 0){
            $('.noPosts').remove();
            for(let i in data.userStatusList){
                createStatusMedia(data.userStatusList[i], false);
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
        }else{
            $('.user').addClass('d-none');
        }
    }else{ // Send error on failure
        username.innerText = data.error;
        userIdText.innerText = data.message;
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