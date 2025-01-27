import { LitElement, html, css } from "lit";

export class RetroTitle extends LitElement
{
    static styles = css`
        :host
        {
            display : block;
            padding : var(--style-grid-full);
        }

        :host([data-style="main"])
        {
            padding : calc(2 * var(--style-grid-full)) 0;
        }

        :host h1
        {
            margin      : 0;

            font-family : var(--style-font-family-title);
            font-size   : var(--style-font-size-title);
            font-weight : var(--style-font-weight-title);
            line-height : var(--style-font-size-title);

            text-align  : center;
            color       : var(--style-color-accent);
        }

        :host h1 a
        {
            color           : var(--style-color-light);
            text-decoration : none;
            text-transform  : uppercase;
        }
    `;

    render ()
    {
        return html`<h1>.:.::..:..<br /><a href="/">Retrovizor</a></h1>`;
    }
}
