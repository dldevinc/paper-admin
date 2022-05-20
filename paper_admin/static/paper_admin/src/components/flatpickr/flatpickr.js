import flatpickr from "flatpickr";
import FlatpickrLanguages from "flatpickr/dist/l10n";

import "./flatpickr.scss";

/*
    Карта соответствия формата даты и языка.

    Для русского языка Django выводит в виджет дату в формате "d.m.Y".
    Библиотека flatpickr по умолчанию использует формат "Y-m-d" и не меняет его
    через локализацию. Из-за этого любая дата превращается виджетом в 1 января.

    В карте перечислены только те языки, для которых настройка DATE_INPUT_FORMATS
    не содержит в качестве первого значения "Y-m-d".

    https://github.com/flatpickr/flatpickr/issues/1612
 */
const dateFormats = {
    az: "d.m.Y",
    bn: "d/m/Y",
    ca: "d/m/Y",
    cs: "d.m.Y",
    cy: "d/m/Y",
    da: "d.m.Y",
    de: "d.m.Y",
    el: "d/m/Y",
    en_au: "d/m/Y",
    en_gb: "d/m/Y",
    es: "d/m/Y",
    fi: "d.m.Y",
    fr: "d/m/Y",
    hu: "Y.m.d.",
    id: "d-m-y",
    it: "d/m/Y",
    mk: "d.m.Y",
    nl: "d-m-Y",
    pl: "d.m.Y",
    pt_br: "d/m/Y",
    ro: "d.m.Y",
    ru: "d.m.Y",
    sk: "d.m.Y",
    sl: "d.m.Y",
    sr: "d.m.Y",
    th: "d/m/Y",
    tr: "d/m/Y",
    uk: "d.m.Y",
    zh_hans: "Y/m/d",
    zh_hant: "Y/m/d"
};

export { flatpickr, FlatpickrLanguages, dateFormats };
