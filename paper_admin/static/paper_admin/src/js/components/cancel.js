document.addEventListener('click', function(event) {
    const target = event.target;
    const link = target.closest('.cancel-link');
    if (link) {
        event.preventDefault();
        if (window.location.search.indexOf('&_popup=1') === -1) {
            window.history.back();  // Go back if not a popup.
        } else {
            window.close(); // Otherwise, close the popup.
        }
    }
});
