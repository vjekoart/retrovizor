import { getRandomArray } from "Library/utilities.js";

/**
 * @ImageManager
 *
 * Generates dots and imaginary lines frames in the form of ImageData.data arrays.
 *
 * @usage
 * TODO
 *
 * @constructor options
 * {
 *     colors :
 *     {
 *         noise : { r : 255, g : 255, b : 255 }
 *     },
 *     dot :
 *     {
 *         opacity :
 *         {
 *             min : 0,
 *             max : 255
 *         }
 *     },
 *     imaginaryLineDotOpacityIncrease : 0
 * }
 */
class ImageManager
{
    constructor( options = {} )
    {
        this.colors =
        {
            noise : options.colors?.noise ?? { r : 255, g : 255, b : 255 }
        }

        this.dot =
        {
            opacity :
            {
                min : options.dot?.opacity?.min ?? 0,
                max : options.dot?.opacity?.max ?? 255
            }
        }

        this.imaginaryLineDotOpacityIncrease = options.imaginaryLineDotOpacityIncrease ?? 0;
    }

    /**
     * Generates a frame with randomly placed bright dots.
     *
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
        const array     = new Uint8ClampedArray( byteCount );

        const opacitySequence = getRandomArray( 300, this.dot.opacity.min, this.dot.opacity.max );
        const pixelSequence   = Array.from
        (
            { length: ( coverage / 100 ) * pixelCount },
            () => Math.floor( Math.random() * maxStep )
        );

        for (
            let iterator = 4 * pixelSequence[ 0 ],
            pixelIndex   = 0,
            opacityIndex = 0;
            iterator < byteCount;
            iterator    += 4 * pixelSequence[ pixelIndex ],
            pixelIndex   = pixelIndex   < pixelSequence.length - 1   ? ++pixelIndex   : 0,
            opacityIndex = opacityIndex < opacitySequence.length - 1 ? ++opacityIndex : 0
        ) {
            array[ iterator + 0 ] = this.colors.noise.r;
            array[ iterator + 1 ] = this.colors.noise.g;
            array[ iterator + 2 ] = this.colors.noise.b;
            array[ iterator + 3 ] = opacitySequence[ opacityIndex ];
        }

        return array;
    }

    /**
     * Generates a frame with randomly selected imaginary line, based on the adjecent points with the strongest
     * opacity.
     *
     * 1. Choose random bright point from the array.
     * 2. Look around the starting point (first circle) and choose the brightest point. If all points are completely dark,
     *    step out to another circle.
     * 3. Using this approach, repeat and create a path that consists of max N bright points. Stop if outside the canvas.
     * 4. Skip points that are already selected.
     * 
     * @param frame       Uint8ClampedArray where each element represents a pixel.
     * @param imageWidth
     * @param imageHeight
     * @param maxLength   Number representing max length of the imaginary line in pixels.
     * @return frame
     */
    generateImaginaryLine( frame, imageWidth, imageHeight, maxLength )
    {
        const _startingPointPaddingFactor = 0.4;  /* Starting box from where the brightest point should be selected                     */
        const _deadEndPaddingFactor       = 0.05; /* Line should bounce if it enters this part of the frame, e.g. 10% on each axis/side */

        /* Find the brightest point in the starting box, influenced by _startingPointPaddingFactor */
        const getStartingPoint = () =>
        {
            const startX = Math.ceil ( _startingPointPaddingFactor * imageWidth  );
            const startY = Math.ceil ( _startingPointPaddingFactor * imageHeight );
            const endX   = Math.floor( imageWidth - startX  );
            const endY   = Math.floor( imageHeight - startY );

            const startIndex = 4 * ( ( startY - 1 ) * imageWidth + ( startX - 1 ) );
            const brightest  = { x : startX, y : startY, a : frame[ startIndex + 3 ] }

            for ( let xi = startX; xi < endX; ++xi )
            {
                for ( let yi = startY; yi < endY; ++yi )
                {
                    const index        = 4 * ( ( yi - 1 ) * imageWidth + ( xi - 1 ) );
                    const currentPixel = { x : xi, y : yi, a : frame[ index + 3 ] }

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

                /* Top and bottom sides    */
                for ( let xi = startX; xi < endX; ++xi ) spots.push( { x : xi, y : startY } );
                for ( let xi = startX; xi < endX; ++xi ) spots.push( { x : xi, y : endY   } );

                /* Left and right sides    */
                for ( let yi = startY + 1; yi < endY - 1; ++yi ) spots.push( { x : startX, y : yi } );
                for ( let yi = startY + 1; yi < endY - 1; ++yi ) spots.push( { x : endX,   y : yi } );

                /* Remove duplicates       */
                for ( const index in spots )
                {
                    const isDuplicate = line.find( point => spots[ index ].x === point.x && spots[ index ].y === point.y );

                    if ( isDuplicate ) spots.splice( index, 1 );
                }

                /* Add opacity information */
                for ( const spot of spots )
                {
                    const index = 4 * ( ( spot.y - 1 ) * imageWidth + ( spot.x - 1 ) );
                    spot.a = frame[ index + 3 ];
                }

                return spots;
            }

            const findBrightestNearbySpot = ( focalPoint, searchXLength, searchYLength ) =>
            {
                const brightest = { x : null, y : null, a : null }

                getNearbySpots( focalPoint, searchXLength, searchYLength ).forEach( spot =>
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

            /* At the beginning just look at nearest (1px distance) pixels to find the brightest one */
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

                    focalPoint    = brightestNearbySpot;
                    searchXLength = 1;
                    searchYLength = 1;

                    continue;
                }

                ++searchXLength;
                ++searchYLength;
            } 

            return line;
        }

        const generateFrameFromLine = lineArray =>
        {
            const byteCount = 4 * imageWidth * imageHeight;
            const array     = new Uint8ClampedArray( byteCount );

            for ( const spot of lineArray )
            {
                const index = 4 * ( ( spot.y - 1 ) * imageWidth + ( spot.x - 1 ) );

                array[ index + 0 ] = this.colors.noise.r;
                array[ index + 1 ] = this.colors.noise.g;
                array[ index + 2 ] = this.colors.noise.b;
                array[ index + 3 ] = spot.a;
            }

            return array;
        }

        return generateFrameFromLine( findImaginaryLine( getStartingPoint() ) );
    }
}

export { ImageManager }
