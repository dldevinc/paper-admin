document.addEventListener("click", event => {
    const link = event.target.closest(".back-button");
    if (link) {
        event.preventDefault();

        const params = new URLSearchParams(window.location.search);
        if (params.has("_popup")) {
            window.close(); // Close the popup.
        } else {
            window.history.back(); // Otherwise, go back.
        }
    }
});
