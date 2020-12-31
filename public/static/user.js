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