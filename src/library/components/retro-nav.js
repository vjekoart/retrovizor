import { LitElement, html, css } from "lit";

import { Configuration } from "Library";

export class RetroNav extends LitElement
{
    static properties =
    {
        active :
        {
            attribute : "data-active",
            type      : String
        }
    }

    static styles = css`
        :host
        {
            display    : block;
            padding    : var(--style-grid-full);
            text-align : center;
        }

        :host a
        {
            display         : inline-block;
            margin          : 0 var(--style-grid-half) 0 0;
            
            font-family     : var(--style-font-family-strong);
            font-weight     : var(--style-font-weight-strong);
            font-size       : var(--style-font-size-text);
            line-height     : var(--style-grid-full);
            text-transform  : uppercase;
            text-decoration : none;
         
            color           : var(--style-color-light);
            border-bottom   : var(--style-line-width-light) solid var(--style-color-light);
        }

        :host a:hover,
        :host a:active,
        :host a:focus,
        :host a.active
        {
            color : var(--style-color-light-highlight);
        }

        :host a:hover,
        :host a:active,
        :host a:focus
        {
            border-color : var(--style-color-accent);
        }

        :host a.active
        {
            border-color : var(--style-color-light-highlight);
            cursor       : default;
        }

        :host a:last-child
        {
            margin-right : 0;
        }
    `;

    constructor ()
    {
        super();
        this.active = "";
    }

    /**
     * @param { name, path, text } element - A single navigation element.
     */
    renderElement ( element )
    {
        return html`
            <a
                data-name="${ element.name }"
                href="${ element.path }"
                class="${ this.active === element.name ? "active" : "" }"
            >
                ${ element.text }
            </a>
        `;
    }

    render ()
    {
        return Configuration.navigationItems.map( x => this.renderElement( x ) );
    }
}
