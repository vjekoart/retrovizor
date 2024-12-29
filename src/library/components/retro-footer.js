import { LitElement, html, css } from "lit";

export class RetroFooter extends LitElement
{
    static styles = css`
        :host
        {
            display    : block;
            padding    : var(--style-grid-full);
            text-align : center;
        }

        :host p
        {
            margin      : 0;

            font-family : var(--style-font-family-strong);
            font-weight : var(--style-font-weight-strong);
            font-size   : var(--style-font-size-text);
            line-height : var(--style-grid-full);

            color       : var(--style-color-light-faded);
        }

        :host p strong
        {
            color: var(--style-color-accent);
        }
    `;

    render ()
    {
        return html`<p>retrovizor<strong>&middot;</strong>xyz</p>`;
    }
}
