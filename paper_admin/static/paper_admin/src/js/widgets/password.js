document.addEventListener('click', function(event) {
    const target = event.target;
    const toggler = target.closest('.vPasswordTrigger');
    if (toggler) {
        const field = toggler.closest('.input-group');
        const input = field && field.querySelector('input');
        if (input) {
            const toggles = ['text', 'password'];
            const index = (toggles.indexOf(input.type) + 1) % 2;
            input.type = toggles[index];
        }
    }
});
