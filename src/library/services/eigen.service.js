/**
 * Color operations that work in favor of the eigengrau color: #16161d
 *
 * If color hue >= 75 and hue <= 270 it's cold, where the cooldest is 170
 * If color hue < 75 and hue > 270 it's warm, where the warmest is 350
 */
class Eigen
{
    static colorBlue    = { r :  61, g : 157, b : 230 } /* #3d9de6 */
    static colorBlueish = { r :  61, g : 146, b : 230 } /* #3de63d */
    static colorRed     = { r : 230, g : 115, b :  61 } /* #e63d3d */
    static colorOrange  = { r : 230, g : 134, b :  61 } /* #e6863d */

    /**
     * @param pixels Array<{ r: number, g: number, b: number }>
     */
    static getAveragePixelColor ( pixels )
    {
        const average = { r : 0, g : 0, b : 0 }

        pixels.forEach( pixel =>
        {
            average.r += pixel.r;
            average.g += pixel.g;
            average.b += pixel.b;
        });

        average.r = Math.round( average.r / pixels.length );
        average.g = Math.round( average.g / pixels.length );
        average.b = Math.round( average.b / pixels.length );

        return average;
    }

    /**
     * Get opinionated color in RGB format from provided HSL.
     *
     * @param { h: number, s: number, l: number } hsl
     * @param { number }                          maxLightness - 0 - 255
     */
    static getDegradedColor ( hsl, maxLightness )
    {
        const selectedColor = (() =>
        {
            if ( hsl.h >  75  && hsl.h < 175 ) return this.colorBlueish;
            if ( hsl.h >= 175 && hsl.h < 270 ) return this.colorBlue;
            if ( hsl.h >= 270                ) return this.colorRed;

            return this.colorOrange;
        })();

        const selectedColorHSL = this.getHSLFromRGB( selectedColor );

        const newColor =
        {
            h : selectedColorHSL.h,
            s : selectedColorHSL.s,
            l : Math.min( hsl.l, maxLightness )
        }

        return this.getRGBFromHSL( newColor );
    }

    /**
     * @param { r: number, g: number, b: number } rgb - Color representation.
     * @return {
     *   h: 0-360 - Hue
     *   s: 0-255 - Saturation
     *   l: 0-255 - Lightness
     * }
     */
    static getHSLFromRGB ( rgb )
    {
        const rDec  = rgb.r / 255;
        const gDec  = rgb.g / 255;
        const bDec  = rgb.b / 255;
        const cmin  = Math.min( rDec, gDec, bDec );
        const cmax  = Math.max( rDec, gDec, bDec );
        const delta = cmax - cmin;

        let hue;

             if ( delta ===    0 ) hue = 0;
        else if ( cmax  === rDec ) hue = ( ( gDec - bDec ) / delta ) % 6;
        else if ( cmax  === gDec ) hue = ( bDec - rDec ) / delta + 2;
        else                       hue = ( rDec - gDec ) / delta + 4;

        hue = Math.round( hue * 60 );

        if ( hue < 0 ) hue += 360;

        const lightness  = ( cmin + cmax ) / 2;
        const saturation = delta === 0 ? 0 : delta / ( 1 - Math.abs( 2 * lightness - 1 ) );

        return {
            h : hue,
            s : Math.round( saturation * 255 ),
            l : Math.round( lightness  * 255 )
        }
    }

    /**
     * @param { h: number, s: number, l: number } rgb - Color representation.
     * @return {
     *   r: 0-255
     *   g: 0-255
     *   b: 0-255
     * }
     */
    static getRGBFromHSL ( hsl )
    {
        const hue        = hsl.h;
        const saturation = hsl.s / 255;
        const lightness  = hsl.l / 255;

        const c = ( 1 - Math.abs( 2 * lightness - 1 ) ) * saturation;
        const x = c * ( 1 - Math.abs( ( hue / 60 ) % 2 - 1 ) );
        const m = lightness - c / 2;

        let [ r, g, b ] = [ 0, 0, 0 ];

             if (   0 <= hue && hue <  60 ) [ r, g, b ] = [ c, x, 0 ];
        else if (  60 <= hue && hue < 120 ) [ r, g, b ] = [ x, c, 0 ];
        else if ( 120 <= hue && hue < 180 ) [ r, g, b ] = [ 0, c, x ];
        else if ( 180 <= hue && hue < 240 ) [ r, g, b ] = [ 0, x, c ];
        else if ( 240 <= hue && hue < 300 ) [ r, g, b ] = [ x, 0, c ];
        else if ( 300 <= hue && hue < 360 ) [ r, g, b ] = [ c, 0, x ];

        r = Math.round( ( r + m ) * 255 );
        g = Math.round( ( g + m ) * 255 );
        b = Math.round( ( b + m ) * 255 );

        return { r, g, b }
    }
}

export { Eigen }
