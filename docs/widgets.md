# Widgets

`Widget` - это базовый класс, предназначенный для упрощения создания связи
между DOM-элементами и поведением.

Вот простейший пример подкласса `Widget`, указывающий, что все DOM-элементы
с классом `click-notify` должны при клике выводить сообщение в консоль:

```javascript
const Widget = window.paperAdmin.Widget;

// event handler
const clickHandler = event => {
    console.log("Click!");
};

class ClickWidget extends Widget {
    _init(element) {
        element.addEventListener("click", clickHandler);
    }

    _destroy(element) {
        element.removeEventListener("click", clickHandler);
    }
}

const widget = new ClickWidget();
widget.bind(".click-notify");
widget.attach();
```

Экземпляр класса `Widget` создаёт _связи_ между CSS-селекторами и поведением, 
которое должно быть добавлено к элементам, соответствующим этим селекторам. 
В качестве "поведения" может быть как простой `addEventListener()`, так и инициализация
сложных виджетов &mdash; например, создание экземпляра `Select2` для выпадающего списка.

CSS-селекторы привязываются к экземпляру класса с помощью метода `bind()`. 
В дальнейшем эти селекторы используются в методе `attach()`, который применяет
поведение ко всем подходящим элементам на странице. 

К динамически добавляемым DOM-элементам поведение тоже применяется (за счёт
использования `MutationObserver`). 
