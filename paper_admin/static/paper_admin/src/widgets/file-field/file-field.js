import bsCustomFileInput from 'bs-custom-file-input';

import "./file-field.scss";


$(document).ready(function () {
    bsCustomFileInput.init(".file-field input[type=\"file\"]");
});
