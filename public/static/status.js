// Import
import {createDateString} from './statusFunctions.js';

// Select username and status text
const username = document.querySelector('#username');
const statusText = document.querySelector('#text');
const statusDate = document.querySelector('#date');

// Get requested status and return it when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    // Get statusId from URL, send get request, and save response
    const statusId = window.location.href.split("/").pop();
    const res = await fetch(`/status/${statusId}/data`);
    const data = await res.json();
    // Display username and status on success
    if(!data.error){
        username.innerText = data.user;
        username.href = `../user/${data.userId}`;
        statusText.innerText = data.status;
        // Get the date string of the status
        statusDate.innerText = createDateString(data.createdAt, data.updatedAt);
    }else{ // Send error on failure
        username.innerText = data.error;
        username.className += ' text-decoration-none';
        statusText.innerText = data.message;
    }
});