import { LitElement, html, css } from "lit";

export class RetroContentBlock extends LitElement
{
    static properties =
    {
        articleDate :
        {
            attribute : "data-date",
            type      : String
        },
        articleHref :
        {
            attribute : "data-href",
            type      : String
        }
    }

    static styles = css`
        :host
        {
            display       : block;
            margin-bottom : var(--style-grid-full);
        }

        :host h2
        {
            margin      : 0 0 var(--style-grid-third) 0;

            font-family : var(--style-font-family-strong);
            font-weight : var(--style-font-weight-strong);
            font-size   : var(--style-font-size-text);
            line-height : var(--style-grid-full);
            text-wrap   : balance;

            color       : var(--style-color-light-highlight);
        }

        :host h2::before
        {
            content       : "##";
            color         : var(--style-color-accent);
            padding-right : var(--style-grid-third);
        }

        :host h2 a
        {
            margin-left     : calc(-1* var(--style-grid-third));
            color           : inherit;
            text-decoration : none;
        }

        :host time,
        :host p
        {
            font-family : var(--style-font-family-content);
            font-weight : var(--style-font-weight-normal);
            line-height : var(--style-line-height);
        }

        :host time
        {
            font-size  : var(--style-font-size-small);
            font-style : normal;
            color      : var(--style-color-light-faded);
        }

        :host p
        {
            margin     : 0 0 var(--style-grid-third) 0;
            font-size  : var(--style-font-size-text);
            text-align : justify;
        }

        :host footer
        {
            text-align : right;
        }

        :host footer a
        {
            font-family     : var(--style-font-family-content);
            font-weight     : var(--style-font-weight-title);
            font-size       : var(--style-font-size-small);
            line-height     : var(--style-line-height);
            color           : var(--style-color-interactive);
            text-decoration : none;
            transition      : color var(--transition-duration-short) ease-in-out;
        }

        :host footer a:hover,
        :host footer a:active,
        :host footer a:focus
        {
            color : var(--style-color-interactive-in);
        }

        :host footer a::before,
        :host footer a::after
        {
            color : var(--style-color-light);
        }

        :host footer a::before
        {
            content       : "[";
            padding-right : calc(0.13 * var(--style-font-size-text));
            
        }

        :host footer a::after
        {
            content      : "]";
            padding-left : calc(0.13 * var(--style-font-size-text));
        }
    `;

    constructor ()
    {
        super();
    }

    getDateString ( date )
    {
        if ( !date )
        {
            return "";
        }

        return new Date( date ).toISOString().split( "T" )[ 0 ];
    }

    renderFooter ( href )
    {
        if ( !href )
        {
            return "";
        }

        return html`
            <footer>
                <a href="${ href }">READ</a>
            </footer>
        `;
    }

    renderTitle ( href )
    {
        if ( !href )
        {
            return html`<slot name="title">Dummy title</slot>`;
        }

        return html`
            <a href="${ href }"><slot name="title">Dummy title</slot></a>
        `;
    }

    render ()
    {
        const date   = this.getDateString( this.articleDate );
        const footer = this.renderFooter ( this.articleHref );
        const title  = this.renderTitle  ( this.articleHref );

        return html`
            <h2>${ title }</h2>
            <time datetime="${ this.articleDate }">${ date }</time>
            <p>
                <slot name="excerpt"></slot>
            </p>
            ${ footer }
        `;
    }
}
