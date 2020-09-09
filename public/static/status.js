// Get requested status and return it
async function getStatus(){
    const statusId = window.location.href.split("/").pop();
    console.log(statusId);
    const res = await fetch('/status/get/'+statusId);
    const status = await res.json();
    return status;
}

// Show status
function showStatus(){
    const status = getStatus();
    status.then( (item) => {
        // Display user status
        let user = document.querySelector('h5');
        user.innerHTML = item.user;
        let status = document.querySelector('p');
        status.innerHTML = item.status;
    });
}