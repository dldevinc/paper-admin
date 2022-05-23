/**
 * Для событий drag-n-drop возвращает true, если среди перетаскиваемых
 * элементов есть файлы.
 *
 * @param {DragEvent} e
 * @returns {boolean}
 */
function containsFiles(e) {
    if (e.dataTransfer && e.dataTransfer.types) {
        // Because e.dataTransfer.types is an Object in
        // IE, we need to iterate like this instead of
        // using e.dataTransfer.types.some()
        for (let i = 0; i < e.dataTransfer.types.length; i++) {
            if (e.dataTransfer.types[i] === "Files") return true;
        }
    }
    return false;
}

/**
 * Возвращает добавленные файлы в виде массива.
 *
 * @param {DragEvent} e
 * @returns {Array}
 */
function filterFiles(e) {
    let files = [];
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
        files[i] = e.dataTransfer.files[i];
    }
    return files;
}

/**
 * Вызывает callback для каждого файла, добавленного с помощью drag-n-drop.
 * Поддерживает перетаскивание папок.
 *
 * @example:
 *  element.addEventListener("dragover", event => {
 *      event.preventDefault();
 *  });
 *
 *  element.addEventListener("drop", event => {
 *      event.preventDefault();
 *      paperAdmin.dragUtils.parseDroppedFiles(event, file => {
 *          console.log(`File dropped: ${file.name}`);
 *      })
 *  });
 *
 * @param {DragEvent} event
 * @param {Function} callback
 */
function parseDroppedFiles(event, callback) {
    let files = filterFiles(event);
    if (files.length) {
        let { items } = event.dataTransfer;
        if (items && items.length && items[0].webkitGetAsEntry != null) {
            // The browser supports dropping of folders, so handle items instead of files
            _addFilesFromItems(items, callback);
        } else {
            for (let file of files) {
                callback(file);
            }
        }
    }
}

/**
 * When a folder is dropped (or files are pasted), items must be handled
 * instead of files.
 *
 * @param {DataTransferItemList} items
 * @param {Function} callback
 * @see https://github.com/dropzone/dropzone/blob/f50d1828ab5df79a76be00d1306cc320e39a27f4/src/dropzone.js#L661
 * @private
 */
function _addFilesFromItems(items, callback) {
    for (let item of items) {
        let entry;
        if (item.webkitGetAsEntry != null && (entry = item.webkitGetAsEntry())) {
            if (entry.isFile) {
                callback(item.getAsFile());
            } else if (entry.isDirectory) {
                // Append all files from that directory to files
                _addFilesFromDirectory(entry, entry.name, callback);
            }
        } else if (item.getAsFile != null) {
            if (item.kind == null || item.kind === "file") {
                callback(item.getAsFile());
            }
        }
    }
}

/**
 * Goes through the directory, and adds each file it finds recursively.
 *
 * @param {FileSystemEntry} directory
 * @param {string} path
 * @param {Function} callback
 * @see https://github.com/dropzone/dropzone/blob/f50d1828ab5df79a76be00d1306cc320e39a27f4/src/dropzone.js#L693
 * @private
 */
function _addFilesFromDirectory(directory, path, callback) {
    let dirReader = directory.createReader();
    let errorHandler = error => __guardMethod__(console, "log", o => o.log(error));

    let readEntries = () => {
        return dirReader.readEntries(entries => {
            if (entries.length > 0) {
                for (let entry of entries) {
                    if (entry.isFile) {
                        entry.file(file => {
                            if (file.name.substring(0, 1) === ".") {
                                return;
                            }

                            file.fullPath = `${path}/${file.name}`;
                            callback(file);
                        });
                    } else if (entry.isDirectory) {
                        _addFilesFromDirectory(entry, `${path}/${entry.name}`, callback);
                    }
                }

                // Recursively call readEntries() again, since browser only handle
                // the first 100 entries.
                // See: https://developer.mozilla.org/en-US/docs/Web/API/DirectoryReader#readEntries
                readEntries();
            }
            return null;
        }, errorHandler);
    };

    readEntries();
}

const dragUtils = {
    containsFiles,
    filterFiles,
    parseDroppedFiles
};

export default dragUtils;
