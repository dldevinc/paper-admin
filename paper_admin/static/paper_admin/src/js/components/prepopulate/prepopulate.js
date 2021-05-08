/*
    Новый prepopulate-функционал работает не только на формах создания,
    но и на формах редактирования. Для включения автозаполнения необходимо
    удалить текущее значения поля, а затем перевести фокус (или изменить)
    одно из полей, из которых заполняется поле.
 */

import emitters from "js/utilities/emitters";
import urlify from "js/components/prepopulate/urlify";


function initPrepopulation(root = document.body) {
    root.querySelectorAll(".prepopulated-field").forEach(function(widget) {
        let config;
        const formset = widget.closest(".paper-formset");
        if (formset) {
            const formsetPrefix = formset.dataset.formsetPrefix;
            config = window.django_prepopulated_fields[formsetPrefix];
        } else {
            config = window.django_prepopulated_fields[""];
        }

        if (!config) {
            return
        }

        const fieldName = widget.dataset.prepopulateFieldName;
        const fieldConfig = config[fieldName];
        if (!fieldConfig) {
            return
        }

        // поиск автозаполняемого поля формы
        const prepopulatedField = widget.querySelector("[name$=" + fieldName + "]");
        if (!prepopulatedField) {
            return
        }

        // поиск полей, от которых зависит текущее поле
        const dependencies = fieldConfig.dependencies.map(function(name) {
            const dependencyFieldName = prepopulatedField.name.replace(new RegExp(fieldName + "$"), name);
            return document.querySelector("[name=" + dependencyFieldName + "]");
        }).filter(Boolean);

        if (!dependencies.length) {
            return;
        }

        // автозаполнение поля
        const populate = function() {
            // Bail if the field's value has been changed by the user
            if (prepopulatedField.dataset._changed === "1") {
                return;
            }

            const values = dependencies.map(function(dependency) {
                return dependency.value;
            }).filter(Boolean);

            prepopulatedField.value = urlify(values.join(" "), fieldConfig.maxLength, fieldConfig.allowUnicode);
        }

        const toggleAutocomplete = function() {
            if (prepopulatedField.value) {
                prepopulatedField.dataset._changed = "1";
            } else {
                prepopulatedField.dataset._changed = "0";
            }
        }

        prepopulatedField.addEventListener("change", toggleAutocomplete);
        toggleAutocomplete();

        dependencies.forEach(function(dependencyField) {
            dependencyField.addEventListener("keyup", populate);
            dependencyField.addEventListener("change", populate);
            dependencyField.addEventListener("focus", populate);
        });
    });
}


initPrepopulation();
emitters.inlines.on("added", function(form, prefix) {
    initPrepopulation(form);
});
