import { Eigen } from "Library/services/eigen.service.js";

class ImageDegradator
{
    constructor ( scaleDownFactor )
    {
        this.options =
        {
            maxLightness    : 200,                  // 0 - 255
            scaleDownFactor : scaleDownFactor ?? 16 // 1 - Math.min( image.width, image.height )
        }

        // Internals
        this.bounds  =       // Used during the primitivisation
        {
            left   : 0,
            right  : 0,
            top    : 0,
            bottom : 0
        }

        this.canvas  = null; // OffscreenCanvas
        this.context = null; // CanvasRenderingContext2D
        this.image   =
        {
            width   : 0,
            height  : 0,
            data    : null,  // ImageData
            element : null   // HTMLImageElement
        }

        this.worker  = new Worker(
            import.meta.resolve( "Library/services/image-degradator.worker.js" ),
            { type : "module" }
        );
    }

    /* TODO: majority of this stuff should happen on the Worker */
    degrade ( base64 )
    {
        return new Promise(( resolve, reject ) => {
            this.worker.postMessage
            ({
                action  : "start",
                content : base64,
                options : this.options
            });

            this.worker.onmessage = ev =>
            {
                if ( ev.data?.action === "end" )
                {
                    resolve( ev.data.content );
                    return;
                }

                reject({ message : "Error in worker", content : ev });
            }
        });
        // await this.prepareImage( base64 );
        // await this.loadImage();

        // this.internalPrepareBounds();
        // this.internalColorAdjust();
        // this.internalToPrimitive();

        // return await this.internalToBase64();
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
            const hsl   = Eigen.getHSLFromRGB( { r : data[ i ], g : data[ i + 1 ], b : data[ i + 2 ] } );
            const color = Eigen.getDegradedColor( hsl, this.options.maxLightness );

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
            }

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

export { ImageDegradator }
