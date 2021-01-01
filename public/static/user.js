// Select username and userid
const username = document.getElementById('username');
const userIdText = document.getElementById('userId');
const userCreationDate = document.getElementById('date');

// Get requested user and return it
async function getUser(){
    // Get userId from URL, send get request, and save response
    const userId = window.location.href.split("/").pop();
    const res = await fetch(`/user/${userId}/data`);
    const data = await res.json();
    // Display username and userid on success
    if(!data.error){
        username.innerText = data.username;
        userIdText.innerText = data._id;
        // Get the creation date of the user
        userCreationDate.innerText = `Created ${createDateString(data.createdAt)}`;
    }else{ // Send error on failure
        username.innerText = data.error;
        userIdText.innerText = data.message;
    }
}

// Returns a date string based on the time
function createDateString(dateString){
    // Get given date, current date, and yesterday's date
    const date = new Date(dateString);
    const now = new Date(Date.now());
    const yesterday = new Date(Date.now());
    yesterday.setDate(now.getDate() - 1);
    // Check if date is from today or yesterday, else return a full date string
    const isToday = date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth() && date.getDate() == now.getDate();
    const isYesterday = date.getFullYear() == yesterday.getFullYear() && date.getMonth() == yesterday.getMonth() && yesterday.getDate() == date.getDate();
    if(isToday){
        return `Today at ${date.toLocaleTimeString()}`;
    }else if(isYesterday){
        return `Yesterday at ${date.toLocaleTimeString()}`;
    }else{
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    }
}