class PixelHoodlum
{
    constructor ( scaleDownFactor )
    {
        this.options =
        {
            scaleDownFactor : scaleDownFactor ?? 16
        };

        // Internals
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

        this.internalToMonochrome();
        this.internalToPrimitive();

        return await this.internalToBase64();
    }

    /**
     * PRIVATE
     */

    /**
     * Returns an imaginary box during the primitivisation iteration.
     *
     * Returns an array of scaleDownFactor^2 pixels.
     * 
     * { r, g, b, index } // Index in ImageData array
     */
    getBoxPixels( x, y )
    {
        const xStart = x * this.options.scaleDownFactor;
        const yStart = y * this.options.scaleDownFactor;
        const xEnd   = xStart + this.options.scaleDownFactor;
        const yEnd   = yStart + this.options.scaleDownFactor;

        const pixels = [];

        for ( let i = yStart; i < yEnd; ++i )
        {
            for ( let j = xStart; j < xEnd; ++j )
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
     * Set every pixel color to its' version of th eigengrau color, based on lightness.
     * 
     * Take pixel lightness, and insert eigengrau color with the same lightness.
     */
    internalToMonochrome ()
    {
        const byteCount = this.image.data.data.length;

        for ( let i = 0; i < byteCount; i += 4 )
        {
            const lightness = Eigen.getLightnessFromRGB( this.image.data.data[ i ], this.image.data.data[ i + 1 ], this.image.data.data[ i + 2 ] );
            const eigen     = Eigen.getEigenRGBFromLightness( lightness );

            this.image.data.data[ i     ] = eigen.r;
            this.image.data.data[ i + 1 ] = eigen.g;
            this.image.data.data[ i + 2 ] = eigen.b;
        }
    }

    /**
     * Break the whole image, i.e. merge nearby pixels in a single box where each pixel has the same
     * color.
     *
     * The color that will affect the whole box, e.g. 4 adjecent pixels, is the average of all pixel
     * color.
     */
    internalToPrimitive ()
    {
        const pixelsX = this.image.width  - ( this.image.width  % this.options.scaleDownFactor );
        const pixelsY = this.image.height - ( this.image.height % this.options.scaleDownFactor );
        const boxesX  = pixelsX / this.options.scaleDownFactor;
        const boxesY  = pixelsY / this.options.scaleDownFactor;

        for ( let i = 0; i < boxesY; ++i )
        {
            for ( let j = 0; j < boxesX; ++j )
            {
                const pixels  = this.getBoxPixels( i, j );
                const average = Eigen.getAveragePixelColor( pixels );

                pixels.forEach( pixel =>
                {
                    this.image.data.data[ pixel.index     ] = average.r;
                    this.image.data.data[ pixel.index + 1 ] = average.g;
                    this.image.data.data[ pixel.index + 2 ] = average.b;
                } );
            }
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
}

/**
 * Color operations that work in favor of the eigengrau color: #16161d
 */
class Eigen
{
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

    static getEigenRGBFromLightness ( lightness )
    {
        return {
            r : Math.min( 255, Math.max( 0, lightness - 3 * 7 ) ),
            g : Math.min( 255, Math.max( 0, lightness - 3 * 7 ) ),
            b : Math.min( 255, Math.max( 0, lightness + 4 * 7 ) )
        }
    }

    static getLightnessFromRGB ( r, g, b )
    {
        const cmin = Math.min( r, g, b );
        const cmax = Math.max( r, g, b );

        return ( cmin + cmax ) / 2;
    }
}

export { PixelHoodlum };
