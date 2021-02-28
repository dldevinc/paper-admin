import "select2/dist/js/select2.full";


// Патч Select2, очищающий список перед отправкой Ajax-запроса.
// В оригинале, надпись "Searching..." просто добавлялась в начало
// списка, а затем исчезала, что вызывало эффект прыжка.
// Это приводило к missclick

let ResultsAdapter = $.fn.select2.amd.require("select2/results");

ResultsAdapter.prototype.showLoading = function(params) {
    this.hideLoading();

    var loadingMore = this.options.get('translations').get('searching');

    var loading = {
        disabled: true,
        loading: true,
        text: loadingMore(params)
    };
    var $loading = this.option(loading);
    $loading.className += ' loading-results';

    // Очищаем список перед Ajax-запросом
    this.clear();

    this.$results.prepend($loading);
};
