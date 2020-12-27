// Select username and status text
const username = document.querySelector('#username');
const statusText = document.querySelector('#text');
const statusDate = document.querySelector('#date');

// Get requested status and return it
async function getStatus(){
    // Get statusId from URL, send get request, and save response
    const statusId = window.location.href.split("/").pop();
    const res = await fetch(`/status/${statusId}/data`);
    const data = await res.json();
    // Display username and status on success
    if(!data.error){
        username.innerText = data.user;
        statusText.innerText = data.status;
        // Get the date of latest revision of the status
        const dateObj = new Date(data.updatedAt);
        statusDate.innerText = dateObj.toString().split(' (')[0];
    }else{ // Send error on failure
        username.innerText = data.error;
        statusText.innerText = data.message;
    }
}