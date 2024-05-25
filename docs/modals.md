# Modals

In the administration interface, there is often a need for dynamic modal creation. 
To simplify this process, `paper-admin` uses a wrapper around the standard Bootstrap 
`Modal` class.

```javascript
const modals = window.paperAdmin.modals;

// Creating an instance of PaperModal popup
const popup = modals.createModal({
    title: "Warning!",
    body: "<h2>Confirm something</h2>\n<p>... or not.</p>",
    modalClass: "paper-modal--warning fade",
    buttons: [
        {
            label: "Cancel",
            buttonClass: "btn-light",
            onClick: function (event, popup) {
                popup.destroy();
            }
        },
        {
            autofocus: true,
            label: "OK",
            buttonClass: "btn-info",
            onClick: function (event, popup) {
                popup.destroy();
            }
        }
    ]
});

// Displaying the modal
popup.show();
```

### ОпцOptionsии

-   `title`: `String`<br>
    The title of the modal.
-   `body`: `String`<br>
    The content of the modal. Can include HTML.
-   `modalClass`: `String`<br>
    Additional CSS classes for the modal. 
    Multiple classes can be specified separated by spaces.
-   `modalDialogClass`: `String`<br>
    Additional CSS classes for the `.modal-dialog` element.
-   `backdropClass`: `String`<br>
    Additional CSS classes for the backdrop element of the modal.
-   `closeButton`: `Boolean`<br>
    Whether to add a close button to the modal header.
-   `buttons`: `Object[]`<br>
    Buttons added to the footer of the modal.
-   `templates`: `Object`<br>
    HTML templates for the modal (`templates.modal`) and its components 
    (`templates.closeButton` and `templates.button`).
-   `options`: `Object`<br>
    [Options](https://getbootstrap.com/docs/4.6/components/modal/#options)
    for the standard `Modal` class.
-   `onInit`: `Function`<br>
    Function called after the modal's DOM elements are created.
-   `onDestroy`: `Function`<br>
    Function called before the modal's DOM element is destroyed.
-   `onClose`: `Function`<br>
    Function called when the modal is closed by clicking the close button or pressing 
    the `Esc` key.

Buttons for the modal are defined using an array of objects. 
Each object can include the following fields:

-   `label`: `String`<br>
    The text of the button.
-   `buttonClass`: `String`<br>
    Additional CSS classes for the button.
-   `autofocus`: `Boolean`<br>
    Whether to focus on this button when the modal is shown. 
    Having focus on the button allows the user to trigger the associated action 
    by pressing the `Enter` key.
-   `onClick`: `Function(event, popup)`<br>
    The action associated with clicking the button.

### Methods

-   `show()`<br>
    Shows the modal.
-   `hide()`<br>
    Hides the modal. The modal can be shown again by calling the `show()` method.
-   `destroy()`<br>
    Destroys the modal. Removes the associated DOM elements. After calling this method, 
    the `PaperModal` instance becomes useless.

## Specialized Modals

In addition to the `createModal` function, which creates a basic `PaperModal` instance, 
the `window.paperAdmin.modals` object contains functions for creating and displaying 
specialized types of modals.

### showErrors(errors: String|String[], options: Object)

Displays form validation errors.

```javascript
const modals = window.paperAdmin.modals;

modals.showErrors("Please enter you name");
```

![image](https://user-images.githubusercontent.com/6928240/203981647-a6ca5a46-2a75-4cad-b558-e7ad59848a5f.png)

### showPreloader(options: Object)

Displays a modal with a preloader.

```javascript
const modals = window.paperAdmin.modals;

modals.showPreloader();
```

![image](https://user-images.githubusercontent.com/6928240/203981576-dbf73252-c641-43e0-a5bc-b9fcb4a8eb32.png)

### showSmartPreloader(promise: Promise, options: Object)

Displays a modal with a preloader for a given promise. 
When the promise resolves, the preloader modal is automatically hidden.

The function returns a `Promise` instance that resolves in the same way as the original.

```javascript
const modals = window.paperAdmin.modals;

const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject();
    }, 1000);
});

modals.showSmartPreloader(promise).then(() => {
    console.log("Done!");
});
```
