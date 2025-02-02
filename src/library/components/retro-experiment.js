import
{
    LitElement,
    html,
    css
} from "lit";

import
{
    createRef,
    ref
} from "lit/directives/ref.js";

import { Colors } from "Library/utilities.js";

/**
 * Component responsible for displaying experiment information, ouput and configuration options.
 *
 * Basically, a form control component that simplifies definition and usage of various input fields,
 * while also styling experiment output in the form of canvas, image or similar.
 *
 * @usage
 * const retroExperimentControl = document.createElement( "retro-experiment" );
 *
 * // Define controls, actions
 * retroExperiment.controls =
 * {
 *     "name"  : "Label",
 *     "start" : { style : "accent", label : "Start the animation" }
 * }
 * 
 * // Define configuration options and their types, including options for each type
 * retroExperiment.configuration =
 * [
 *     {
 *         key     : "title"
 *         type    : "text",
 *         label   : "Title",
 *         value   : defaultOptions.title
 *     },
 *     {
 *         key     : "scaleDownFactor"
 *         type    : "range",
 *         options : { min : 2, max : 128 },
 *         label   : "Factor",
 *         value   : defaultOptions.scaleDownFactor
 *     },
 *     {
 *         key     : "noiseColor",
 *         type    : "color",
 *         label   : "Noise color",
 *         value   : JSON.stringify( defaultOptions.noiseColor )
 *     }
 * ];
 * 
 * // Read configuration values to get user input
 * retroExperiment.values === [ { key : "key name", value : Value }, ... ];
 *
 * // Value object for type === "color"
 * { r, g, b }, where each value is an integer between 0-255
 *
 * // Hide placeholder after the first run
 * retroExperiment.showPlaceholder = false;
 *
 * // Listen for control actions
 * retroExperiment.addEventListener( "controlClicked", ev =>
 * {
 *     console.log( "ev.detail contains key from retroExperiment.controls", ev.detail );
 * });
 *
 * // Listen for configuration changes
 * retroExperiment.addEventListener( "configurationChanged", ev =>
 * {
 *     console.log( "ev.detail contains key from retroExperiment.values", ev.detail );
 * });
 *
 * // Set "disabled" attribute to put component in the loading state and block user interaction
 * retroExperiment.setAttribute( "disabled", "disabled" );
 *
 * // Enable the component by removing the attribute
 * retroExperiment.removeAttribute( "disabled" );
 */
export class RetroExperiment extends LitElement
{
    static properties =
    {
        controls :
        {
            attribute : false
        },
        configuration :
        {
            attribute : false
        },
        showPlaceholder :
        {
            attribute : false,
            type      : Boolean
        },
        values :
        {
            attribute : false
        }
    }

