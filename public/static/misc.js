// Creates and inserts error div
export function createErrorTip(adjElement, message){
    $('.alert').alert('close');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning alert-dismissible fade show';
    // Check if element is to be inserted at the top so it can have a fixed top position
    if(adjElement === document.querySelector('main').firstElementChild) errorDiv.className += ' fixed-top';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`;
    adjElement.insertAdjacentElement('beforeBegin', errorDiv);
}