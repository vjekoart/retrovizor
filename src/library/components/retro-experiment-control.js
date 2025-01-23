import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

/**
 * retroExperimentControl.controls =
 * [
 *     { key : "name" , label : "Label",  },
 *     { key : "start", label : "Start the animation" }
 * ];
 * retroExperimentControl.options  =
 * [
 *     {
 *         key     : "image"
 *         type    : "file",
 *         options : { accept : "image/png, image/jpeg, image/webp" },
 *         label   : "Click to select an image\n(everything happens inside a web browser)",
 *         value   : null
 *     }, {
 *         key     : "scaleDownFactor"
 *         type    : "range",
 *         options : { min : 2, max : 128 },
 *         label   : "Factor",
 *         value   : defaultOptions.scaleDownFactor
 *     }
 * ];
 * 
 * retroExperimentControl.values === [ { key : "key name", value : Value }, ... ];
 *
 * Value object for type === "file", has a "name" property.
 * 
 * @event controlClicked { detail : "control key" }
 *
 * Return value for `type : "file"` is a base64 string.
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

        this.controls   = [];
        this.options    = [];
        this.values     = [];
        this.references = {}
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

    render ()
    {
        const controls = this.controls.map( x => this.renderControl( x ) );
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
            `
        };

        let rendered;

        option.type === "range" && ( rendered = renderRangeOption( option ) );
        option.type === "file"  && ( rendered = renderFileOption ( option ) );

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
