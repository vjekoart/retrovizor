class ImageDegradator
{
    constructor ( scaleDownFactor )
    {
        this.options =
        {
            maxLightness    : 200,
            scaleDownFactor : scaleDownFactor ?? 16
        };

        // Internals
        this.bounds  =       // Used during the primitivisation
        {
            left   : 0,
            right  : 0,
            top    : 0,
            bottom : 0
        };

        this.canvas  = null; // OffscreenCanvas
        this.context = null; // CanvasRenderingContext2D
        this.image   =
        {
            width   : 0,
            height  : 0,
            data    : null,  // ImageData
            element : null   // HTMLImageElement
        };
    }

    async degenerate ( base64 )
    {
        await this.prepareImage( base64 );
        await this.loadImage();

        this.internalPrepareBounds();
        this.internalColorAdjust();
        this.internalToPrimitive();

        return await this.internalToBase64();
    }

    getOptions ()
    {
        return this.options;
    }

    setOptions ( options )
    {
        this.options = options;
    }

    /**
     * PRIVATE
     */

    /**
     * Returns an array of pixels in the specified area.
     *
     * { r, g, b, index } // Pixel index in ImageData array
     */
    getAreaPixels ( x, y, xOffset, yOffset )
    {
        const pixels = [];

        for ( let i = y; i < yOffset; ++i )
        {
            for ( let j = x; j < xOffset; ++j )
            {
                const pixelIndex = j + i * this.image.width;
                const byteIndex  = pixelIndex * 4;

                pixels.push( {
                    index : byteIndex,
                    r     : this.image.data.data[ byteIndex     ],
                    g     : this.image.data.data[ byteIndex + 1 ],
                    b     : this.image.data.data[ byteIndex + 2 ]
                } );
            }
        }

        return pixels;
    }

    internalToBase64 ()
    {
        return new Promise( ( resolve, reject ) =>
        {
            this.context.putImageData( this.image.data, 0, 0 );

            this.canvas.convertToBlob()
                .then( blob =>
                {
                    const reader = new FileReader();

                    reader.onloadend = () => resolve( reader.result );
                    reader.onerror = error => reject( error );

                    reader.readAsDataURL( blob );
                } )
                .catch( error => reject( error ) );
        } );
    }

    /**
     * Change every pixel color based on hue and lightness.
     *
     * Take a pixel hue, find the new hue position based on the distance between
     * predefined warm and predefined cold color.
     *
     * Take a pixel lightness, and adjust final color lightness.
     */
    internalColorAdjust ()
    {
        const data      = this.image.data.data;
        const byteCount = data.length;

        for ( let i = 0; i < byteCount; i += 4 )
        {
            const hsl   = Eigen.getHSLFromRGB( data[ i ], data[ i + 1 ], data[ i + 2 ] );
            const color = Eigen.getColorFromHSL( hsl, this.options.maxLightness );

            data[ i     ] = color.r;
            data[ i + 1 ] = color.g;
            data[ i + 2 ] = color.b;
        }
    }

    internalPrepareBounds ()
    {
        const factor = this.options.scaleDownFactor;
        const xValue = this.image.width  % factor;
        const yValue = this.image.height % factor;

        this.bounds.left   = Math.floor( xValue / 2 ) + xValue % 2;
        this.bounds.right  = Math.floor( xValue / 2 );
        this.bounds.top    = Math.floor( yValue / 2 ) + yValue % 2;
        this.bounds.bottom = Math.floor( yValue / 2 );
    }

    /**
     * Break the whole image, i.e. merge nearby pixels in a single box where each pixel has the same
     * color.
     *
     * The color that will affect the whole box, e.g. 4 adjecent pixels, is the average of all pixel
     * colors.
     */
    internalToPrimitive ()
    {
        const bounds  = this.bounds;
        const factor  = this.options.scaleDownFactor;
        const width   = this.image.width;
        const height  = this.image.height;

        // Central box of the image within the bounds
        for ( let i = bounds.top; i < height - bounds.bottom; i += factor )
        {
            for ( let j = bounds.left; j < width - bounds.right; j += factor )
            {
                this.primitivisePixels( this.getAreaPixels( j, i, j + factor, i + factor ) );
            }
        }

        // Corners
        this.primitivisePixels( this.getAreaPixels( 0                   , 0                     , bounds.left, bounds.top ) );
        this.primitivisePixels( this.getAreaPixels( width - bounds.right, 0                     , width      , bounds.top ) );
        this.primitivisePixels( this.getAreaPixels( width - bounds.right, height - bounds.bottom, width      , height     ) );
        this.primitivisePixels( this.getAreaPixels( 0                   , height - bounds.bottom, bounds.left, height     ) );

        // Sides
        for ( let i = bounds.left; i < width - bounds.right; i += factor )
        {
            this.primitivisePixels( this.getAreaPixels( i, 0                     , i + factor, bounds.top ) );
            this.primitivisePixels( this.getAreaPixels( i, height - bounds.bottom, i + factor, height     ) );
        }
        for ( let i = bounds.top; i < height - bounds.bottom; i += factor )
        {
            this.primitivisePixels( this.getAreaPixels( 0                   , i, bounds.left, i + factor ) );
            this.primitivisePixels( this.getAreaPixels( width - bounds.right, i, width      , i + factor ) );
        }
    }

    loadImage ()
    {
        this.canvas  = new OffscreenCanvas( this.image.width, this.image.height );
        this.context = this.canvas.getContext( "2d" );

        this.context.drawImage( this.image.element, 0, 0 );
        this.image.data = this.context.getImageData( 0, 0, this.image.width, this.image.height );
    }

    prepareImage ( base64 )
    {
        return new Promise( ( resolve, reject ) =>
        {            
            this.image.element = new Image();
            this.image.element.onload = () =>
            {
                this.image.width  = this.image.element.naturalWidth;
                this.image.height = this.image.element.naturalHeight;
                resolve();
            };

            this.image.element.src = base64;
        } );
    }

    primitivisePixels( pixels )
    {
        const average = Eigen.getAveragePixelColor( pixels );

        pixels.forEach( pixel =>
        {
            this.image.data.data[ pixel.index     ] = average.r;
            this.image.data.data[ pixel.index + 1 ] = average.g;
            this.image.data.data[ pixel.index + 2 ] = average.b;
        } );
    }
}

