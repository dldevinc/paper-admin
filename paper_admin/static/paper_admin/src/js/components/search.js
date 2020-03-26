import whenDomReady from "when-dom-ready";


whenDomReady(function() {
    const form = document.querySelector('.paper-search-form');
    const input = form && form.querySelector('.form-control');
    input && input.addEventListener('focus', function() {
        this.select();
    });
});
