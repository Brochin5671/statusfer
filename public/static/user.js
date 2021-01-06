// Import
import {getToken} from './requests.js';
import {socket, socketDeleteStatus, socketPatchStatus} from './sockets.js';
import {createStatusMedia, createDateString} from './statusFunctions.js';

// Select username and userid
const username = document.getElementById('username');
const userIdText = document.getElementById('userId');
const userCreationDate = document.getElementById('date');
const statusList = document.getElementById('statusList');

// Closes any alerts, gets logged in user and requested status
socket.on('connect', async () => {
    $('.alert').alert('close');
    await getUserProfile();
});

// Listen for socket postStatus event
socket.on('postStatus', (statusJSON) => {
    if(username.innerText == statusJSON.user){
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
        // Fill user's status list if exists
        if(data.userStatusList.length > 0){
            statusList.innerHTML = '';
            for(let i in data.userStatusList){
                createStatusMedia(data.userStatusList[i]);
            }
        }else{ // Display no posts message
            // Create media element
            const statusMedia = document.createElement('li');
            statusMedia.className = 'media position-relative border-bottom';
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
    }else{ // Send error on failure
        username.innerText = data.error;
        userIdText.innerText = data.message;
    }
}