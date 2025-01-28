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
            position   : relative;
            text-align : center;
            z-index    : 100;

            --height   : calc(1.2 * var(--style-grid-full));
        }

        :host([data-style="main"])
        {
            background    : var(--style-color-dark);
            border-top    : var(--style-line-width-light) solid var(--style-color-dark-lighter);
            border-bottom : var(--style-line-width-light) solid var(--style-color-dark-lighter);
        }

        :host a
        {
            display         : inline-block;
            margin          : 0 var(--style-grid-half) 0 0;
            
            font-family     : var(--style-font-family-strong);
            font-weight     : var(--style-font-weight-strong);
            font-size       : var(--style-font-size-text);
            line-height     : var(--height);
            text-transform  : uppercase;
            text-decoration : none;
         
            color           : var(--style-color-light);
            transition      : color var(--transition-duration-short) ease-in-out;
        }

        :host a:hover,
        :host a:active,
        :host a:focus
        {
            color : var(--style-color-accent);
        }

        :host a.active
        {
            color  : var(--style-color-accent);
            cursor : default;
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
     * Returns markup for single navigation element, button.
     *
     * @param { name, path, text } element - A single navigation element.
     *
     * @return { html }
     */
    renderElement ( element )
    {
        return html`<a
            class     = "${ this.active === element.name ? "active" : "" }"
            href      = "${ element.path }"
            data-name = "${ element.name }"
        >${ element.text }</a>`;
    }

    render ()
    {
        return Configuration.navigationItems.map( x => this.renderElement( x ) );
    }
}
