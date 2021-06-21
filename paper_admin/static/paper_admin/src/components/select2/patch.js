import "select2/dist/js/select2.full";


// Патч Select2, очищающий список перед отправкой Ajax-запроса.
// В оригинале, надпись "Searching..." просто добавлялась в начало
// списка, а затем исчезала, что вызывало эффект прыжка.
// Это приводило к missclick.

let ResultsAdapter = $.fn.select2.amd.require("select2/results");


ResultsAdapter.prototype.hideLoading = function () {
	this.$results.find(".select2-results__option").each(function(index, option) {
		let isSelectable = option.dataset._stateSelectable === "1";
		if (isSelectable) {
			option.classList.add("select2-results__option--selectable");
		}

		let isDisabled = option.dataset._stateDisabled === "1";
		if (!isDisabled) {
			option.classList.remove("select2-results__option--disabled");
			option.removeAttribute("aria-disabled");
		}
	});
};

ResultsAdapter.prototype.showLoading = function(params) {
	this.hideLoading();

	this.$results.find(".select2-results__option").each(function(index, option) {
		let isSelectable = option.classList.contains("select2-results__option--selectable");
		let isDisabled = option.classList.contains("select2-results__option--disabled");

		option.dataset._stateSelectable = isSelectable ? "1" : "0";
		option.dataset._stateDisabled = isDisabled ? "1" : "0";

		option.classList.remove("select2-results__option--selectable");
		option.classList.add("select2-results__option--disabled");
		option.setAttribute("aria-disabled", true);
	});
};


let AllowClear = $.fn.select2.amd.require("select2/selection/allowClear");
let Utils = $.fn.select2.amd.require("select2/utils");

// Добавление CSS-класса, если указан allowClear
const originalBind = AllowClear.prototype.bind;
AllowClear.prototype.bind = function(decorated, container, $container) {
    this.$selection.find('.select2-selection__rendered').addClass("select2-selection__rendered--clearable");
    originalBind.apply(this, arguments);
}

// Патч Select2, благодаря которому кнопка очищения селекта реагирует
// не на все кнопки мыши, а только на левую.
// Также отключено открытие списка при очистке.
AllowClear.prototype._handleClear = function(_, evt) {
    if (evt.button !== 0) {
        return
    }

    // Ignore the event if it is disabled
    if (this.isDisabled()) {
        return;
    }

    const $clear = this.$selection.find('.select2-selection__clear');

    // Ignore the event if nothing has been selected
    if ($clear.length === 0) {
        return;
    }

    evt.preventDefault();
    evt.stopPropagation();

    const data = Utils.GetData($clear[0], 'data');

    const previousVal = this.$element.val();
    this.$element.val(this.placeholder.id);

    let unselectData = {
        data: data
    };
    this.trigger('clear', unselectData);
    if (unselectData.prevented) {
        this.$element.val(previousVal);
        return;
    }

    for (let d = 0; d < data.length; d++) {
        unselectData = {
            data: data[d]
        };

        // Trigger the `unselect` event, so people can prevent it from being
        // cleared.
        this.trigger('unselect', unselectData);

        // If the event was prevented, don't clear it out.
        if (unselectData.prevented) {
            this.$element.val(previousVal);
            return;
        }
    }

    this.$element.trigger('input').trigger('change');
}
