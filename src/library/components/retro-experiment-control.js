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
 * Component responsible for displaying and controlling options for an experiment. Basically, a form
 * control component that simplifies definition and usage of various input fields.
 *
 * @usage
 * const retroExperimentControl = document.createElement( "retro-experiment-control" );
 *
 * // Define controls, actions
 * retroExperimentControl.controls =
 * {
 *     "name"  : "Label",
 *     "start" : "Start the animation"
 * }
 * 
 * // Define options and their types, including options for each type
 * retroExperimentControl.options  =
 * [
 *     {
 *         key     : "image"
 *         type    : "file",
 *         options : { accept : "image/png, image/jpeg, image/webp" },
 *         label   : "Click to select an image",
 *         value   : null
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
 * // Read values of options to get user input
 * retroExperimentControl.values === [ { key : "key name", value : Value }, ... ];
 *
 * // Value object for type === "color"
 * { r, g, b }, where each value is an integer between 0-255
 *
 * // Value object for type === "file"
 * { 
 *     "name"  : "file-name"
 *     "value" : "Base64 string representing file content"
 * } has a "name" property.
 *
 * // Listen for control actions
 * retroExperimentControl.addEventListener( "controlClicked", ev =>
 * {
 *     console.log( "ev.detail contains key from retroExperimentControl.controls", ev.detail );
 * });
 *
 * // Set "disabled" attribute to put component in the loading state and block user interaction
 * retroExperimentControl.setAttribute( "disabled", "disabled" );
 *
 * // Enable the component by removing the attribute
 * retroExperimentControl.removeAttribute( "disabvled" );
 */
export class RetroExperimentControl extends LitElement
{
    static properties =
    {
        controls :
        {
            attribute : false
        },
        options  :
        {
            attribute : false
        },
        values   :
        {
            attribute : false
        }
    }

    static styles = css`
        :host
        {
            display       : block;
            width         : 100%;
            height        : auto;
            margin-bottom : var(--style-grid-full);
            padding       : var(--style-grid-full);
            border        : var(--style-line-width-light) solid var(--style-color-light);
            opacity       : 1;
        }

        :host([disabled="disabled"])
        {
            opacity        : 0.5;
            cursor         : default;
            pointer-events : none;
            transition     : opacity var(--transition-duration-short) ease-in-out;
        }

        :host:last-child
        {
            margin-bottom : 0;
        }

        :host .controls
        {
            display         : flex;
            justify-content : space-between;
            margin-bottom   : var(--style-grid-full);
        }

        :host .controls:last-child
        {
            margin-bottom : 0;
        }

        :host .controls button
        {
            width  : calc(50% - var(--style-grid-half));
            height : auto;
        }

        :host .configuration-value
        {
            display       : block;
            margin-bottom : var(--style-grid-half);
        }

        :host .configuration-value.color
        {
            position : relative;
        }

        :host .configuration-value.color [data-color]
        {
            display    : block;
            width      : calc(var(--style-grid-full) - 2 * var(--style-line-width-light));
            height     : calc(var(--style-grid-full) - 2 * var(--style-line-width-light));

            position   : absolute;
            bottom     : calc(2 * var(--style-line-width-light));
            left       : calc(2 * var(--style-line-width-light));

            background : var(--style-color-light-faded);
        }

        :host .configuration-value.color input
        {
            padding-left : var(--style-grid-full);
        }

        :host .configuration-value.color [data-error]
        {
            position    : absolute;
            bottom      : calc(-1 * var(--style-line-height-small));
            left        : calc(2 * var(--style-line-width-light));

            font-size   : var(--style-font-size-small);
            line-height : var(--style-line-height-small);

            background  : var(--style-color-accent);
        }

        :host .configuration-value.file
        {}

        :host .configuration-value.file img
        {
            box-sizing : border-box;
            display    : block;
            width      : 100%;
            height     : auto;
            min-height : var(--style-grid-full);
            background : var(--style-color-dark-lighter);
            border     : var(--style-line-width-light) solid var(--style-color-light);
            overflow   : hidden;
        }

        :host .configuration-value.file label
        {
            display : block;
            padding : 0 0 var(--style-grid-half) 0;
            cursor  : pointer;
        }

        :host .configuration-value.file input[type="file"]
        {
            display : none;
        }

        input
        {
            display       : block;
            padding       : 0 var(--style-grid-third);

            font-family   : var(--style-font-family-code);
            font-weight   : var(--style-font-weight-normal);
            font-size     : var(--style-font-size-small);
            line-height   : var(--style-grid-full);

            color         : var(--style-color-dark-light);
            background    : var(--style-color-light-highlight);
            border        : var(--style-line-width-light) solid var(--style-color-dark-lighter);
            border-radius : 0;
        }

        button
        {
            margin        : 0;
            padding       : 0 var(--style-grid-full);

            font-family   : var(--style-font-family-content);
            font-weight   : var(--style-font-weight-normal);
            font-size     : var(--style-font-size-text);
            line-height   : var(--style-grid-full);

            color         : var(--style-color-light);
            background    : var(--style-color-interactive);
            border        : var(--style-line-width-light) solid var(--style-color-interactive-dark);
            border-radius : 0;
            cursor        : pointer;

            transition    : background-color var(--transition-duration-short) ease-in-out;
        }

        button:hover,
        button:active
        {
            background : var(--style-color-interactive-in);
        }

        button[disabled="disabled"]
        {
            opacity : 0.5;
        }
    `;

    constructor ()
    {
        super();

        this.controls   = {}
        this.options    = [];
        this.values     = [];

        this.errors     = {}
        this.references = {}
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
        }
        catch ( error )
        {
            if ( error === "Invalid color format!" )
            {
                this.errors[ key ].value.innerText = error;
            }
        }
    }

    handleChangeFile ( ev )
    {
        const file = ev.target.files[ 0 ];

        if ( !file )
        {
            return;
        }

        const key    = ev.target.getAttribute( "id" );
        const target = this.values.find( x => x.key === key );
        const reader = new FileReader();

        reader.onload = () =>
        {
            target.value = reader.result;
            this.references[ key ].value.src = reader.result;
        }

        reader.readAsDataURL( file );

        target.name = file.name;
    }

    handleChangeRange ( ev )
    {
        const target = this.values.find( x => x.key === ev.target.getAttribute( "id" ) );

        target.value = parseInt( ev.target.value, 10 );
    }

    handleChangeText ( ev )
    {
        const target = this.values.find( x => x.key === ev.target.getAttribute( "id" ) );

        target.value = ev.target.value;
    }

    render ()
    {
        const controls = Object.keys( this.controls ).map( key => this.renderControl({ key, label : this.controls[ key ] }) );
        const options  = this.options.map( x => this.renderOption( x ) );

        return html`
            ${ options }
            <section class="controls">${ controls }</section>
        `;
    }

    renderControl ( control )
    {
        return html`<button id="${ control.key }" type="button" @click="${ this.reportControl }">${ control.label }</button>`;
    }

    renderOption ( option )
    {
        this.values.push({ key : option.key, value : option.value });

        const renderColorOption = option =>
        {
            const initial = Colors.objectRGBToHex( option.value );

            this.errors[ option.key ]     = createRef();
            this.references[ option.key ] = createRef();

            return html`
                <span data-color ${ ref( this.references[ option.key ] ) } style="background: ${ initial }"></span>
                <input
                    id="${ option.key }"
                    name="${ option.key }"
                    type="text"
                    .value=${ initial }
                    @change="${ this.handleChangeColor }"
                />
                <label data-error ${ ref( this.errors[ option.key ] ) }></label>
            `;
        }

        const renderFileOption = option =>
        {
            this.references[ option.key ] = createRef();

            return html`
                <input
                    id="${ option.key }"
                    name="${ option.key }"
                    type="file"
                    accept="${ option.options?.accept ?? nothing }"
                    .value=${ option.value }
                    @change="${ this.handleChangeFile }"
                />
                <img ${ ref( this.references[ option.key ] ) } />
            `;
        }

        const renderRangeOption = option => html`
            <input
                id="${ option.key }"
                name="${ option.key }"
                type="range"
                min="${ option.options?.min ?? nothing }"
                max="${ option.options?.max ?? nothing }"
                .value=${ option.value }
                @change="${ this.handleChangeRange }"
            />
        `;

        const renderTextOption = option => html`
            <input
                id="${ option.key }"
                name="${ option.key }"
                type="text"
                .value=${ option.value }
                @change="${ this.handleChangeText }"
            />
        `;

        let rendered;

        option.type === "color" && ( rendered = renderColorOption( option ) );
        option.type === "file"  && ( rendered = renderFileOption ( option ) );
        option.type === "range" && ( rendered = renderRangeOption( option ) );
        option.type === "text"  && ( rendered = renderTextOption ( option ) );

        return html`
            <div class="configuration-value ${ option.type }">
                <label for="${ option.key }">${ option.label }</label>
                ${ rendered }
            </div>
        `;
    }

    reportControl ( ev )
    {
        this.dispatchEvent
        (
            new CustomEvent( "controlClicked", { detail : ev.target.getAttribute( "id" ) } )
        );
    }
}
