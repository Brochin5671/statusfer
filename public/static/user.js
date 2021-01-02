// Select username and userid
const username = document.getElementById('username');
const userIdText = document.getElementById('userId');
const userCreationDate = document.getElementById('date');
const statusList = document.getElementById('statusList');

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
        userCreationDate.innerText = `Created ${createDateString(data.createdAt, data.createdAt)}`;
        // Fill user's status list if exists
        if(data.userStatusList.length > 0){
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

// Creates and adds a status media element to the status list
function createStatusMedia(statusJSON){
    // Create media element
    const statusMedia = document.createElement('li');
    statusMedia.id = statusJSON._id;
    statusMedia.className = 'media position-relative border-bottom';
    // Create body element
    const statusBody = document.createElement('div');
    statusBody.className = 'media-body m-3 text-break';
    // Create link element
    const statusLink = document.createElement('a');
    statusLink.className = 'btn btn-primary align-self-center mr-3';
    statusLink.href = `/status/${statusJSON._id}`;
    statusLink.innerText = 'View';
    // Create username element
    const username = document.createElement('h5');
    username.innerText = statusJSON.user;
    // Create status text element
    const statusText = document.createElement('p');
    statusText.className = 'statusText mt-2';
    statusText.innerText = statusJSON.status;
    // Get the date string of the status and create date text element
    const statusDate = document.createElement('p');
    statusDate.className = 'small statusDate';
    statusDate.innerText = createDateString(statusJSON.createdAt, statusJSON.updatedAt);
    // Append by linking parents
    statusBody.appendChild(username);
    statusBody.appendChild(statusText);
    statusBody.appendChild(statusDate);
    statusMedia.appendChild(statusBody);
    statusMedia.appendChild(statusLink);
    statusList.appendChild(statusMedia);
}