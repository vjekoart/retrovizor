class ImageDegradator
{
    constructor ( scaleDownFactor )
    {
        this.options =
        {
            maxLightness    : 200,                  // 0 - 255
            scaleDownFactor : scaleDownFactor ?? 16 // 1 - Math.min( image.width, image.height )
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

                reject({ message : "Error in worker", content : ev });
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
