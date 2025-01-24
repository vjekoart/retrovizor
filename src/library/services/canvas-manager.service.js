/**
 * Class responsible for drawing inside a <canvas> element.
 */
class CanvasManager
{
    /**
     * @param { HTMLCanvasElement } canvas  - HTML canvas element for which the class is responsible.
     * @param { number            } padding - Padding between canvas element and drawing area, in pixels.
     */
    constructor ( canvas, padding = 24 )
    {
        if ( !canvas )
        {
            throw new Error( "Missing a canvas element!" );
        }

        this.canvas  = canvas;
        this.context = this.canvas.getContext( "2d", { willReadFrequently : true } );
        this.options = { padding }

        this.pixelCountX = 0;
        this.pixelCountY = 0;
    }

    get pixelCount ()
    {
        return this.pixelCountX * this.pixelCountY;
    }

    /**
     * Clears an existing drawing inside a canvas element. Takes into consideration
     * predefined padding.
     */
    clearImage ()
    {
        this.context.clearRect
        (
            this.options.padding,
            this.options.padding,
            this.pixelCountX,
            this.pixelCountY
        );
    }

    /**
     * Draw an image in the canvas element from provided ImageData array.
     *
     * @param { UInt8ClampedArray } imageDataArray
     */
    drawImage ( imageDataArray )
    {
        const imageData = new ImageData
        (
            imageDataArray,
            this.pixelCountX,
            this.pixelCountY
        );

        this.context.putImageData( imageData, this.options.padding, this.options.padding );
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
     * Draw a provided image in the canvas element, by preserving but fading out the existing canvas
     * content.
     *
     * @param { UInt8ClampedArray } imageDataArray
     * @param { number            } alphaDelta     - Fade out amount for the existing canvas content; 0 - 255
     */
    mergeAndDrawImage ( imageDataArray, alphaDelta )
    {
        if ( !imageDataArray )
        {
            return;
        }

        const existing = this.context.getImageData
        (
            this.options.padding,
            this.options.padding,
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

        this.context.putImageData( existing, this.options.padding, this.options.padding );
    }

    /**
     * Sets drawing area inside a canvas element taking into consideration canvas width, height and predefined
     * drawing padding.
     */
    resize ()
    {
        const computedStyle = window.getComputedStyle( this.canvas );

        this.canvas.width   = parseInt( computedStyle.getPropertyValue( "width"  ), 10 );
        this.canvas.height  = parseInt( computedStyle.getPropertyValue( "height" ), 10 );

        this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );

        this.pixelCountX = this.canvas.width  - 2 * this.options.padding;
        this.pixelCountY = this.canvas.height - 2 * this.options.padding;
    }

    /**
     * Sets up a CanvasManager by registering window resize listeners and triggering
     * the initial resize event.
     */
    setup ()
    {
        this.resize();
        window.addEventListener( "resize", () => this.resize() );
    }
}

export { CanvasManager }
