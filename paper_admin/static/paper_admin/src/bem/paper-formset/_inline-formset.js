import anime from "animejs";
import Formset from "./_formset.js";

class InlineFormset extends Formset {
    constructor(root) {
        super(root);
        this._isTransitioning = false;
    }

    get isTabular() {
        return this.root.classList.contains("paper-formset--tabular");
    }

    setAddFormButtonState(button, state) {
        // отключение кнопок во время анимации
        const finalState = !this._isTransitioning && state;
        super.setAddFormButtonState(button, finalState);
        button.classList.toggle("disabled", !finalState);
    }

    setDeleteFormButtonState(button, state) {
        // отключение кнопок во время анимации
        const finalState = !this._isTransitioning && state;
        super.setDeleteFormButtonState(button, finalState);
        button.classList.toggle("disabled", !finalState);
    }

    setSortFormButtonState(button, state) {
        // отключение кнопок во время анимации
        const finalState = !this._isTransitioning && state;
        super.setSortFormButtonState(button, finalState);
        button.classList.toggle("disabled", !finalState);
    }

    addForm() {
        this._isTransitioning = true;
        const form = super.addForm();

        // Animation
        const onAddCallback = () => {
            this._isTransitioning = false;
            this.updateButtonsState();

            // For backwards compatibility with Django < 4.1.
            $(document).trigger("formset:added", [$(form), this.prefix]);

            form.dispatchEvent(new CustomEvent("formset:added", {
                bubbles: true,
                detail: {
                    formsetName: this.prefix
                }
            }));
        };

        const animationOptions = {
            targets: form,
            direction: "reverse",
            easing: "easeInOutSine"
        };

        if (this.isTabular) {
            form.style.willChange = "opacity";
            animationOptions.duration = 200;
            animationOptions.opacity = 0;
            animationOptions.complete = () => {
                form.style.opacity = "";
                onAddCallback();
            };
        } else {
            form.style.willChange = "height";
            animationOptions.duration = 300;
            animationOptions.height = 0;
            animationOptions.complete = () => {
                form.style.height = "";
                onAddCallback();
            };
        }

        anime(animationOptions);
        return form;
    }

    deleteForm(form) {
        if (this.management_form.totalForms <= this.management_form.minForms) {
            throw new Error("Minimum number of forms is reached");
        }

        this.management_form.totalForms--;

        // Устанавливаем корректные индексы форм, не дожидаясь анимаций.
        this.setFormIndex(form, this.management_form.totalForms);
        this.updateFormIndexes(form);

        // Устанавливаем корректную сортировку форм, не дожидаясь анимаций.
        this.updateFormOrder(form);

        // Animation
        this._isTransitioning = true;
        this.updateButtonsState();

        const animationOptions = {
            targets: form,
            easing: "easeInOutSine",
            complete: () => {
                form.remove();

                this._isTransitioning = false;
                this.updateButtonsState();

                // For backwards compatibility with Django < 4.1.
                $(document).trigger("formset:removed", [$(form), this.prefix]);

                document.dispatchEvent(new CustomEvent("formset:removed", {
                    detail: {
                        formsetName: this.prefix
                    }
                }));
            }
        };

        if (this.isTabular) {
            form.style.willChange = "opacity";
            animationOptions.duration = 200;
            animationOptions.opacity = 0;
        } else {
            form.style.willChange = "height";
            animationOptions.duration = 300;
            animationOptions.height = 0;
        }

        anime(animationOptions);
    }

    moveFormUp(form) {
        const formIndex = this.getFormIndex(form);
        if (formIndex === 0) {
            throw new Error("the form is first already");
        }

        const previousForm = this.getForms()[formIndex - 1];
        this._swapForms(previousForm, form, "up");
    }

    moveFormDown(form) {
        const formCount = this.getForms().length;
        const formIndex = this.getFormIndex(form);
        if (formIndex === formCount - 1) {
            throw new Error("the form is last already");
        }

        const nextForm = this.getForms()[formIndex + 1];
        this._swapForms(form, nextForm, "down");
    }

