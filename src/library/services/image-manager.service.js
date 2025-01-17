import { getRandomArray } from "Library/utilities.js";

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
        const opacitySequence = getRandomArray( 300, this.minDotOpacity, this.maxDotOpacity );
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

export { ImageManager }
