import whenDomReady from "when-dom-ready";
import emitters from "../emitters";
import urlify from "./urlify";


function prepopulate(field, dependencies, maxLength, allowUnicode) {
    const populate = function() {
        if (field.dataset._changed === '1') {
            if (field.value) {
                return
            } else {
                field.dataset._changed = '0';
            }
        }

        const values = dependencies.map(function(dependency) {
            return dependency.value;
        }).filter(Boolean);

        field.value = urlify(values.join(' '), maxLength, allowUnicode);
    };

    field.dataset._changed = '0';
    field.addEventListener('change', function() {
        field.dataset._changed = '1';
    });

    const value = field.value;
    if (!value) {
        dependencies.forEach(function(dependency_field) {
            dependency_field.addEventListener('keyup', populate);
            dependency_field.addEventListener('change', populate);
            dependency_field.addEventListener('focus', populate);
        });
    }
}

if (window.django_prepopulated_fields && window.django_prepopulated_fields.length) {
    whenDomReady(function() {
        for (let record of window.django_prepopulated_fields) {
            const field = document.getElementById(record.id);
            const dependencies = record.dependency_ids.map(function(id) {
                return document.getElementById(id);
            }).filter(Boolean);

            if (dependencies.length) {
                field.classList.add('prepopulated-field');
                if (field.closest('.empty-form')) {
                    field.dataset.dependency_list = JSON.stringify(record.dependency_list);
                    field.dataset.maxLength = record.maxLength;
                    field.dataset.allowUnicode = Number(record.allowUnicode).toString();
                } else {
                    prepopulate(field, dependencies, record.maxLength, record.allowUnicode);
                }
            }
        }
    });

    emitters.inlines.on('added', function(row, prefix) {
        row.querySelectorAll('.prepopulated-field').forEach(function(field) {
            const dependency_list = JSON.parse(field.dataset.dependency_list);
            const dependencies = dependency_list.map(function(field_name) {
                return row.querySelector('.field-' + field_name + ' [name$="-' + field_name + '"]');
            }).filter(Boolean);

            if (dependencies.length) {
                prepopulate(
                    field,
                    dependencies,
                    Number(field.dataset.maxLength),
                    Boolean(Number(field.dataset.allowUnicode))
                );
            }
        });
    });
}
