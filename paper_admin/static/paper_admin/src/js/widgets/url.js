document.addEventListener('input', function(event) {
    const target = event.target;
    const input = target.closest('.vURLInput');
    const widget = input && input.closest('.input-group');
    const link_tag = widget && widget.querySelector('.input-group-text');
    if (link_tag) {
        let link = input.value.trim();
        if (link) {
            link_tag.href = link;
        } else {
            link_tag.removeAttribute('href');
        }
    }
});
