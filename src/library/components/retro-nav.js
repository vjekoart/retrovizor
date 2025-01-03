import { LitElement, html, css } from "lit";

export class RetroNav extends LitElement
{
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
        }

        :host a:last-child
        {
            margin-right : 0;
        }
    `;

    render ()
    {
        return html`
            <a href="/">Home</a>
            <a href="/text/" class="active">Text</a>
            <a href="/code/">Code</a>
            <a href="/user/">User</a>
        `;
    }
}
