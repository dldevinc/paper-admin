document.addEventListener('input', function(event) {
    const target = event.target;
    const input = target.closest('.vEmailInput');
    const widget = input && input.closest('.input-group');
    const link_tag = widget && widget.querySelector('.input-group-text');
    if (link_tag) {
        let email = input.value.trim();
        if (email) {
            link_tag.href = 'mailto:' + input.value;
        } else {
            link_tag.removeAttribute('href');
        }
    }
});
