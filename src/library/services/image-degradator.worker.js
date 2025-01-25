import { Eigen } from "Library/services/eigen.service.js";

self.onmessage = async ev =>
{
    if ( ev.data?.action === "start" )
    {
        try
        {
            const { content, options } = ev.data;

            const degraded = await degrade( content, options );

            self.postMessage({ action : "end", content : degraded });
        }
        catch ( error )
        {
            self.postMessage({ action : "error", error });
        }
    }
}

async function degrade ( base64, options = {} )
{
    const image = await getImageBitmapFromBase64( base64 );

    /* Create canvas */
    const canvas  = new OffscreenCanvas( image.width, image.height );
    const context = canvas.getContext( "2d" );

    context.drawImage( image, 0, 0 );

    /* Transform image inside a canvas */
    const imageData       = context.getImageData( 0, 0, image.width, image.height );
    const bounds          = getBounds( image, options.scaleDownFactor );
    const maxLightness    = options.maxLightness;
    const scaleDownFactor = options.scaleDownFactor;

    colorAdjust( imageData, maxLightness );
    primitivise( image, imageData, bounds, scaleDownFactor );

    /* Convert transformed image to Base64 */
    context.putImageData( imageData, 0, 0 );

    return await canvasToBase64( canvas );
}

/**
 * Utilities
 **/

/**
 * Get canvas image content in the format of base64 string.
 *
 * @param { HTMLCanvasElement } canvas
 * @return { string }
 */
function canvasToBase64 ( canvas )
{
    return new Promise( ( resolve, reject ) =>
    {
        canvas.convertToBlob()
            .then( blob =>
            {
                const reader = new FileReader();

                reader.onloadend = () => resolve( reader.result );
                reader.onerror = error => reject( error );

                reader.readAsDataURL( blob );
            })
            .catch( error => reject( error ) );
    });
}

/**
 * Change every pixel color based on hue and lightness.
 *
 * Take a pixel hue, find the new hue position based on the distance between
 * predefined warm and predefined cold color.
 *
 * Take a pixel lightness, and adjust final color lightness.
 */
function colorAdjust ( imageData, maxLightness )
{
    const byteCount = imageData.data.length;

    for ( let i = 0; i < byteCount; i += 4 )
    {
        const hsl   = Eigen.getHSLFromRGB({ r : imageData.data[ i ], g : imageData.data[ i + 1 ], b : imageData.data[ i + 2 ] });
        const color = Eigen.getDegradedColor( hsl, maxLightness );

        imageData.data[ i     ] = color.r;
        imageData.data[ i + 1 ] = color.g;
        imageData.data[ i + 2 ] = color.b;
    }
}

/**
 * Returns an array of pixels in the specified area.
 *
 * @param { Blob      } image
 * @param { ImageData } imageData
 * @param { number    } x         - Starting X coordinate of an area.
 * @param { number    } y         - Starting Y coordinate of an area.
 * @param { number    } xOffset   - Final X coordinate of an area.
 * @param { number    } yOffset   - Final Y coordinate of an area.
 *
 * @return { Array<{ r, g, b, index }> } Index is index of the pixel in the ImageData.data array.
 */
function getAreaPixels ( image, imageData, x, y, xOffset, yOffset )
{
    const pixels = [];

    for ( let i = y; i < yOffset; ++i )
    {
        for ( let j = x; j < xOffset; ++j )
        {
            const pixelIndex = j + i * image.width;
            const byteIndex  = pixelIndex * 4;

            pixels.push
            ({
                index : byteIndex,
                r     : imageData.data[ byteIndex     ],
                g     : imageData.data[ byteIndex + 1 ],
                b     : imageData.data[ byteIndex + 2 ]
            });
        }
    }

    return pixels;
}

function getBounds ( image, scaleDownFactor )
{
    const xValue = image.width  % scaleDownFactor;
    const yValue = image.height % scaleDownFactor;

    const bounds = {}

    bounds.left   = Math.floor( xValue / 2 ) + xValue % 2;
    bounds.right  = Math.floor( xValue / 2 );
    bounds.top    = Math.floor( yValue / 2 ) + yValue % 2;
    bounds.bottom = Math.floor( yValue / 2 );

    return bounds;
}

/** From "data:image/jpeg;base64,/9j/2wCEA..." to blob. */
function getImageBitmapFromBase64 ( base64 )
{
    return new Promise(( resolve, reject ) =>
    {
        const units      = base64.split( ";" );
        const imageType  = units[ 0 ].split( ":" )[ 1 ];
        const rawBase64  = units[ 1 ].split( "," )[ 1 ];

        const decoded    = atob( rawBase64 );
        const count      = decoded.length;

        const buffer     = new ArrayBuffer( count  );
        const uint8Array = new Uint8Array ( buffer );

        for ( let i = 0; i < count; ++i ) uint8Array[ i ] = decoded.charCodeAt( i );

        const blob = new Blob([ buffer ], { type : imageType });

        self.createImageBitmap( blob )
            .then( bitmap => resolve( bitmap ) );
    });
}

/**
 * Break the whole image, i.e. merge nearby pixels in a single box where each pixel has the same
 * color.
 *
 * The color that will affect the whole box, e.g. 4 adjecent pixels, is the average of all pixel
 * colors.
 */
function primitivise ( image, imageData, bounds, scaleDownFactor )
{
    const factor  = scaleDownFactor;
    const width   = image.width;
    const height  = image.height;

    /* Central box of the image within the bounds */
    for ( let i = bounds.top; i < height - bounds.bottom; i += factor )
    {
        for ( let j = bounds.left; j < width - bounds.right; j += factor )
        {
            primitivisePixels( imageData, getAreaPixels( image, imageData, j, i, j + factor, i + factor ) );
        }
    }

    /* Corners */
    primitivisePixels( imageData, getAreaPixels( image, imageData, 0                   , 0                     , bounds.left, bounds.top ) );
    primitivisePixels( imageData, getAreaPixels( image, imageData, width - bounds.right, 0                     , width      , bounds.top ) );
    primitivisePixels( imageData, getAreaPixels( image, imageData, width - bounds.right, height - bounds.bottom, width      , height     ) );
    primitivisePixels( imageData, getAreaPixels( image, imageData, 0                   , height - bounds.bottom, bounds.left, height     ) );

    /* Sides */
    for ( let i = bounds.left; i < width - bounds.right; i += factor )
    {
        primitivisePixels( imageData, getAreaPixels( image, imageData, i, 0                     , i + factor, bounds.top ) );
        primitivisePixels( imageData, getAreaPixels( image, imageData, i, height - bounds.bottom, i + factor, height     ) );
    }
    for ( let i = bounds.top; i < height - bounds.bottom; i += factor )
    {
        primitivisePixels( imageData, getAreaPixels( image, imageData, 0                   , i, bounds.left, i + factor ) );
        primitivisePixels( imageData, getAreaPixels( image, imageData, width - bounds.right, i, width      , i + factor ) );
    }
}

function primitivisePixels( imageData, pixels )
{
    const average = Eigen.getAveragePixelColor( pixels );

    pixels.forEach( pixel =>
    {
        imageData.data[ pixel.index     ] = average.r;
        imageData.data[ pixel.index + 1 ] = average.g;
        imageData.data[ pixel.index + 2 ] = average.b;
    });
}
