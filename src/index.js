import
{
    DummyService,
    Utilities
}
from "/library/index.js";

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
 * @Tech
 * - extract managers to module files
 * - generate stuff on worker? initialization part has an impact on performance and UX
 * - clean up and prettify code
 * - create a TypeScript build system for this project
 * - this may be a custom web element that has verbose configuration (everything is optional)
 */
function main()
{
    // Testing
    Utilities.dummyUtility();
    const dummyService = new DummyService();

    // Real code
    const options =
    {
        alphaDelta: 20,
        alphaDeltaFade: 10,
        drawPadding: 0,
        frameCount: 24,
        frameDelay: 30,
        noiseColor:
        {
            r: 185,
            g: 185,
            b: 202
        },
        accentColor:
        {
            r: 200,
            g: 200,
            b: 213
        },
        minDotOpacity: 30,
        maxDotOpacity: 120,
        maxImaginaryLineLength: 200,
        imaginaryLineDotOpacityIncrease: 120
    }

    const canvasManager = new CanvasManager( options.drawPadding );
    const imageManager  = new ImageManager(
        options.accentColor,
        options.noiseColor,
        options.minDotOpacity,
        options.maxDotOpacity,
        options.imaginaryLineDotOpacityIncrease
    );

    canvasManager.setup();

    algorithm( canvasManager, imageManager, options );
}

