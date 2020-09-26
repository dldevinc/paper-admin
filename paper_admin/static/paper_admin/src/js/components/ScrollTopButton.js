import gsap from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);


function ScrollTopButton(options) {
    this.opts = Object.assign({
        buttonId: 'scrollTopButton',
        iconClassName: 'fa fa-chevron-up',
        minOffset: 200,
        showCssClass: 'show'
    }, options);

    let icon = document.createElement('i');
    icon.className = this.opts.iconClassName;

    this.button = document.createElement('div');
    this.button.id = this.opts.buttonId;
    this.button.appendChild(icon);
    this.button.addEventListener('click', function() {
        gsap.to(window, {duration: 0.5, scrollTo: {
            y: 0
        }});
    });

    document.body.appendChild(this.button);

    // events
    window.addEventListener('scroll', this.update.bind(this));
    this.update();
}

ScrollTopButton.prototype.update = function() {
    this.button.classList.toggle(this.opts.showCssClass, window.pageYOffset >= this.opts.minOffset);
};


export default ScrollTopButton;
