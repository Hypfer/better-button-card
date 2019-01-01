const COLOR_STYLES = {
    BACKGROUND: "background",
    ICON: "icon"
};

const ACTIONS = {
    TOGGLE: "toggle",
    MORE_INFO: "more_info",
    SERVICE: "service"
};

const HELPERS = {
    getColorForState: function (state, config) {
        let color = config.fallback_color;

        if (state) {
            const stateColor = config.colors_by_state[state.state];

            if (stateColor) {
                if (stateColor === 'auto') {
                    // noinspection JSUnresolvedVariable
                    color = state.attributes.rgb_color ? `rgb(${state.attributes.rgb_color.join(',')})` : config.fallback_color;
                } else {
                    color = stateColor;
                }
            }
        }

        return color;
    },

    getFontColorBasedOnBackgroundColor: function (backgroundColor) {
        const parsedRgbColor = backgroundColor.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        const parsedBackgroundColor = parsedRgbColor ? parsedRgbColor : this.hexToRgb(backgroundColor.substring(1));
        let fontColor = ''; // don't override by default
        if (parsedBackgroundColor) {
            // Counting the perceptive luminance - human eye favors green color...
            const luminance = (0.299 * parsedBackgroundColor[1] + 0.587 * parsedBackgroundColor[2] + 0.114 * parsedBackgroundColor[3]) / 255;
            if (luminance > 0.5) {
                fontColor = 'rgb(62, 62, 62)'; // bright colors - black font
            } else {
                fontColor = 'rgb(234, 234, 234)';// dark colors - white font
            }
        }
        return fontColor;
    },

    hexToRgb: function (hex) {
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return [r, g, b];
    },

    buildIcon(state, config) {
        let iconOff = config.icon;

        if (config.icon === 'attribute') {
            if (state) {
                return state.attributes.icon;
            }
            return iconOff;
        }
        return iconOff;
    }
};


class BetterButtonCard extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    /**
     *
     * @param config {object}
     * @param [config.title] {string}
     * @param [config.entity] {string}
     * @param [config.icon] {string}
     * @param [config.size] {string}
     * @param [config.fallback_color] {string}
     *
     * @param [config.colors_by_state] {object}
     * @param [config.colors_by_state.off] {string} //example. Can be a string or "auto" to pull from state
     *
     * @param [config.name] {string}
     * @param [config.show_state_label] {boolean}
     * @param [config.color_style] {COLOR_STYLES}
     * @param [config.style] custom CSS as seen in button-card
     *
     * @param [config.action] {ACTIONS}
     *
     * @param [config.service] {object}
     * @param config.service.domain {string}
     * @param config.service.action {string}
     * @param config.service.data {object}
     */
    setConfig(config) {
        const root = this.shadowRoot;
        try { //This happens on invalid configs
            if (root.lastChild) root.removeChild(root.lastChild);
        } catch(e) {}


        //Defaults
        this._config = Object.assign({
            size: "40%",
            colors_by_state: {},
            fallback_color: "var(--primary-text-color)", //Default color if there is no state defined or auto returns something useless
            name: "",
            show_state_label: true,
            color_style: COLOR_STYLES.BACKGROUND
        }, config);

        this._config.colors_by_state = Object.assign({
            off: "var(--disabled-text-color)",
            on: "auto",
            unavailable: "yellow"
        }, config.colors_by_state);

        this._config.card_style = '';

        if (config.style) {
            config.style.forEach((cssObject) => {
                const attribute = Object.keys(cssObject)[0];
                const value = cssObject[attribute];
                this._config.card_style += `${attribute}: ${value};`;
            });
        }

        const card = document.createElement('ha-card');
        this.content = document.createElement('div');
        const style = document.createElement('style');
        style.textContent = `
            .button-card-icon {
                display: flex;
                margin: auto;
            }
             
            .button-card-button {
                display: flex;
                margin: auto;
                text-align: center;
            }
            
            .button-card-button-not-a-button {
                cursor: default;
            }
            
            ha-card {
                height: 100%;
            }
          `;

        this.content.id = "container";
        this._config.title ? card.header = this._config.title : null;
        card.appendChild(this.content);
        card.appendChild(style);
        card.addEventListener("click", this.handleClick.bind(this));

        root.appendChild(card);
    }

    set hass(hass) {
        this.state = hass.states[this._config.entity];
        this._hass = hass;

        if (this.content && this._config) {
            this.render(this.state)
        }
    }

    render(state) {
        //clear Element
        try { //This happens on invalid configs
            while (this.content.firstChild) {
                this.content.removeChild(this.content.firstChild);
            }
        } catch (e) {}
        this.content.style.cssText = "";
        this.content.removeAttribute("class"); //TODO is this needed? maybe


        //Render new
        const color = HELPERS.getColorForState(state, this._config);
        const fontColor = HELPERS.getFontColorBasedOnBackgroundColor(color);


        if (this._config.color_style === COLOR_STYLES.BACKGROUND) {
            this.content.style.cssText = `color: ${fontColor}; background-color: ${color}; ${this._config.card_style};`;
        } else {
            this.content.style.cssText = `${this._config.card_style}`;
        }


        const buttonElem = document.createElement("paper-button");
        buttonElem.classList.add("button-card-button");

        //No click ripple for cards with no entities
        if(this._config.entity === undefined) {
            buttonElem.setAttribute('noink', '');
            buttonElem.classList.add("button-card-button-not-a-button");
        }

        this.content.appendChild(buttonElem);

        const buttonContentContainer = document.createElement(("div"));

        if (this._config.icon) {
            const iconElem = document.createElement("ha-icon");
            iconElem.classList.add("button-card-icon");
            iconElem.style.cssText = `width: ${this._config.size}; height: ${this._config.size};`; //TODO: both?

            if(this._config.color_style === COLOR_STYLES.ICON) {
                iconElem.style.cssText += `color: ${color}`
            }

            iconElem.setAttribute("icon", this._config.icon);
            buttonContentContainer.appendChild(iconElem);
        }

        if (this._config.name) {
            const nameElem = document.createElement("span");
            nameElem.innerText = this._config.name;

            buttonContentContainer.appendChild(nameElem);
        }

        if (this._config.show_state_label && this._config.entity && state) {
            const stateElem = document.createElement("span");

            if(state) {
                // noinspection JSUnresolvedVariable
                stateElem.innerText = `${state.state} ${state.attributes.unit_of_measurement ? state.attributes.unit_of_measurement : ''}`;
            } else {
                stateElem.innerText = "unknown";
            }


            buttonContentContainer.appendChild(stateElem);
        }

        buttonElem.appendChild(buttonContentContainer);

    }

    handleClick() {
        if(this._config.entity) {
            switch(this._config.action) {
                case ACTIONS.MORE_INFO:
                    const event = new Event("hass-more-info", {
                        bubbles: true,
                        cancelable: false,
                        composed: true
                    });

                    event.detail = {
                        entityId: this._config.entity
                    };

                    this.shadowRoot.dispatchEvent(event);
                    break;

                case ACTIONS.SERVICE:
                    this._hass.callService(
                        this._config.service.domain,
                        this._config.service.action,
                        this._config.service.data
                    );
                    break;

                case ACTIONS.TOGGLE:
                default:
                    this._hass.callService("homeassistant", "toggle", {
                        entity_id: this._config.entity,
                    })
            }
        }
    }

    // noinspection JSMethodCanBeStatic
    getCardSize() {
        return 3;
    }
}

customElements.define('better-button-card', BetterButtonCard);
