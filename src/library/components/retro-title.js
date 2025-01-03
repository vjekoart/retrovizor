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
            padding-top : calc(2 * var(--style-grid-full));
        }

        :host h1
        {
            margin      : 0;

            font-family : var(--style-font-family-title);
            font-size   : var(--style-font-size-title);
            font-weight : var(--style-font-weight-title);
            line-height : var(--style-font-size-title);
        }

        :host h1 a
        {
            color           : var(--color-light-faded);
            text-decoration : none;
            text-transform  : uppercase;
        }
    `;

    render ()
    {
        return html`<h1><a href="/">Retrovizor</a></h1>`;
    }
}
