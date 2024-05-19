/**
 * Eigengrau - what we see when we close our eyes
 *
 * @What?
 * It's not going well with blurred stuff, and testing showed that it may not look so interesting.
 * 
 * It seems that good idea is to create a ImageManager function that will expand given background, e.g. bolden some lines
 * that follow white points in the background
 * 
 * Create cool effect by building on broken distorted pixels that create some kind of hallucination
 * 
 * Try to add something like broken non-straight lines, because they seem like a natural thing that comes out of this
 * hallucination. Closed-eyes are just inspiration, I should not try to copy that because I cant and it's not necessary.
 * 
 * Algorithm: how to find adjecent points that have the strongest opacity.
 *      1. Choose random bright point from the array.
 *      2. Look around you (first circle) and choose the brightest point. If all points are completely dark, step out to another circle.
 *      3. Using this approach, repeat and create a path that consists of max N bright points, or if you go outside the canvas.
 *      4. You can't choose point that was already selected.
 * 
 *      @important Function for this algorithm is missing. Replace "paths" drawing with this function.
 * 
 * @Tech
 * - extract managers to module files
 * - clean up and prettify code
 * - create a TypeScript build system for this project
 * - this may be a custom web element that has verbose configuration (everything is optional)
 */
function main()
{
    const options =
    {
        alphaDelta: 20,
        drawPadding: 20,
        frameDelay: 100,
        blobPolygonSize: 8,
        blobPolygonDistance: 150,
        blobColor:
        {
            r: 203,
            g: 203,
            b: 216,
            a: 0.1
        },
        noiseColor:
        {
            r: 185,
            g: 185,
            b: 202
        },
        blobs:
        {
            minWidthFactor:  0.10, // 1 means same as screen height, 0.5 means half of the screen height
            maxWidthFactor:  0.15, // 1 means same as screen width, 0.5 means half of the screen width
            minHeightFactor: 0.21, // 1 means same as screen height, 0.5 means half of the screen height
            maxHeightFactor: 0.33  // 1 means same as screen height, 0.5 means half of the screen height
        }
    }

    const canvasManager = new CanvasManager( options.blobColor, options.noiseColor, options.drawPadding );
    const imageManager  = new ImageManager( options.noiseColor );

    canvasManager.setup();

    algorithmSecond( canvasManager, imageManager, options );
}

function algorithmSecond( canvasManager, imageManager, options )
{
    // TODO: Programatically generate frames where count is N
    const backgrounds = [
        imageManager.generateDistortedArray( canvasManager.pixelCount, 13, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 18, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 17, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 18, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 17, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 18, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 17, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 18, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 17, 120 ),
        imageManager.generateDistortedArray( canvasManager.pixelCount, 16, 120 )
    ];

    const paths = [
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs ),
        imageManager.generatePathArray( canvasManager.pixelCountX, canvasManager.pixelCountY, 150, options.blobs )
    ];

    let backgroundIndex = 0;
    let pathIndex       = 0;
    let index           = 0;

    canvasManager.drawImage( backgrounds[ backgroundIndex ] );

    window.setInterval(
        () =>
        {
            if ( index === 0 )
            {
                index = 1;

                // if ( ++pathIndex === paths.length )
                // {
                //     pathIndex = 0;
                // }

                // canvasManager.mergeAndDrawImage( paths[ pathIndex ], options.alphaDelta );
            }
            else
            {
                index = 0;

                if ( ++backgroundIndex === backgrounds.length )
                {
                    backgroundIndex = 0;
                }

                canvasManager.mergeAndDrawImage( backgrounds[ backgroundIndex ], options.alphaDelta );
            }
        },
        options.frameDelay
    );
}

class CanvasManager
{
    canvas;
    context;
    padding = 24;
    pixelCountX = 0;
    pixelCountY = 0;

