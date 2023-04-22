// Отмена использования `element.id` при генерации внутреннего ID.
// В противном случае, при сортировке форм (и изменении атрибута ID
// тэга select) виджет ломается.
$.fn.select2.amd.require(
    ["select2/utils"],
    function (Utils) {
        let id = 0;
        Utils.GetUniqueElementId = function (element) {
            // Get a unique element Id. If element has no id,
            // creates a new unique number, stores it in the id
            // attribute and returns the new id with a prefix.
            // If an id already exists, it simply returns it with a prefix.

            let select2Id = element.getAttribute('data-select2-id');

            if (select2Id != null) {
                return select2Id;
            }

            // If element has id, use it.
            // if (element.id) {
            //     select2Id = 'select2-data-' + element.id;
            // } else {
                select2Id = 'select2-data-' + (++id).toString() +
                    '-' + Utils.generateChars(4);
            // }

            element.setAttribute('data-select2-id', select2Id);

            return select2Id;
        };
    },
    null,
    true
);

// Добавлена опция containerCssClass, в которой можно указать дополнительные CSS-классы,
// которые будут добавлены к контейнеру и выпадающему списку, подобно "theme".
$.fn.select2.amd.require(
    ["select2/core"],
    function (Select2) {
        const originalRender = Select2.prototype.render;

        Select2.prototype.render = function () {
            const self = this;
            const $container = originalRender.apply(this, arguments);

            const containerCssClass = this.options.get("containerCssClass");
            if (containerCssClass) {
                containerCssClass.split(/\s+/).map(className => {
                    className && self.$container[0].classList.add(className);
                });
            }
            return $container;
        };
    },
    null,
    true
);

// Патч Select2, блокирующий список перед отправкой Ajax-запроса.
// В оригинале, надпись "Searching..." добавлялась в начало списка,
// а затем исчезала, что вызывало эффект прыжка.
// Также отключено мигание сообщения "No results found".
$.fn.select2.amd.require(
    ["select2/results"],
    function (Results) {
        const originalShowLoading = Results.prototype.showLoading;
        const originalHideLoading = Results.prototype.hideLoading;

        Results.prototype.hideMessages = function () {};

        Results.prototype.hideLoading = function () {
            originalHideLoading.apply(this, arguments);

            const $options = this.$results.find(".select2-results__option");
            $options.each((index, option) => {
                const isSelectable = option.dataset._stateSelectable === "1";
                if (isSelectable) {
                    option.classList.add("select2-results__option--selectable");
                }

                const isDisabled = option.dataset._stateDisabled === "1";
                if (!isDisabled) {
                    option.classList.remove("select2-results__option--disabled");
                    option.removeAttribute("aria-disabled");
                }
            });
        };

        Results.prototype.showLoading = function () {
            this.hideLoading();

            const $options = this.$results.find(".select2-results__option");
            if (!$options.length) {
                // показываем сообщение "Searching...", если список пуст
                originalShowLoading.apply(this, arguments);
            } else {
                $options.each((index, option) => {
                    const isSelectable = option.classList.contains("select2-results__option--selectable");
                    const isDisabled = option.classList.contains("select2-results__option--disabled");

                    option.dataset._stateSelectable = isSelectable ? "1" : "0";
                    option.dataset._stateDisabled = isDisabled ? "1" : "0";

                    option.classList.remove("select2-results__option--selectable");
                    option.classList.add("select2-results__option--disabled");
                    option.setAttribute("aria-disabled", true);
                });
            }
        };
    },
    null,
    true
);

// Когда печатаем в поле поиска, выделяем не выбранный элемент, а первый в списке.
$.fn.select2.amd.require(
    ["select2/core"],
    function (Select2) {
        const originalRegisterEvents = Select2.prototype._registerEvents;

        Select2.prototype._registerEvents = function () {
            const self = this;
            originalRegisterEvents.apply(this, arguments);

            this.listeners["query"].pop();

            this.on("query", params => {
                if (!self.isOpen()) {
                    self.trigger("open", {});
                }

                this.dataAdapter.query(params, data => {
                    self.trigger("results:all", {
                        data: data,
                        query: params,
                        searching: true
                    });
                });
            });
        };
    },
    null,
    true
);

