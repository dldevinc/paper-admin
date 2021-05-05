// Ctrl + Arrows navigation
window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    if (event.ctrlKey) {
        const pagination = document.querySelector(".paper-pagination");
        if (!pagination) {
            return
        }

        switch (event.key) {
            case "Left":
            case "ArrowLeft":
                pagination.querySelector(".page-link[aria-label=\"Previous\"]").click();
                break;
            case "Right":
            case "ArrowRight":
                pagination.querySelector(".page-link[aria-label=\"Next\"]").click();
                break;
            default:
                // Quit when this doesn't handle the key event.
                return;
        }

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }
});
