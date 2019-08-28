/**
 * Добавление класса на <html> при перемещении файла
 */

let drag_event_counter = 0;

document.addEventListener('dragenter', function(evt) {
    evt.preventDefault();
    drag_event_counter++;
    const fileIndex = Array.from(evt.dataTransfer.items).findIndex(function(item) {
        return item.kind === 'file';
    });
    if (fileIndex >= 0) {
        document.documentElement.classList.add('ondrag');
    }
}, true);

document.addEventListener('drop', function() {
    drag_event_counter = 0;
    document.documentElement.classList.remove('ondrag');
}, true);

document.addEventListener('dragleave', function() {
    if (--drag_event_counter === 0) {
        document.documentElement.classList.remove('ondrag');
    }
}, true);
