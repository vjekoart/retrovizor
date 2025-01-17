class CanvasManager
{
    canvas;
    context;
    padding = 24;
    pixelCountX = 0;
    pixelCountY = 0;

    get pixelCount()
    {
        return this.pixelCountX * this.pixelCountY;
    }

    constructor( canvas, padding )
    {
        if ( !canvas )
        {
            throw new Error( "Missing a canvas element!" );
        }

        this.canvas  = canvas;
        this.context = this.canvas.getContext( "2d", { willReadFrequently: true } );
        this.padding = padding;
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

        this.context.clearRect( 0, 0, document.body.clientWidth, window.innerHeight );

        this.pixelCountX = this.canvas.width  - 2 * this.padding;
        this.pixelCountY = this.canvas.height - 2 * this.padding;
    }

    clearImage()
    {
        this.context.clearRect(
            this.padding,
            this.padding,
            this.pixelCountX,
            this.pixelCountY
        );
    }

    drawImage( imageDataArray )
    {
        const imageData = new ImageData(
            imageDataArray,
            this.pixelCountX,
            this.pixelCountY
        );

        this.context.putImageData( imageData, this.padding, this.padding );
    }

    // TODO: this should be splittable to two different functions, but I have a problem with internal
    //       data structures
    mergeAndDrawImage( imageDataArray, alphaDelta )
    {
        if ( !imageDataArray )
        {
            return;
        }

        const existingImageData = this.context.getImageData(
            this.padding,
            this.padding,
            this.pixelCountX,
            this.pixelCountY
        );

        // TODO: optimise the main loop as much as possible
        for ( let i = 0; i < existingImageData.data.length; i += 4 )
        {
            existingImageData.data[ i + 0 ] = Math.min( 255, existingImageData.data[ i + 0 ] + imageDataArray[ i + 0 ] );
            existingImageData.data[ i + 1 ] = Math.min( 255, existingImageData.data[ i + 1 ] + imageDataArray[ i + 1 ] );
            existingImageData.data[ i + 2 ] = Math.min( 255, existingImageData.data[ i + 2 ] + imageDataArray[ i + 2 ] );
            existingImageData.data[ i + 3 ] = Math.min( 255, Math.max( 0, existingImageData.data[ i + 3 ] - alphaDelta + imageDataArray[ i + 3 ] ) );
        }

        this.context.putImageData( existingImageData, this.padding, this.padding );
    }

    fadeImage( alphaDelta )
    {
        const existingImageData = this.context.getImageData(
            this.padding,
            this.padding,
            this.pixelCountX,
            this.pixelCountY
        );

        // TODO: optimise the main loop as much as possible
        for ( let i = 0; i < existingImageData.data.length; i += 4 )
        {
            existingImageData.data[ i + 3 ] = Math.min( 255, Math.max( 0, existingImageData.data[ i + 3 ] - alphaDelta ) );
        }

        this.context.putImageData( existingImageData, this.padding, this.padding );
    }
}

export { CanvasManager }
