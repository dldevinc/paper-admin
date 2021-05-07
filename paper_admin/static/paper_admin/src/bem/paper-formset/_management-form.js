const TOTAL_FORMS_SELECTOR = "input[name$=\"-TOTAL_FORMS\"]";
const INITIAL_FORMS_SELECTOR = "input[name$=\"-INITIAL_FORMS\"]";
const MIN_NUM_FORMS_SELECTOR = "input[name$=\"-MIN_NUM_FORMS\"]";
const MAX_NUM_FORMS_SELECTOR = "input[name$=\"-MAX_NUM_FORMS\"]";


class ManagementForm {
    constructor(root) {
        this.root = root;
    }

    get totalForms() {
        const input = this.root.querySelector(TOTAL_FORMS_SELECTOR);
        return parseInt(input.value.toString())
    }

    set totalForms(value) {
        let intValue = parseInt(value);
        if (isNaN(intValue) || (intValue < 0)) {
            throw new Error(`Invalid value: ${value}`);
        }

        const input = this.root.querySelector(TOTAL_FORMS_SELECTOR);
        input.value = intValue;
    }

    get initialForms() {
        const input = this.root.querySelector(INITIAL_FORMS_SELECTOR);
        return parseInt(input.value.toString())
    }

    set initialForms(value) {
        let intValue = parseInt(value);
        if (isNaN(intValue) || (intValue < 0)) {
            throw new Error(`Invalid value: ${value}`);
        }

        const input = this.root.querySelector(INITIAL_FORMS_SELECTOR);
        input.value = intValue;
    }

    get minForms() {
        const input = this.root.querySelector(MIN_NUM_FORMS_SELECTOR);
        if (input) {
            return parseInt(input.value.toString())
        } else {
            return 0;
        }
    }

    set minForms(value) {
        let intValue = parseInt(value);
        if (isNaN(intValue) || (intValue < 0)) {
            throw new Error(`Invalid value: ${value}`);
        }

        const input = this.root.querySelector(MIN_NUM_FORMS_SELECTOR);
        input.value = intValue;
    }

    get maxForms() {
        const input = this.root.querySelector(MAX_NUM_FORMS_SELECTOR);
        if (input) {
            return parseInt(input.value.toString())
        } else {
            return Infinity;
        }
    }

    set maxForms(value) {
        let intValue = parseInt(value);
        if (isNaN(intValue) || (intValue < 0)) {
            throw new Error(`Invalid value: ${value}`);
        }

        const input = this.root.querySelector(MAX_NUM_FORMS_SELECTOR);
        input.value = intValue;
    }
}

export default ManagementForm;
