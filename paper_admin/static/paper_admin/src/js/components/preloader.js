import {Modal} from "bootstrap";


const TEMPLATE = `
        <div class="preloader modal" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-sm" role="document">
            <div class="modal-content">
              <div class="modal-body">
                <div class="text-center">
                  <i class="spinner-border spinner-border-sm text-info mr-1" 
                     role="status" aria-hidden="true"></i>&nbsp;Loading...
                </div>
              </div>
            </div>
          </div>
        </div>
    `;


/**
 * @type {?Modal}
 */
let modal = null;


/**
 * Show modal
 *
 * @returns {Promise}
 */
function showPreloader() {
    if (modal !== null) {
        return Promise.resolve();
    }

    document.body.insertAdjacentHTML('beforeend', TEMPLATE);
    modal = new Modal(document.body.lastElementChild, {
        keyboard: false,
        backdrop: 'static'
    });

    modal.show();
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, 150)
    });
}


/**
 * Hide modal
 *
 * @returns {Promise}
 */
function hidePreloader() {
    if (modal !== null) {
        modal.hide();
        modal._element.remove();
        modal.dispose();
        modal = null;
    }
    return Promise.resolve();
}


const preloader = {
    show: showPreloader,
    hide: hidePreloader
};
export default preloader;

// share plugin
window.paperAdmin = window.paperAdmin || {};
Object.assign(window.paperAdmin, {
    preloader,
});