    constructor( blobColor, noiseColor, padding )
    {
        this.canvas  = document.querySelector( "canvas" );
        this.context = this.canvas.getContext( "2d", { willReadFrequently: true } );

        this.padding    = padding;
        this.blobColor  = blobColor;
        this.noiseColor = noiseColor;

        this.context.strokeStyle = `rgb(${ noiseColor.r }, ${ noiseColor.g }, ${ noiseColor.b })`;
    }

    setup()
    {
        this.resize();
        window.addEventListener( "resize", () => this.resize() );
    }

    resize()
    {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.context.clearRect( 0, 0, window.innerWidth, window.innerHeight );

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
        const existingImageData = this.context.getImageData(
            this.padding,
            this.padding,
            this.pixelCountX,
            this.pixelCountY
        );

        for ( let i = 0; i < existingImageData.data.length; i += 4 )
        {
            // TODO: image data should be manipulated inside ImageManager
            // It's okay to set all pixels to the same value since their visibility is dictated by opacity
            // TODO: is it possible to set all pixels to the same color during creation so I don't have to have 3 extra operations?
            existingImageData.data[ i + 0 ] = this.noiseColor.r;
            existingImageData.data[ i + 1 ] = this.noiseColor.g;
            existingImageData.data[ i + 2 ] = this.noiseColor.b;
            existingImageData.data[ i + 3 ] = Math.min( 255, Math.max( 0, existingImageData.data[ i + 3 ] - alphaDelta + imageDataArray[ i + 3 ] ) );
        }

        this.context.putImageData( existingImageData, this.padding, this.padding );
    }

    get pixelCount()
    {
        return  this.pixelCountX * this.pixelCountY;
    }
}

class ImageManager
{
    noiseColor =
    {
        r: 255,
        g: 255,
        b: 255
    }

    constructor( noiseColor )
    {
        this.noiseColor = noiseColor;
    }

    /**
     * @param pixelCount Number of pixels in an image, e.g. 100x50 image has 5000 pixels.
     * @param coverage   Percentage of how many of total pixels should have a non-transparent value.
     *                   For example pass 50 for 50% percent, i.e. 2500 pixels in 100x50 image.
     * @param maxStep    Maximum random seqeuence step, i.e. maximum distance between two pixels.
     *                   Affects how condensed is the distorted array.
     * @return frame
     */
    generateDistortedArray( pixelCount, coverage, maxStep )
    {
        const byteCount = 4 * pixelCount;
        const arr = new Uint8ClampedArray( byteCount );

        // Generate random sequences
        // TODO: generate opacity sequence
        const opacitySequence = [ 13, 88, 180, 220, 126, 27 ]; // Fade-in fade-out
        //const opacitySequence = [ 66, 99, 99, 99, 99, 66 ]; // Fade-in fade-out
        const pixelSequence   = Array.from(
            { length: ( coverage / 100 ) * pixelCount },
            () => Math.floor( Math.random() * maxStep )
        );

        // Iterate over all pixels using a custom sequence and opacity values based on the another sequence
        for (
            let iterator = 4 * pixelSequence[ 0 ], pixelIndex = 0, opacityIndex = 0;
            iterator < byteCount;
            iterator += 4 * pixelSequence[ pixelIndex ],
            pixelIndex = pixelIndex < pixelSequence.length - 1 ? ++pixelIndex : 0,
            opacityIndex = opacityIndex < opacitySequence.length - 1 ? ++opacityIndex : 0
        ) {
            arr[ iterator + 0 ] = this.noiseColor.r;
            arr[ iterator + 1 ] = this.noiseColor.g;
            arr[ iterator + 2 ] = this.noiseColor.b;
            arr[ iterator + 3 ] = opacitySequence[ opacityIndex ];
        }

        return arr;
    }

