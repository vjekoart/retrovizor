/**
 * Class that degrades an image by scaling-down the number of pixels and by changing original image colors.
 * Currently, it transforms the image to a format with two colors.
 */
class ImageDegradator
{
    /**
     * @param { number } maxLightness    - Maximum lightness value for a pixel, 0 - 255.
     * @param { number } scaleDownFactor - Degradation factor, 1 - Math.min( image.width, image.height )
     */
    constructor ( maxLightness, scaleDownFactor )
    {
        this.options =
        {
            maxLightness    : maxLightness    ?? 200,
            scaleDownFactor : scaleDownFactor ?? 16
        }

        this.worker  = new Worker
        (
            import.meta.resolve( "Library/services/image-degradator.worker.js" ),
            { type : "module" }
        );
    }

    degrade ( base64 )
    {
        return new Promise(( resolve, reject ) =>
        {
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

                reject({ message : "Error in the worker script.", errorEvent : ev });
            }
        });
    }

    getOptions ()
    {
        return this.options;
    }

    setOptions ( options )
    {
        this.options = options;
    }
}

export { ImageDegradator }
