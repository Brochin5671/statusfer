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
        username.href = `../user/${data.userId}`;
        statusText.innerText = data.status;
        // Get the date string of the status
        statusDate.innerText = createDateString(data.createdAt, data.updatedAt);
    }else{ // Send error on failure
        username.innerText = data.error;
        username.className += ' text-decoration-none';
        statusText.innerText = data.message;
    }
}

// Returns a date string based on the createdAt and updatedAt strings
function createDateString(createdAt, updatedAt){
    // Get given date, edit date, current date, yesterday's date
    const date = new Date(createdAt);
    const editDate = (createdAt === updatedAt) ? '':`\nEdited: ${createDateString(updatedAt, updatedAt)}`;
    const now = new Date(Date.now());
    const yesterday = new Date(Date.now());
    yesterday.setDate(now.getDate() - 1);
    // Check if date is from today or yesterday, else return a full date string
    const isToday = date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth() && date.getDate() == now.getDate();
    const isYesterday = date.getFullYear() == yesterday.getFullYear() && date.getMonth() == yesterday.getMonth() && yesterday.getDate() == date.getDate();
    if(isToday){
        return `Today at ${date.toLocaleTimeString()}${editDate}`;
    }else if(isYesterday){
        return `Yesterday at ${date.toLocaleTimeString()}${editDate}`;
    }else{
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}${editDate}`;
    }
}