    static styles = css`
        *
        {
            box-sizing : border-box;
        }

        :host
        {
            position        : relative;

            width           : 100%;
            height          : auto;
            margin-bottom   : var(--style-grid-full);

            border          : var(--style-line-width-light) solid var(--style-color-border);

            --sidebar-width : 280px;
        }

        :host(:last-child)
        {
            margin-bottom : 0;
        }

        /**
         * Disabled state
         */
        :host input,
        :host button
        {
            opacity    : 1;
            transition : opacity var(--transition-duration-short) ease-in-out;
        }

        :host([disabled="disabled"]) input,
        :host([disabled="disabled"]) button
        {
            opacity        : 0.5;
            cursor         : default;
            pointer-events : none;
        }

        :host([disabled="disabled"]) .output .processing
        {
            display : block;
        }

        /**
         * Layout
         */
        :host
        {
            display        : flex;
            flex-direction : column;
        }

        .information,
        .configuration
        {
            width   : 100%;
            padding : var(--style-grid-full);
        }

        .output
        {
            width        : calc(100% - 2 * var(--style-grid-full));
            margin       : 0 var(--style-grid-full);
            aspect-ratio : 16 / 9;
        }

        @media only screen and (min-width: 1024px)
        {
            :host
            {
                flex-direction  : row;
                flex-wrap       : wrap;
                justify-content : space-between;
            }

            .information,
            .configuration
            {
                width : var(--sidebar-width);
            }

            .output
            {
                width  : calc(100% - 2 * var(--sidebar-width));
                margin : var(--style-grid-full) 0;
            }
        }

        /**
         * Information section
         */
        .information
        {}

        .information slot[name="description"]
        {
            font-size : var(--style-font-size-small);
        }

        .information .controls
        {
            display         : flex;
            justify-content : space-between;
        }

        .information .controls button
        {
            width  : calc(50% - var(--style-grid-half));
            height : auto;
        }

        @media only screen and (min-width: 1024px)
        {
            .information .controls
            {
                display : block;
            }

            .information .controls button
            {
                width      : 100%;
                margin-top : var(--style-grid-half);
            }
        }

        .information button
        {
            margin         : 0;
            padding        : 0 var(--style-grid-full);

            font-family    : var(--style-font-family-content);
            font-weight    : var(--style-font-weight-normal);
            font-size      : var(--style-font-size-text);
            line-height    : var(--style-grid-full);
            text-transform : uppercase;

            color          : var(--style-color-light-highlight);
            background     : var(--style-color-button);
            border         : none;
            border-radius  : 0;
            box-shadow     : 4px 4px 0 0 var(--style-color-border);
            cursor         : pointer;

            transition     : box-shadow var(--transition-duration-short) ease-in-out,
                             transform  var(--transition-duration-short) ease-in-out;
        }

        .information button[data-style="accent"]
        {
            color      : var(--style-color-dark);
            background : var(--style-color-accent);
            box-shadow : 4px 4px 0 0 var(--style-color-accent-faded);
        }

        .information button:active,
        .information button[data-style="accent"]:active
        {
            transform : translate(2px, 2px);
        }

        .information button:active
        {
            box-shadow : 0 0 0 0 var(--style-color-border);
        }

        .information button[data-style="accent"]:active
        {
            box-shadow : 0 0 0 0 var(--style-color-accent-faded);
        }

        .information button[disabled="disabled"]
        {
            opacity : 0.5;
        }

        /**
         * Output section
         */
        .output
        {
            position        : relative;

            display         : flex;
            align-items     : center;
            justify-content : center;
            height          : auto;

            border          : var(--style-line-width-light) solid var(--style-color-border);
            background      : url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAACdJREFUKFNjzMnp+8+ABLi5uZC5DIx0UFBePgPFDV+/fkN1A+0VAABcJh+xpeSIQQAAAABJRU5ErkJggg==) repeat;
        }

        .output ::slotted(img)
        {
            display    : block;
            width      : auto;
            height     : auto;
            max-width  : 100%;
            max-height : 100%;
        }

        .output ::slotted(canvas)
        {
            width  : 100%;
            height : 100%;
        }

        .output slot[name="placeholder"],
        .output .processing
        {
            position   : absolute;
            top        : 50%;
            left       : 0;
            right      : 0;

            display    : none;
            margin     : 0;
            text-align : center;
            transform  : translateY(-50%);
        }

        .output[data-placeholder="true"] slot[name="placeholder"]
        {
            display : block;
        }

        /**
         * Configuration section
         */
        .configuration
        {}

        .configuration .value
        {
            display       : block;
            margin-bottom : var(--style-grid-half);
        }

        .configuration .value label
        {
            display   : block;
            width     : 100%;
            font-size : var(--style-font-size-small);
        }

        .configuration .value label::before
        {
            content     : ":=";

            display     : inline-block;
            padding     : 0 3px 0 0;
            font-weight : var(--style-font-weight-strong);
            color       : var(--style-color-interactive);
        }

        .configuration .value.color
        {
            position : relative;
        }

        .configuration .value.color [data-color]
        {
            display    : block;
            width      : calc(var(--style-grid-full) - 4 * var(--style-line-width-light));
            height     : calc(var(--style-grid-full) - 4 * var(--style-line-width-light));

            position   : absolute;
            bottom     : calc(2 * var(--style-line-width-light));
            left       : calc(2 * var(--style-line-width-light));

            background : var(--style-color-light-faded);
        }

        .configuration .value.color input
        {
            padding-left : var(--style-grid-full);
        }

        .configuration .value.color [data-error]
        {
            position    : absolute;
            bottom      : calc(-1 * var(--style-line-height-small));
            left        : 0;
            right       : 0;
            padding     : 0 calc(2 * var(--style-line-width-light));

            font-size   : var(--style-font-size-small);
            line-height : var(--style-line-height-small);

            color       : var(--style-color-dark);
            background  : var(--style-color-accent);
        }

        .configuration input
        {
            display       : block;
            width         : 100%;
            padding       : 0 var(--style-grid-third);

            font-family   : var(--style-font-family-code);
            font-weight   : var(--style-font-weight-normal);
            font-size     : var(--style-font-size-small);
            line-height   : var(--style-grid-full);

            color         : var(--style-color-light);
            background    : var(--style-color-dark-lighter);
            border        : none;
            border-radius : 0;
        }

        .configuration input:focus
        {
            outline : var(--style-line-width-light) solid var(--style-color-interactive-in);
        }

        .configuration input[type="range"]
        {
            appearance         : none;
            -webkit-appearance : none;

            padding            : calc(2 * var(--style-line-width-light));
            border             : none;
        }

        .configuration input[type="range"]::-webkit-slider-thumb,
        .configuration input[type="range"]::-moz-range-thumb
        {
            appearance         : none;
            -webkit-appearance : none;

            background         : var(--style-color-interactive);
            border             : none;
            border-radius      : 0;
            cursor             : pointer;
        }

        /**
         * Source
         */
        p.source
        {
            margin     : 0 0 var(--style-grid-full) 0;
            padding    : 3px;

            font-size  : var(--style-font-size-small);
            line-height: var(--style-grid-full);
            text-align : center;

            color      : var(--style-color-light-faded);
        }

        @media only screen and (min-width: 1024px)
        {
            p.source
            {
                flex-basis : 100%;
            }
        }
    `;

