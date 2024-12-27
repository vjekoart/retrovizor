import { LitElement, html, css } from "lit";

export class RetroFooter extends LitElement
{
    static properties =
    {
        "dummyValue":
        {
            attribute: "data-dummy-value",
            type: String
        }
    };

    static styles = css`
        :host
        {
            display: block;
            background-color: cyan;
        }

        em,
        strong
        {
            display: block;
            margin: var(--style-grid-full);
        }

        em
        {
            background-color: var(--style-color-accent);
        }

        strong
        {
            background-color: var(--color-red);
        }
    `;

    constructor ()
    {
        super();
        this.dummyValue = "Default dummyValue!";
    }

    render ()
    {
        return html`<div><em>Value</em><strong>${ this.dummyValue }</strong></div>`;
    }
}
