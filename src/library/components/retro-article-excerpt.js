import { LitElement, html, css } from "lit";

export class RetroArticleExcerpt extends LitElement
{
    static properties =
    {
        articleDate:
        {
            attribute: "data-date",
            type: String
        },
        href:
        {
            attribute: "data-href",
            type: String
        }
    };

    static styles = css`
        :host
        {
            position       : relative;
            display        : block;
            margin-bottom  : var(--style-grid-full);
        }

        :host h2
        {
            margin  : 0 0 var(--style-grid-third) 0;

            font-family : var(--style-font-family-strong);
            font-weight : var(--style-font-weight-strong);
            font-size   : var(--style-font-size-text);
            line-height : var(--style-grid-full);

            color       : var(--style-color-light-highlight);
        }

        :host h2::before
        {
            content       : "#";
            padding-right : calc(0.33 * var(--style-font-size-text));
            color         : var(--style-color-accent);
        }

        :host p
        {
            margin      : 0;

            font-family : var(--style-font-family-content);
            font-weight : var(--style-font-weight-normal);
            font-size   : var(--style-font-size-text);
            line-height : var(--style-line-height);
        }

        :host footer
        {
            text-align: right;
        }

        :host footer a
        {
            color           : var(--style-color-light);
            font-family     : var(--style-font-family-content);
            font-weight     : var(--style-font-weight-title);
            font-size       : var(--style-font-size-footer-link);
            line-height     : var(--style-line-height);
            text-decoration : none;
        }

        :host footer a:hover,
        :host footer a:active,
        :host footer a:focus
        {
            color : var(--style-color-light-highlight);
        }

        :host footer a::before,
        :host footer a::after
        {
            color : var(--style-color-accent);
        }

        :host footer a::before
        {
            content       : "[";
            padding-right : calc(0.33 * var(--style-font-size-text));
            
        }

        :host footer a::after
        {
            content      : "]";
            padding-left : calc(0.33 * var(--style-font-size-text));
        }
    `;

    constructor ()
    {
        super();
        this.articleDate = "1970-01-01";
        this.href = "https://www.example.com/";
    }

    render ()
    {
        const renderDate = new Date( this.articleDate ).toLocaleDateString();

        return html`
            <h2>
                <slot name="title">Dummy title</slot>
            </h2>
            <time datetime="${ this.articleDate }">${ renderDate }</time>
            <p>
                <slot name="excerpt">Dummy excerpt.</slot>
            </p>
            <footer>
                <a href="${ this.href }">More</a>
            </footer>
        `;
    }
}
