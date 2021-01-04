// Import
import {createErrorTip} from './misc.js';

// Select important elements
const statusArea = document.getElementById('statusArea');

// Tries to generate new token for user
export async function getToken(){
    // Send post request with cookies and save response
    const options = {
        method: 'POST',
        credentials: 'same-origin',
    };
    const res = await fetch('/user/token', options);
    return await res.json();
}

// Send a delete request to logout
export async function submitLogout(){
    // Send delete request with cookies and save response
    const options = {
        method: 'DELETE',
        credentials: 'same-origin'
    }
    const res = await fetch('/user/logout', options);
    const {error, message} = res.json();
    // Refresh page on success, else display error tip on failure
    if(!error) window.location.reload();
    else createErrorTip(title, message);
}

// Send a post request to post a status
export async function postStatus(){
    // Try to get token if user doesn't already have one
    await getToken();
    // Send post request with cookies and form data
    const options = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
			'Content-Type': 'text/plain'
		},
		body: statusArea.value
    };
    const res = await fetch('/status', options);
    const {error, message} = await res.json();
    // Reset status textarea and character counter, and update status list
    if(!error){
        statusArea.value = '';
        const charCounter = statusArea.nextElementSibling;
        charCounter.innerText = `0/${statusArea.maxLength}`;
    }else{ // Display error tip on failure
        createErrorTip(statusForm.firstElementChild, message);
    }
}

// Send a patch request to edit a status
export async function patchStatus(event){
    // Try to get token if user doesn't already have one
    await getToken();
    // Get status body and status id
    const statusBody = event.target.parentNode;
    const statusId = event.target.parentNode.parentNode.id;
    // Send patch request with cookies and form data
    const options = {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: statusBody.querySelector('#editedText').value,
    };
    const res = await fetch(`/status/${statusId}`, options);
    // Save response if status was updated
    if(res.status != 304){
        const {error, message} = await res.json();
        // Re-enable post button, and update statuses on success
        if(!error){
            postBtn.disabled = false;
        }else{ // Display error tip on failure
            createErrorTip(statusBody.firstElementChild, message);
        }
    }
}

// Send a delete request to delete a status
export async function deleteStatus(event){
    // Try to get token if user doesn't already have one
    await getToken();
    // Get status body and status id
    const statusBody = event.target.parentNode;
    const statusId = event.target.parentNode.parentNode.id;
    // Send patch request with cookies and form data
    const options = {
        method: 'DELETE',
        credentials: 'same-origin',
    };
    const res = await fetch(`/status/${statusId}`, options);
    const {error, message} = await res.json();
    // Re-enable post button, and update statuses on success
    if(!error){
        postBtn.disabled = false;
    }else{ // Display error tip on failure
        createErrorTip(statusBody.firstElementChild, message);
    }
}

// Send a post request to like/un-like a status
export async function likeStatus(event){
    // Try to get token if user doesn't already have one
    await getToken();
    // Get status body and status id
    const statusBody = event.target.parentNode.parentNode.parentNode;
    const statusId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    // Send post request with cookies and save response
    const options = {
        method: 'POST',
        credentials: 'same-origin',
    };
    const res = await fetch(`/status/${statusId}/like`, options);
    const {error, message} = await res.json();
    // Display error tip on failure
    if(error){
        createErrorTip(statusBody.firstElementChild, message);
    }
}

// Send a post request to dislike/un-dislike a status
export async function dislikeStatus(event){
    // Try to get token if user doesn't already have one
    await getToken();
    // Get status body and status id
    const statusBody = event.target.parentNode.parentNode.parentNode;
    const statusId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    // Send post request with cookies and save response
    const options = {
        method: 'POST',
        credentials: 'same-origin',
    };
    const res = await fetch(`/status/${statusId}/dislike`, options);
    const {error, message} = await res.json();
    // Display error tip on failure
    if(error){
        createErrorTip(statusBody.firstElementChild, message);
    }
}