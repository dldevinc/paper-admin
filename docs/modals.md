# Modals

Т.к. `paper-admin` основан на полноценном Bootstrap 4, вы можете пользоваться
его [стандартными возможностями](https://getbootstrap.com/docs/4.6/components/modal/#live-demo):

```html
<!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">Launch demo modal</button>

<!-- Modal -->
<div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    style="display: none;"
    aria-hidden="true"
>
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body">Woohoo, you're reading this text in a modal!</div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Save changes</button>
            </div>
        </div>
    </div>
</div>
```

Результат:<br>
![image](https://user-images.githubusercontent.com/6928240/203966510-324a6624-4de7-45f7-9620-cd296e8c93bb.png)

## PaperModal

В работе интерфейса администратора зачастую возникает необходимость
_динамического_ создания окна. Для того, чтобы упростить этот процесс,
в `paper-admin` используется обёртка над стандартным классом `Modal`.

```javascript
const modals = window.paperAdmin.modals;

// Создание экземпляра всплывающего окна PaperModal
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
                console.log("Success");
                popup.destroy();
            }
        }
    ]
});

// Отображение окна
popup.show();
```

### Опции

-   `title`: `String`<br>
    Заголовок окна.
-   `body`: `String`<br>
    Содержимое окна. Может включать HTML.
-   `modalClass`: `String`<br>
    Дополнительные CSS-классы всплывающего окна.
    Можно указать несколько классов через пробел.
-   `modalDialogClass`: `String`<br>
    Дополнительные CSS-классы элемента `.modal-dialog`.
-   `backdropClass`: `String`<br>
    Дополнительные CSS-классы элемента фона всплывающего окна.
-   `closeButton`: `Boolean`<br>
    Нужно ли добавлять в шапку всплывающего окна кнопку закрытия
    (крестик).
-   `buttons`: `Object[]`<br>
    Кнопки, добавляемые в нижнюю часть всплывающего окна.
-   `templates`: `Object`<br>
    HTML-шаблоны высплывающего окна (`templates.modal`) и его компонентов
    (`templates.closeButton` и `templates.button`).
-   `options`: `Object`<br>
    [Опции](https://getbootstrap.com/docs/4.6/components/modal/#options)
    стандартного класса `Modal`.
-   `onInit`: `Function`<br>
    Функция, вызываемая после создания DOM-элементов всплывающего окна.
-   `onDestroy`: `Function`<br>
    Функция, вызываемая перед уничтожением DOM-элемента всплывающего окна.
-   `onClose`: `Function`<br>
    Функция, вызываемая при закрытии всплывающего окна с помощью нажатия
    на крестик или клавишу `Esc`.

Кнопки для всплывающего окна задаются с помощью массива объектов.
Каждый объект может включать следующие поля:

-   `label`: `String`<br>
    Текст кнопки.
-   `buttonClass`: `String`<br>
    Дополнительные CSS-классы кнопки.
-   `autofocus`: `Boolean`<br>
    Нужно ли ставить фокус на эту кнопку при показе всплывающего окна.
    Наличие фокуса на кнопке позволит пользователю выполнить связанное
    действие нажав клавишу `Enter`.
-   `onClick`: `Function(event, popup)`<br>
    Действие, связанной с нажатием на кнопку.

### Методы

-   `show()`<br>
    Показ всплывающего окна.
-   `hide()`<br>
    Скрытие всплывающего окна. После скрытия окно можно показать снова,
    вызвав метод `show()`.
-   `destroy()`<br>
    Уничтожение всплывающего окна. Удаляет связанные с ним DOM-элементы.
    После вызова этого метода экземпляр `PaperModal` становится бесполезным.

## Специализированные окна

Помимо функции `createModal`, создающей базовый экземпляр класса `PaperModal`,
объект `window.paperAdmin.modals` содержит функции для создания и показа
специальных типов окон.

### showErrors(errors: String|String[], options: Object)

Показ ошибок заполнения формы.

```javascript
const modals = window.paperAdmin.modals;

modals.showErrors("Please enter you name");
```

![image](https://user-images.githubusercontent.com/6928240/203981647-a6ca5a46-2a75-4cad-b558-e7ad59848a5f.png)

### showPreloader(options: Object)

Показ модального окна с прелоадером.

```javascript
const modals = window.paperAdmin.modals;

modals.showPreloader();
```

![image](https://user-images.githubusercontent.com/6928240/203981576-dbf73252-c641-43e0-a5bc-b9fcb4a8eb32.png)

### showSmartPreloader(promise: Promise, options: Object)

Показ модального окна с прелоадером для указанного промиса.
Когда промис разрешится, окно с прелоадером автоматически скроется.

Функция возвращает экземпляр `Promise`, который разрешается так же,
как исходный.

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