    constructor ()
    {
        super();

        this.controls        = {}
        this.configuration   = [];
        this.showPlaceholder = true;
        this.values          = [];

        this.errors          = {}
        this.references      = {}
    }

    handleChangeColor ( ev )
    {
        const key    = ev.target.getAttribute( "id" );
        const target = this.values.find( x => x.key === key );

        this.errors[ key ].value.innerText = "";

        try
        {
            target.value = Colors.hexToObjectRGB( ev.target.value );
            this.references[ key ].value.style.background = ev.target.value;
            this.reportConfigurationChanged( target );
        }
        catch ( error )
        {
            if ( error === "Invalid color format!" )
            {
                this.errors[ key ].value.innerText = error;
            }
        }
    }

    handleChangeRange ( ev )
    {
        const target = this.values.find( x => x.key === ev.target.getAttribute( "id" ) );

        target.value = parseInt( ev.target.value, 10 );
        this.reportConfigurationChanged( target );
    }

    handleChangeText ( ev )
    {
        const target = this.values.find( x => x.key === ev.target.getAttribute( "id" ) );

        target.value = ev.target.value;
        this.reportConfigurationChanged( target );
    }

    standardizeControls ( controls )
    {
        return Object.keys( controls ).map( key =>
        {
            if ( typeof controls[ key ] === "string" )
            {
                return {
                    key,
                    label : controls[ key ],
                    style : "default"
                }
            }

            return { key, ...controls[ key ] }
        });
    }

    render ()
    {
        const controls       = this.standardizeControls( this.controls ).map( x => this.renderControl( x ) );
        const configuration  = this.configuration.map( x => this.renderConfiguration( x ) );

        return html`
            <section class="information">
                <slot name="title"></slot>
                <slot name="description"></slot>
                <div class="controls">${ controls }</div>
            </section>
            <section class="output" data-placeholder="${ this.showPlaceholder.toString() }">
                <slot name="display"></slot>
                <slot name="placeholder"></slot>
                <p class="processing">Processing...</p>
            </section>
            <section class="configuration">${ configuration }</section>
            <p class="source">[Source](<slot name="source">N/A</slot>)</p>
        `;
    }

    renderControl ( control )
    {
        return html`
            <button
                id="${ control.key }"
                type="button"
                data-style="${ control.style }"
                @click="${ this.reportControl }"
            >${ control.label }</button>
        `;
    }

    renderConfiguration ( configuration )
    {
        if ( !this.values.find( x => x?.key === configuration.key ) )
        {
            this.values.push({ key : configuration.key, value : configuration.value });
        }

        const renderColor = configuration =>
        {
            const initial = Colors.objectRGBToHex( configuration.value );

            this.errors[ configuration.key ]     = createRef();
            this.references[ configuration.key ] = createRef();

            return html`
                <span data-color ${ ref( this.references[ configuration.key ] ) } style="background: ${ initial }"></span>
                <input
                    id="${ configuration.key }"
                    name="${ configuration.key }"
                    type="text"
                    .value=${ initial }
                    @change="${ this.handleChangeColor }"
                />
                <span data-error ${ ref( this.errors[ configuration.key ] ) }></span>
            `;
        }

        const renderRange = configuration => html`
            <input
                id="${ configuration.key }"
                name="${ configuration.key }"
                type="range"
                min="${ configuration.options?.min ?? nothing }"
                max="${ configuration.options?.max ?? nothing }"
                .value=${ configuration.value }
                @change="${ this.handleChangeRange }"
            />
        `;

        const renderText = configuration => html`
            <input
                id="${ configuration.key }"
                name="${ configuration.key }"
                type="text"
                .value=${ configuration.value }
                @change="${ this.handleChangeText }"
            />
        `;

        let rendered;

        configuration.type === "color" && ( rendered = renderColor( configuration ) );
        configuration.type === "range" && ( rendered = renderRange( configuration ) );
        configuration.type === "text"  && ( rendered = renderText ( configuration ) );

        return html`
            <div class="value ${ configuration.type }">
                <label for="${ configuration.key }">${ configuration.label }</label>
                ${ rendered }
            </div>
        `;
    }

    reportConfigurationChanged ( target )
    {
        window.setTimeout(() =>
        {
            this.dispatchEvent
            (
                new CustomEvent( "configurationChanged", { detail : target } )
            );
        }, 100 );
    }

    reportControl ( ev )
    {
        this.dispatchEvent
        (
            new CustomEvent( "controlClicked", { detail : ev.target.getAttribute( "id" ) } )
        );
    }
}
