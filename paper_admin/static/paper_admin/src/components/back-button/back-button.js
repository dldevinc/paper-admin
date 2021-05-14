document.addEventListener("click", function(event) {
    const link = event.target.closest(".back-button");
    if (link) {
        event.preventDefault();
        window.history.back();
    }
});
