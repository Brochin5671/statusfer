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
        statusDate.innerText = createDateString(data.updatedAt);
    }else{ // Send error on failure
        username.innerText = data.error;
        statusText.innerText = data.message;
    }
}

// Returns a date string based on the time
function createDateString(dateString){
    const date = new Date(dateString);
    const nowDate = new Date(Date.now());
    // Check if date is from today or yesterday, else return a full date string
    if(date.getFullYear() == nowDate.getFullYear() && date.getMonth() == nowDate.getMonth() && date.getDate() == nowDate.getDate()){
        return `Today at ${date.toLocaleTimeString()}`;
    }else if(date.getFullYear() == nowDate.getFullYear() && date.getMonth() == nowDate.getMonth() && nowDate.getDate() - date.getDate() == 1){
        return `Yesterday at ${date.toLocaleTimeString()}`;
    }else{
        return date.toLocaleString();
    }
}