function algorithm( canvasManager, imageManager, options )
{
    const backgrounds = [];

    for ( let i = 0; i < options.frameCount; ++i )
    {
        const coverage   = utilities.getRandomFromInterval( 5, 10 );
        const maxStep    = utilities.getRandomFromInterval( 80, 120 );
        const background = imageManager.generateDistortedArray( canvasManager.pixelCount, coverage, maxStep );

        backgrounds.push( background );
    }

    const imaginaryLines = [];

    for ( const background of backgrounds )
    {
        const imaginaryLine = imageManager.generateImaginaryLine(
            background,
            canvasManager.pixelCountX,
            canvasManager.pixelCountY,
            options.maxImaginaryLineLength
        )

        imaginaryLines.push( imaginaryLine );
    }

    let backgroundIndex = 0;
    let lineIndex       = 0;
    let machineIndex    = 0;

    // States: "BG", "BLANK", "LINE"
    //const machine = [ "BG", "BLANK", "BLANK", "BLANK", "LINE", "BLANK", "BLANK", "BLANK", "BLANK", "BLANK" ];
    //const machine = [ "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "BG", "LINE" ];
    const machine = [ "BG", "BG", "BG", "BG", "BG", "BG", "LINE" ];

    // TODO: draw lines rarely, so they really make an impact
    window.setInterval(
        () =>
        {
            if ( machineIndex === machine.length )
            {
                machineIndex = 0;
            }

            const step = machine[ machineIndex ];

            if ( step === "BG" )
            {
                canvasManager.mergeAndDrawImage( backgrounds[ backgroundIndex ], options.alphaDelta );

                ++backgroundIndex;

                if ( backgroundIndex === backgrounds.length )
                {
                    backgroundIndex = 0;
                }
            }

            if ( step === "LINE" )
            {
                canvasManager.mergeAndDrawImage( imaginaryLines[ lineIndex ], options.alphaDelta );

                ++lineIndex;

                if ( lineIndex === imaginaryLines.length )
                {
                    lineIndex = 0;
                }
            }

            if ( step === "BLANK" )
            {
                // TODO: just lower the opacity of all canvas
                canvasManager.fadeImage( options.alphaDeltaFade );
            }

            ++machineIndex;
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

    get pixelCount()
    {
        return this.pixelCountX * this.pixelCountY;
    }

    constructor( padding )
    {
        this.canvas  = document.querySelector( "canvas" );
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

class ImageManager
{
    accentColor =
    {
        r: 255,
        g: 255,
        b: 255
    }

    noiseColor =
    {
        r: 255,
        g: 255,
        b: 255
    }

    minDotOpacity = 0;
    maxDotOpacity = 255;
    imaginaryLineDotOpacityIncrease = 0;

    constructor( accentColor, noiseColor, minDotOpacity, maxDotOpacity, imaginaryLineDotOpacityIncrease )
    {
        this.accentColor   = accentColor;
        this.noiseColor    = noiseColor;
        this.minDotOpacity = minDotOpacity;
        this.maxDotOpacity = maxDotOpacity;
        this.imaginaryLineDotOpacityIncrease = imaginaryLineDotOpacityIncrease;
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
        const opacitySequence = utilities.getRandomArray( 300, this.minDotOpacity, this.maxDotOpacity );
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
     * Algorithm: how to find adjecent points that have the strongest opacity.
     *      1. Choose random bright point from the array.
     *      2. Look around you (first circle) and choose the brightest point. If all points are completely dark, step out to another circle.
     *      3. Using this approach, repeat and create a path that consists of max N bright points, or if you go outside the canvas.
     *      4. You can't choose point that was already selected.
     * 
     * @param frame       Uint8ClampedArray where each element represents a pixel.
     * @param imageWidth
     * @param imageHeight
     * @param maxLength   Number representing max length of the imaginary line in pixels.
     */
    generateImaginaryLine( frame, imageWidth, imageHeight, maxLength )
    {
        const _startingPointPaddingFactor = 0.4; // Starting box from where the brightest point should be selected
        const _deadEndPaddingFactor = 0.05;      // Line should bounce if it enters this part of the frame, e.g. 10% on each axis/side

        // Find the brightest point in the starting box, influenced by _startingPointPaddingFactor
        const getStartingPoint = () =>
        {
            const startX = Math.ceil( _startingPointPaddingFactor * imageWidth );
            const startY = Math.ceil( _startingPointPaddingFactor * imageHeight );
            const endX   = Math.floor( imageWidth - startX );
            const endY   = Math.floor( imageHeight - startY );

            const startIndex = 4 * ( ( startY - 1 ) * imageWidth + ( startX - 1 ) );
            const brightest  = { x: startX, y: startY, a: frame[ startIndex + 3 ] };

            for ( let xi = startX; xi < endX; ++xi )
            {
                for ( let yi = startY; yi < endY; ++yi )
                {
                    const index = 4 * ( ( yi - 1 ) * imageWidth + ( xi - 1 ) );
                    const currentPixel = { x: xi, y: yi, a: frame[ index + 3 ] };

                    if ( currentPixel.a > brightest.a )
                    {
                        brightest.x = currentPixel.x;
                        brightest.y = currentPixel.y;
                        brightest.a = currentPixel.a;
                    }
                }
            }

            return brightest;
        }

        const findImaginaryLine = ( startingPoint ) =>
        {
            const line = [ startingPoint ];

            const paddingWidth    = Math.floor( _deadEndPaddingFactor * imageWidth  );
            const paddingHeight   = Math.floor( _deadEndPaddingFactor * imageHeight );
            const availableWidth  = imageWidth  - 2 * paddingWidth;
            const availableHeight = imageHeight - 2 * paddingHeight;

            const getNearbySpots = ( focalPoint, searchXLength, searchYLength ) =>
            {
                let startX = focalPoint.x - searchXLength;
                let startY = focalPoint.y - searchYLength;
                let endX   = focalPoint.x + searchXLength;
                let endY   = focalPoint.y + searchYLength;

                if ( startX < paddingWidth  ) startX = paddingWidth;
                if ( startY < paddingHeight ) startY = paddingHeight;
                if ( endX   > availableWidth  + paddingWidth  ) endX = availableWidth + paddingWidth;
                if ( endY   > availableHeight + paddingHeight ) endY = availableHeight + paddingHeight;

                const spots = [];

                // Top and bottom sides
                for ( let xi = startX; xi < endX; ++xi ) spots.push( { x: xi, y: startY } );
                for ( let xi = startX; xi < endX; ++xi ) spots.push( { x: xi, y: endY   } );

                // Left and right sides
                for ( let yi = startY + 1; yi < endY - 1; ++yi ) spots.push( { x: startX, y: yi } );
                for ( let yi = startY + 1; yi < endY - 1; ++yi ) spots.push( { x: endX,   y: yi } );

                // Remove duplicates
                for ( const index in spots )
                {
                    const isDuplicate = line.find( ( point ) =>
                    {
                        return spots[ index ].x === point.x && spots[ index ].y === point.y;
                    } );

                    if ( isDuplicate ) spots.splice( index, 1 );
                }

                // Add opacity information
                for ( const spot of spots )
                {
                    const index = 4 * ( ( spot.y - 1 ) * imageWidth + ( spot.x - 1 ) );
                    spot.a = frame[ index + 3 ];
                }

                return spots;
            }

            const findBrightestNearbySpot = ( focalPoint, searchXLength, searchYLength ) =>
            {
                const brightest = { x: null, y: null, a: null };

                getNearbySpots( focalPoint, searchXLength, searchYLength ).forEach( ( spot ) =>
                {
                    if ( spot.a > 0 && ( brightest === null || spot.a >= brightest.a ) )
                    {
                        brightest.x = spot.x;
                        brightest.y = spot.y;
                        brightest.a = Math.min( 255, spot.a + this.imaginaryLineDotOpacityIncrease );
                    }
                } );

                return brightest.x === null ? null : brightest;
            }

            // At the beginning just look at nearest (1px distance) pixels to find the brightest one
            let focalPoint    = startingPoint;
            let searchXLength = 1;
            let searchYLength = 1;

            while (
                line.length < maxLength &&
                ( searchXLength < availableWidth || searchYLength < availableHeight )
            ) {
                const brightestNearbySpot = findBrightestNearbySpot( focalPoint, searchXLength, searchYLength );

                if ( brightestNearbySpot )
                {
                    line.push( brightestNearbySpot );
                    focalPoint = brightestNearbySpot;
                    searchXLength = 1;
                    searchYLength = 1;

                    continue;
                }

                ++searchXLength;
                ++searchYLength;
            } 

            return line;
        }

        const generateFrameFromLine = ( lineArray ) =>
        {
            const byteCount = 4 * imageWidth * imageHeight;
            const arr = new Uint8ClampedArray( byteCount );

            for ( const spot of lineArray )
            {
                const index = 4 * ( ( spot.y - 1 ) * imageWidth + ( spot.x - 1 ) );

                arr[ index + 0 ] = this.noiseColor.r;
                arr[ index + 1 ] = this.noiseColor.g;
                arr[ index + 2 ] = this.noiseColor.b;
                arr[ index + 3 ] = spot.a;
            }

            return arr;
        }

        return generateFrameFromLine(
            findImaginaryLine(
                getStartingPoint()
            )
        );
    }
}

const utilities =
{
    getRandomFromInterval: ( min, max ) => Math.floor( Math.random() * ( max - min ) + min ),
    getRandomArray: ( n, min, max ) => Array.from( { length: n }, () => utilities.getRandomFromInterval( min, max ) ),
    fadeIn: ( x ) => 1 - ( 1 - x ) * ( 1 - x ) * ( 1 - x )
}

window.addEventListener( "DOMContentLoaded", () => main() );
