/**
 * Вставка имени файла в название кнопки
 */
document.addEventListener('change', function(event) {
    const target = event.target;
    if ((target.tagName === 'INPUT') && target.closest('.vClearableFileField')) {
        let fileName = target.value.split('\\').pop();
        let buttonName = target.nextElementSibling.querySelector('span');
        if (buttonName) {
            if (fileName) {
                buttonName.textContent = fileName;
            } else {
                buttonName.textContent = buttonName.dataset.initialText;
            }
        }
    }
});

/**
 * Фикс для Firefox.
 */
document.addEventListener('focus', function(event) {
    const target = event.target;
    if ((target.tagName === 'INPUT') && target.closest('.vClearableFileField')) {
        target.classList.add('focused');
    }
});

document.addEventListener('blur', function(event) {
    const target = event.target;
    if ((target.tagName === 'INPUT') && target.closest('.vClearableFileField')) {
        target.classList.remove('focused');
    }
});