    /**
     * ...
     * @return frame
     */
    generateBlobArray( screenWidth, screenHeight, opacity, options )
    {
        const blobWidth  = utilities.getRandomFromInterval(
            Math.floor( screenWidth * options.minWidthFactor   ),
            Math.floor( screenWidth * options.maxWidthFactor   )
        );

        const blobHeight = utilities.getRandomFromInterval(
            Math.floor( screenHeight * options.minHeightFactor ),
            Math.floor( screenHeight * options.maxHeightFactor )
        );

        const offsetX = utilities.getRandomFromInterval( 0, screenWidth - blobWidth   );
        const offsetY = utilities.getRandomFromInterval( 0, screenHeight - blobHeight );

        const startRow = offsetY;
        const endRow   = offsetY + blobHeight;

        const centerColumn = Math.floor( offsetX + blobWidth / 2 );
        const inflection   = blobHeight / 2;

        const pixelCount = screenWidth * screenHeight;
        const byteCount = 4 * pixelCount;
        const arr = new Uint8ClampedArray( byteCount );

        for ( let row = startRow, iterator = 0; row < endRow; ++row, ++iterator )
        {
            const factor      = utilities.fadeIn( iterator < inflection ? iterator / inflection : 1 - ( iterator % inflection ) / inflection );
            const leftWidth   = Math.ceil( factor * utilities.getRandomFromInterval( 20, blobWidth / 2 ) );
            const rightWidth  = Math.ceil( factor * utilities.getRandomFromInterval( 20, blobWidth / 2 ) );
            const startColumn = centerColumn - leftWidth;
            const endColumn   = centerColumn + rightWidth;

            for ( let column = startColumn; column < endColumn; ++column )
            {
                const pixelIndex = ( 4 * screenWidth ) * row + 4 * column;

                arr[ pixelIndex + 0 ] = this.noiseColor.r;
                arr[ pixelIndex + 1 ] = this.noiseColor.g;
                arr[ pixelIndex + 2 ] = this.noiseColor.b;
                arr[ pixelIndex + 3 ] = opacity;
            }
        }

        return arr;
    }

    generatePathArray( screenWidth, screenHeight, opacity, options )
    {
        const pathWidth  = utilities.getRandomFromInterval(
            Math.floor( screenWidth * options.minWidthFactor   ),
            Math.floor( screenWidth * options.maxWidthFactor   )
        );
        const pathHeight = utilities.getRandomFromInterval(
            Math.floor( screenHeight * options.minHeightFactor ),
            Math.floor( screenHeight * options.maxHeightFactor )
        );

        const offsetX = utilities.getRandomFromInterval( 0, screenWidth - pathWidth   );
        const offsetY = utilities.getRandomFromInterval( 0, screenHeight - pathHeight );

        const startRow = offsetY;
        const endRow   = offsetY + pathHeight;

        const centerColumn = offsetX + pathWidth;
        const inflection   = pathHeight / 2;

        const pixelCount = screenWidth * screenHeight;
        const byteCount = 4 * pixelCount;
        const arr = new Uint8ClampedArray( byteCount );

        for ( let row = startRow, iterator = 0; row < endRow; ++row, ++iterator )
        {
            const factor = utilities.fadeIn( iterator / pathHeight );
            const centerColumnWithOffset = centerColumn - Math.floor( factor * pathWidth );

            const pixelIndex = ( 4 * screenWidth ) * row + 4 * centerColumnWithOffset;

            arr[ pixelIndex + 0 ] = this.noiseColor.r;
            arr[ pixelIndex + 1 ] = this.noiseColor.g;
            arr[ pixelIndex + 2 ] = this.noiseColor.b;
            arr[ pixelIndex + 3 ] = opacity;
        }

        return arr;
    }
}

const utilities =
{
    getRandomFromInterval: ( min, max ) => Math.floor( Math.random() * ( max - min ) + min ),
    fadeIn: ( x ) => 1 - ( 1 - x ) * ( 1 - x ) * ( 1 - x )
}

window.addEventListener( "DOMContentLoaded", () => main() );