    /**
     * Меняет местами формы form1 и form2.
     * Порядок указания форм должен совпадать с их порядком в DOM, т.е. form1
     * должна быть выше form2.
     * @param {HTMLElement} form1
     * @param {HTMLElement} form2
     * @param {string} direction
     * @private
     */
    _swapForms(form1, form2, direction) {
        const initialRect1 = form1.getBoundingClientRect();
        const initialRect2 = form2.getBoundingClientRect();

        // TIP: при изменении форм местами может проскроллиться страница
        // (возможно из-за фокуса). Это внесет ошибку в дальнейшие рассчеты.
        // Поэтому фиксируем вертикальное расположение окна браузера.
        const currentPageOffset = window.scrollY;
        form2.after(form1);
        window.scrollTo(0, currentPageOffset);

        const swappedRect1 = form1.getBoundingClientRect();
        const swappedRect2 = form2.getBoundingClientRect();

        this.updateFormIndexes();
        this.updateFormOrder();

        // Имитация начального расположения форм с помощью CSS-трансформаций.
        this.formContainer.style.transformStyle = "preserve-3d";
        form1.style.willChange = "transform";
        form2.style.willChange = "transform";
        if (direction === "up") {
            form1.style.transform = `translateY(${initialRect1.top - swappedRect1.top}px)`;
            form2.style.transform = `translateY(${initialRect2.top - swappedRect2.top}px) translateZ(1px)`;
        } else {
            form1.style.transform = `translateY(${initialRect1.top - swappedRect1.top}px) translateZ(1px)`;
            form2.style.transform = `translateY(${initialRect2.top - swappedRect2.top}px)`;
        }

        // Animation
        this._isTransitioning = true;
        this.updateButtonsState();

        const tl = anime
            .timeline({
                duration: this.isTabular ? 250 : 500,
                easing: "easeOutQuad",
                complete: () => {
                    this._isTransitioning = false;
                    this.updateButtonsState();
                    this.formContainer.style.transformStyle = "";
                }
            })
            .add({
                targets: form1,
                translateY: 0,
                complete: () => {
                    form1.style.transform = "";
                }
            })
            .add(
                {
                    targets: form2,
                    translateY: 0,
                    complete: () => {
                        form2.style.transform = "";
                    }
                },
                0
            );

        // Перемещение окна вместе с формой.
        let finalPageOffset;
        let preventScroll;
        if (direction === "up") {
            finalPageOffset = currentPageOffset + (swappedRect2.top - initialRect2.top);
            preventScroll = initialRect2.top > 0.5 * window.innerHeight && swappedRect2.top > 0.5 * window.innerHeight;
        } else {
            finalPageOffset = currentPageOffset + (swappedRect1.top - initialRect1.top);
            preventScroll = initialRect1.top < 0.5 * window.innerHeight && swappedRect1.top < 0.5 * window.innerHeight;
        }

        if (!preventScroll) {
            tl.add(
                {
                    targets: document.documentElement,
                    scrollTop: Math.max(0, finalPageOffset)
                },
                0
            );
        }
    }

    setFormOrder(form, value) {
        super.setFormOrder(form, value);

        const input = form.querySelector(".paper-formset__order");
        if (input) {
            input.value = value;
        }
    }

    setFormIndex(form, index) {
        const currentFormIndex = parseInt(form.dataset.formsetIndex);
        super.setFormIndex(form, index);

        if (currentFormIndex !== index) {
            form.dispatchEvent(new CustomEvent("formset:setindex", {
                bubbles: true,
                detail: {
                    formsetName: this.prefix,
                    index: index
                }
            }));
        }

        // Обновление индекса в заголовке stacked-формы.
        const caption = form.querySelector(".paper-formset__form-caption");
        if (caption) {
            caption.innerHTML = caption.innerHTML.replace(/#(\d+|__prefix__)/g, "#" + (index + 1));
        }

        // Обновление кнопки удаления
        const deleteFormButton = form.querySelector('[data-formset-toggle="delete"]');
        if (deleteFormButton && deleteFormButton.dataset.formsetForm) {
            const regex = new RegExp("(" + this.prefix + "-(\\d+|__prefix__))");
            const replacement = this.prefix + "-" + index;
            const formId = deleteFormButton.dataset.formsetForm.replace(regex, replacement);
            deleteFormButton.setAttribute("data-formset-form", formId);
        }
    }
}

export default InlineFormset;
