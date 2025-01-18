class CanvasManager
{
    constructor( canvas, padding = null )
    {
        if ( !canvas )
        {
            throw new Error( "Missing a canvas element!" );
        }

        this.canvas  = canvas;
        this.context = this.canvas.getContext( "2d", { willReadFrequently : true } );
        this.padding = padding ?? 24;

        this.pixelCountX = 0;
        this.pixelCountY = 0;
    }

    get pixelCount()
    {
        return this.pixelCountX * this.pixelCountY;
    }

    setup()
    {
        this.resize();
        window.addEventListener( "resize", () => this.resize() );
    }

    resize()
    {
        this.canvas.width  = document.body.clientWidth;
        this.canvas.height = window.innerHeight;

        this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );

        this.pixelCountX = this.canvas.width  - 2 * this.padding;
        this.pixelCountY = this.canvas.height - 2 * this.padding;
    }

    clearImage()
    {
        this.context.clearRect
        (
            this.padding,
            this.padding,
            this.pixelCountX,
            this.pixelCountY
        );
    }

    drawImage( imageDataArray )
    {
        const imageData = new ImageData
        (
            imageDataArray,
            this.pixelCountX,
            this.pixelCountY
        );

        // TODO: check if this method can be optimised, or if there's an alternative method
        this.context.putImageData( imageData, this.padding, this.padding );
    }

    // TODO: this should be splittable to two different functions, but I have a problem with internal data structures
    mergeAndDrawImage( imageDataArray, alphaDelta )
    {
        if ( !imageDataArray )
        {
            return;
        }

        const existing = this.context.getImageData
        (
            this.padding,
            this.padding,
            this.pixelCountX,
            this.pixelCountY
        );

        const dataLength = existing.data.length;
        const imageData  = existing.data;

        for ( let i = 0; i < dataLength; i += 4 )
        {
            imageData[ i + 0 ] = Math.min( 255, imageData[ i + 0 ] + imageDataArray[ i + 0 ] );
            imageData[ i + 1 ] = Math.min( 255, imageData[ i + 1 ] + imageDataArray[ i + 1 ] );
            imageData[ i + 2 ] = Math.min( 255, imageData[ i + 2 ] + imageDataArray[ i + 2 ] );
            imageData[ i + 3 ] = Math.min( 255, Math.max( 0, imageData[ i + 3 ] - alphaDelta + imageDataArray[ i + 3 ] ) );
        }

        // TODO: check if this method can be optimised, or if there's an alternative method
        this.context.putImageData( existing, this.padding, this.padding );
    }
}

export { CanvasManager }
