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
 * Component responsible for displaying experiment options and ouput.
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
 *     "start" : "Start the animation"
 * }
 * 
 * // Define options and their types, including options for each type
 * retroExperiment.options  =
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
 * retroExperiment.values === [ { key : "key name", value : Value }, ... ];
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
 * retroExperiment.addEventListener( "controlClicked", ev =>
 * {
 *     console.log( "ev.detail contains key from retroExperiment.controls", ev.detail );
 * });
 *
 * // Set "disabled" attribute to put component in the loading state and block user interaction
 * retroExperiment.setAttribute( "disabled", "disabled" );
 *
 * // Enable the component by removing the attribute
 * retroExperiment.removeAttribute( "disabvled" );
 */
export class RetroExperiment extends LitElement
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
        *
        {
            box-sizing : border-box;
        }

        :host
        {
            position        : relative;

            display         : flex;
            flex-direction  : column;

            width           : 100%;
            height          : auto;
            margin-bottom   : var(--style-grid-full);

            border          : var(--style-line-width-light) solid var(--style-color-border);
            opacity         : 1;

            --sidebar-width : 280px;
        }

        :host([disabled="disabled"])
        {
            opacity        : 0.5;
            cursor         : default;
            pointer-events : none;
            transition     : opacity var(--transition-duration-short) ease-in-out;
        }

        :host(:last-child)
        {
            margin-bottom : 0;
        }

        @media only screen and (min-width: 1024px)
        {
            :host
            {
                flex-direction : row;
                flex-wrap      : wrap;
            }
        }

        /**
         * Information section
         */
        .information
        {
            width   : var(--sidebar-width);
            padding : var(--style-grid-full);
        }

        slot[name="description"]
        {
            font-size : var(--style-font-size-small);
        }

        .controls
        {
            display         : flex;
            justify-content : space-between;
        }

        .controls button
        {
            width  : calc(50% - var(--style-grid-half));
            height : auto;
        }

        @media only screen and (min-width: 1024px)
        {
            .controls
            {
                display : block;
            }

            .controls button
            {
                width      : 100%;
                margin-top : var(--style-grid-half);
            }
        }

        button
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
            border         : var(--style-line-width-light) solid var(--style-color-border);
            border-radius  : 0;
            cursor         : pointer;

            transition     : background-color var(--transition-duration-short) ease-in-out;
        }

        button:hover,
        button:active
        {
            background : var(--style-color-button-active);
        }

        button[disabled="disabled"]
        {
            opacity : 0.5;
        }

        /**
         * Output section
         */
        .output
        {
            display : block;
            width   : calc(100% - 2 * var(--sidebar-width));
            height  : auto;
            margin  : var(--style-grid-full) 0;
            border  : var(--style-line-width-light) solid var(--style-color-dark-lighter);
        }

        .output img
        {
            display    : block;
            width      : 100%;
            height     : auto;
            max-height : 75vh;
            margin     : 0 auto;
        }

        /**
         * Options section
         */
        .options
        {
            width   : var(--sidebar-width);
            padding : var(--style-grid-full);
        }

        .configuration-value
        {
            display       : block;
            margin-bottom : var(--style-grid-half);
        }

        .configuration-value.color
        {
            position : relative;
        }

        .configuration-value.color [data-color]
        {
            display    : block;
            width      : calc(var(--style-grid-full) - 2 * var(--style-line-width-light));
            height     : calc(var(--style-grid-full) - 2 * var(--style-line-width-light));

            position   : absolute;
            bottom     : calc(2 * var(--style-line-width-light));
            left       : calc(2 * var(--style-line-width-light));

            background : var(--style-color-light-faded);
        }

        .configuration-value.color input
        {
            padding-left : var(--style-grid-full);
        }

        .configuration-value.color [data-error]
        {
            position    : absolute;
            bottom      : calc(-1 * var(--style-line-height-small));
            left        : calc(2 * var(--style-line-width-light));

            font-size   : var(--style-font-size-small);
            line-height : var(--style-line-height-small);

            background  : var(--style-color-accent);
        }

        .configuration-value.file
        {}

        .configuration-value.file img
        {
            box-sizing : border-box;
            display    : block;
            width      : 100%;
            height     : auto;
            min-height : var(--style-grid-full);
            background : var(--style-color-dark-lighter);
            border     : var(--style-line-width-light) solid var(--style-color-border);
            overflow   : hidden;
        }

        .configuration-value.file label
        {
            display : block;
            padding : 0 0 var(--style-grid-half) 0;
            cursor  : pointer;
        }

        .configuration-value.file input[type="file"]
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
            border        : var(--style-line-width-light) solid var(--style-color-border);
            border-radius : 0;
        }

        /**
         * Source
         */
        p.source
        {
            margin     : 0;
            padding    : 3px;

            font-size  : var(--style-font-size-small);
            line-height: var(--style-grid-full);
            text-align : center;

            color      : var(--style-color-light-faded);
            border-top : var(--style-line-width-light) solid var(--style-color-dark-lighter);
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
            <section class="information">
                <slot name="title"></slot>
                <slot name="description"></slot>
                <div class="controls">
                    ${ controls }
                </div>
            </section>
            <section class="output">
                <slot name="display"></slot>
            </section>
            <section class="options">${ options }</section>
            <p class="source">[Source](<slot name="source">N/A</slot>)</p>
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
