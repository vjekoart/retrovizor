import { LitElement, html, css } from "lit";

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
 * @event controlClicked { detail : "control key" }
 * @event fileChange     { detail : File          }
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
            background : var(--style-color-dark-lighter);
            border     : var(--style-line-width-light) solid var(--style-color-light);
            overflow   : hidden;
        }

        :host .configuration-value.file label
        {
            display : block;
            padding : 0 var(--style-grid-half) var(--style-grid-half) var(--style-grid-half);
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

        this.controls = [];
        this.options  = [];
    }

    renderControl ( control )
    {
        return html`<button id="${ control.key }" type="button" @click="${ this.reportControl }">${ control.label }</button>`;
    }

    renderOption ( option )
    {
        const renderRangeOption = option => html`
            <input id="${ option.key }" name="${ option.key }" type="range" ${ this.spreadOptions( option.options ) } />
        `;

        const renderFileOption = option => html`
            <input
                id="${ option.key }"
                name="${ option.key }"
                type="file"
                ${ this.spreadOptions( option.options ) }
                @change="${ this.reportChange }" />
            <img alt="${ option.label }" />
        `;

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

    render ()
    {
        const controls = this.controls.map( x => this.renderControl( x ) );
        const options  = this.options.map( x => this.renderOption( x ) );

        return html`
            ${ options }
            <section class="controls">${ controls }</section>
        `;
    }

    /**
     * From { min : 0, max : 255 } to `min="0" max="255"`.
     */
    spreadOptions ( options )
    {
        const output = [];

        for ( const key of Object.keys( options ) )
        {
            output.push( `${ key }=" ${ options[ key ].toString() }"` );
        }

        return output.join( " " );
    }

    reportChange ( ev )
    {
        this.dispatchEvent
        (
            new CustomEvent( "fileChange", { detail : ev.target.files[ 0 ] } )
        );
    }

    reportControl ( ev )
    {
        this.dispatchEvent
        (
            new CustomEvent( "controlClicked", { detail : ev.target.getAttribute( "id" ) } )
        );
    }
}