/**
 * Color operations that work in favor of the eigengrau color: #16161d
 *
 * If color hue >= 75 and hue <= 270 it's cold, where the cooldest is 170
 * If color hue < 75 and hue > 270 it's warm, where the warmest is 350
 */
class Eigen
{
    static colorCold = { r : 61 , g : 157, b : 230 }; // #3d9de6
    static colorWarm = { r : 230, g : 134, b : 61  }; // #e6863d

    /**
     * @param pixels Array<{ r: number, g: number, b: number }>
     */
    static getAveragePixelColor ( pixels )
    {
        const average = { r : 0, g : 0, b : 0 };

        pixels.forEach( pixel =>
        {
            average.r += pixel.r;
            average.g += pixel.g;
            average.b += pixel.b;
        } );

        average.r /= pixels.length;
        average.g /= pixels.length;
        average.b /= pixels.length;

        return average;
    }

    static getColorFromHSL ( hsl, maxLightness )
    {
        const selectedColor = ( () =>
        {
            if ( hsl.h > 75 && hsl.h < 270 ) return this.colorCold;

            return this.colorWarm;
        } )();

        const selectedColorHSL = this.getHSLFromRGB( selectedColor.r, selectedColor.g, selectedColor.b );

        const newColor =
        {
            h : selectedColorHSL.h,
            s : selectedColorHSL.s,
            l : Math.min( hsl.l, maxLightness )
        }

        return this.getRGBFromHSL( newColor );
    }

    /**
     * Returns {
     *   h: 0-360, // Hue
     *   s: 0-255, // Saturation
     *   l: 0-255  // Lightness
     * }
     */
    static getHSLFromRGB ( r, g, b )
    {
        const rDec  = r / 255;
        const gDec  = g / 255;
        const bDec  = b / 255;
        const cmin  = Math.min( rDec, gDec, bDec );
        const cmax  = Math.max( rDec, gDec, bDec );
        const delta = cmax - cmin;

        let hue;

        if ( delta === 0 )        hue = 0;
        else if ( cmax === rDec ) hue = ( ( gDec - bDec ) / delta ) % 6;
        else if ( cmax === gDec ) hue = ( bDec - rDec ) / delta + 2;
        else                      hue = ( rDec - gDec ) / delta + 4;

        hue = Math.round( hue * 60 );

        if ( hue < 0 ) hue += 360;

        const lightness  = ( ( cmin + cmax ) / 2 );
        const saturation = delta === 0 ? 0 : delta / ( 1 - Math.abs( 2 * lightness - 1 ) );

        return {
            h: hue,
            s: saturation * 255,
            l: lightness * 255
        }
    }

    static getRGBFromHSL ( hsl )
    {
        const hue        = hsl.h;
        const saturation = hsl.s / 255;
        const lightness  = hsl.l / 255;

        const c = ( 1 - Math.abs( 2 * lightness - 1 ) ) * saturation;
        const x = c * ( 1 - Math.abs( ( hue / 60 ) % 2 - 1 ) );
        const m = lightness - c / 2;

        let r = 0;
        let g = 0;
        let b = 0;

        if ( 0 <= hue && hue < 60 )         { r = c; g = x; b = 0; }
        else if ( 60  <= hue && hue < 120 ) { r = x; g = c; b = 0; }
        else if ( 120 <= hue && hue < 180 ) { r = 0; g = c; b = x; }
        else if ( 180 <= hue && hue < 240 ) { r = 0; g = x; b = c; }
        else if ( 240 <= hue && hue < 300 ) { r = x; g = 0; b = c; }
        else if ( 300 <= hue && hue < 360 ) { r = c; g = 0; b = x; }

        r = Math.round( ( r + m ) * 255 );
        g = Math.round( ( g + m ) * 255 );
        b = Math.round( ( b + m ) * 255 );

        return { r, g, b };
    }
}

export { ImageDegradator };
