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
 *      paperAdmin.dragUtils.parseDroppedFiles(event).then(files => {
 *          for (let file of files) {
 *              console.log(`File dropped: ${file.name}`);
 *          }
 *      })
 *  });
 *
 * @param {DragEvent} event
 * @returns {Promise<File[]>}
 */
function parseDroppedFiles(event) {
    return new Promise(resolve => {
        let files = filterFiles(event);
        if (files.length) {
            let { items } = event.dataTransfer;
            if (items && items.length && items[0].webkitGetAsEntry != null) {
                // The browser supports dropping of folders, so handle items instead of files
                _addFilesFromItems(items).then(files => {
                    resolve(files);
                });
            } else {
                resolve(files);
            }
        }
    });
}

/**
 * When a folder is dropped (or files are pasted), items must be handled
 * instead of files.
 *
 * @param {DataTransferItemList} items
 * @see https://github.com/dropzone/dropzone/blob/f50d1828ab5df79a76be00d1306cc320e39a27f4/src/dropzone.js#L661
 * @returns {Promise<File[]>}
 * @private
 */
function _addFilesFromItems(items) {
    return new Promise(resolve => {
        const files = [];
        const promises = [];

        for (let item of items) {
            let entry;
            if (item.webkitGetAsEntry != null && (entry = item.webkitGetAsEntry())) {
                if (entry.isFile) {
                    files.push(item.getAsFile());
                } else if (entry.isDirectory) {
                    // Append all files from that directory to files
                    promises.push(_addFilesFromDirectory(entry, entry.name));
                }
            } else if (item.getAsFile != null) {
                if (item.kind == null || item.kind === "file") {
                    files.push(item.getAsFile());
                }
            }
        }

        Promise.all(promises).then(results => {
            for (let result of results) {
                files.push(...result);
            }

            resolve(files);
        });
    });
}

/**
 * Goes through the directory, and adds each file it finds recursively.
 *
 * @param {FileSystemDirectoryEntry} directory
 * @param {string} path
 * @see https://github.com/dropzone/dropzone/blob/f50d1828ab5df79a76be00d1306cc320e39a27f4/src/dropzone.js#L693
 * @returns {Promise<File[]>}
 * @private
 */
function _addFilesFromDirectory(directory, path) {
    const reader = directory.createReader();
    const errorHandler = error => __guardMethod__(console, "log", o => o.log(error));

    return new Promise(resolve => {
        const promises = [];
        const readEntries = () => {
            reader.readEntries(entries => {
                if (entries.length > 0) {
                    promises.push(
                        Promise.all(
                            entries.map(entry => {
                                if (entry.isFile) {
                                    return new Promise(resolve => {
                                        entry.file(file => {
                                            if (file.name.substring(0, 1) === ".") {
                                                return;
                                            }

                                            file.fullPath = `${path}/${file.name}`;
                                            resolve([file]);
                                        });
                                    });
                                } else if (entry.isDirectory) {
                                    return _addFilesFromDirectory(entry, `${path}/${entry.name}`);
                                }
                            })
                        ).then(values => {
                            return values.reduce((a, b) => a.concat(b), []);
                        })
                    );

                    readEntries();
                } else {
                    resolve(
                        Promise.all(promises).then(values => {
                            return values.reduce((a, b) => a.concat(b), []);
                        })
                    );
                }
            }, errorHandler);
        };

        readEntries();
    });
}

const dragUtils = {
    containsFiles,
    filterFiles,
    parseDroppedFiles
};

export default dragUtils;