$.fn.select2.amd.require(
    ["select2/results"],
    function (Results) {
        const originalBind = Results.prototype.bind;

        Results.prototype.bind = function (container, $container) {
            const self = this;
            originalBind.apply(this, arguments);

            container.listeners["results:all"].pop();

            container.on("results:all", function (params) {
                self.clear();
                self.append(params.data);

                if (container.isOpen()) {
                    self.setClasses();

                    if (params.searching) {
                        const $options = this.$results.find(".select2-results__option--selectable");
                        $options.first().trigger("mouseenter");
                    } else {
                        self.highlightFirstItem();
                    }
                }
            });
        };
    },
    null,
    true
);

// Для виджета с поддержкой множественных значений нажатие backspace
// должен удалять весь пункт целиком, а не начинать его редактирование.
$.fn.select2.amd.require(
    ["select2/selection/search"],
    function (Search) {
        const oldRemoveChoice = Search.prototype.searchRemoveChoice;

        Search.prototype.searchRemoveChoice = function () {
            oldRemoveChoice.apply(this, arguments);
            if (!this.options.get("tags")) {
                this.$search.val("");
            }
        };
    },
    null,
    true
);

// Патч Select2, благодаря которому кнопка очищения селекта реагирует
// не на все кнопки мыши, а только на левую.
$.fn.select2.amd.require(
    ["select2/selection/allowClear"],
    function (AllowClear) {
        const oldHandleClear = AllowClear.prototype._handleClear;

        AllowClear.prototype._handleClear = function (_, evt) {
            if (evt.type === "mousedown" && evt.button !== 0) {
                return;
            }
            oldHandleClear.apply(this, arguments);
        };
    },
    null,
    true
);

// Отключено открытие списка при очистке.
$.fn.select2.amd.require(
    ["select2/selection/allowClear"],
    function (AllowClear) {
        const oldHandleClear = AllowClear.prototype._handleClear;

        AllowClear.prototype._handleClear = function (_, evt) {
            const originalTrigger = this.trigger;

            // mock
            this.trigger = function (name, args) {
                if (name !== "toggle") {
                    originalTrigger.call(this, name, args);
                }
            };

            oldHandleClear.apply(this, arguments);
            this.trigger = originalTrigger;
        };
    },
    null,
    true
);

// Добавление функционала кэширования Ajax-ответов когда указана опция ajaxCache.
$.fn.select2.amd.require(
    ["select2/data/ajax"],
    function (AjaxAdapter) {
        const originalQuery = AjaxAdapter.prototype.query;

        const cacheDefaults = {
            size: 10
        };

        AjaxAdapter.prototype.query = function (params, callback) {
            const self = this;

            let ajaxCacheOptions = this.options.get("ajaxCache");
            if (typeof ajaxCacheOptions === "object" && ajaxCacheOptions !== null) {
                ajaxCacheOptions = $.extend({}, cacheDefaults, ajaxCacheOptions);
            } else if (ajaxCacheOptions) {
                ajaxCacheOptions = cacheDefaults;
            } else {
                originalQuery.apply(this, arguments);
                return;
            }

            if (typeof this.__cache === "undefined") {
                this.__cache = {};
            }

            const __cachekey = (params.term || "_ALL_") + ":" + (params.page || -1).toString();

            if (typeof this.__cache[__cachekey] !== "undefined") {
                const cacheRecord = this.__cache[__cachekey];
                cacheRecord.timestamp = Date.now();
                callback(cacheRecord.data);
            } else {
                originalQuery.call(this, params, results => {
                    if (Object.keys(self.__cache).length >= ajaxCacheOptions.size) {
                        removeOldestRecord(self.__cache);
                    }

                    self.__cache[__cachekey] = {
                        data: results,
                        timestamp: Date.now()
                    };
                    callback(results);
                });
            }
        };

        function removeOldestRecord(cache) {
            let targetKey = null;
            let minimalTimestamp = null;

            // search oldest record
            Object.entries(cache).forEach(([key, value]) => {
                if (minimalTimestamp === null || value.timestamp < minimalTimestamp) {
                    targetKey = key;
                    minimalTimestamp = value.timestamp;
                }
            });

            if (targetKey !== null) {
                delete cache[targetKey];
            }
        }
    },
    null,
    true
);

// Исправление ситуации, когда выпадающий список прыгает вверх-вниз
// и сдвигается вбок, т.к. то создаёт скроллбар, то нет.
$.fn.select2.amd.require(
    ["select2/dropdown/attachBody"],
    function (AttachBody) {
        const oldPositionDropdown = AttachBody.prototype._positionDropdown;

        AttachBody.prototype._positionDropdown = function () {
            this.$dropdownContainer.css({
                position: "absolute",
                top: -999999
            });
            oldPositionDropdown.apply(this, arguments);
        };
    },
    null,
    true
);
