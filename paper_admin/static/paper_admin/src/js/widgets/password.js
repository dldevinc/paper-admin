document.addEventListener('click', function(event) {
    const target = event.target;
    const toggler = target.closest('.vPasswordTrigger');
    if (toggler) {
        const field = toggler.closest('.input-group');
        const icon = field && field.querySelector('i.fa');
        const input = field && field.querySelector('input');
        if (input) {
            const classes = ['fa-eye-slash', 'fa-eye'];
            const types = ['text', 'password'];
            const index = (types.indexOf(input.type) + 1) % 2;
            input.type = types[index];
            icon.classList.add(classes[index]);
            icon.classList.remove(classes[(index + 1) % 2]);
        }
    }
});
