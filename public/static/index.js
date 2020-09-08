// Get all statuses and return a list
async function getStatuses(){
    const res = await fetch('https://statusfer.herokuapp.com/status');
    const statusList = await res.json();
    return statusList;
}

// Show statuses
function showStatuses(){
    const statusList = getStatuses();
    statusList.then( (list) => {
        let listElement = document.querySelector('#statusList');
        for(let i=0;i<list.length;i++){
            // Create media object, body, username and status, and append to list
            let statusMedia = document.createElement('li');
            statusMedia.className = 'media border-bottom';
            let statusBody = document.createElement('div');
            statusBody.className = 'media-body mt-3 ml-3';
            let user = document.createElement('h5');
            user.innerHTML = list[i].user;
            let status = document.createElement('p');
            status.innerHTML = list[i].status;
            statusBody.appendChild(user);
            statusBody.appendChild(status);
            statusMedia.appendChild(statusBody);
            listElement.appendChild(statusMedia);
        }
    });
}