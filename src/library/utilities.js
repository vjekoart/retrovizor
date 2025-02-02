const Colors =
{
    /** From "#ffffff" to { r : 255, g : 255, b : 255 } */
    hexToObjectRGB : hex =>
    {
        if ( !hex.startsWith( "#" ) || !( hex.length === 4 || hex.length === 7 ) )
        {
            throw "Invalid color format!";
        }

        const r = parseInt( hex.length === 4 ? hex.slice( 1, 2 ) : hex.slice( 1, 3 ), 16 );
        const g = parseInt( hex.length === 4 ? hex.slice( 2, 3 ) : hex.slice( 3, 5 ), 16 );
        const b = parseInt( hex.length === 4 ? hex.slice( 3, 4 ) : hex.slice( 5, 7 ), 16 );

        return { r, g, b }
    },

    /** From { r : 255, g : 255, b : 255 } to "#ffffff" */
    objectRGBToHex : rgb =>
    {
        const r = rgb.r.toString( 16 ).padStart( 2, "0" );
        const g = rgb.g.toString( 16 ).padStart( 2, "0" );
        const b = rgb.b.toString( 16 ).padStart( 2, "0" );

        return `#${ r }${ g }${ b }`;
    }
}

function getRandomFromInterval ( min, max )
{
    return Math.floor( Math.random() * ( max - min ) + min );
}

function getRandomArray ( length, min, max )
{
    return Array.from({ length }, () => getRandomFromInterval( min, max ));
}

function formatCodeBlocks ()
{
    const preElements = document.getElementsByTagName( "pre" );

    Array.from( preElements ).forEach( preEl =>
    {
        /* Indentation */
        const content      = preEl.innerHTML;
        const indentations = [ ...content.matchAll( /(\s+)\S+.*/gm ) ];
        const purified     = content.replace( new RegExp( indentations[ 0 ][ 1 ], "gm" ), "" );

        preEl.outerHTML = `<pre>${ purified }</pre>`;
    });
}

export
{
    Colors,
    getRandomArray,
    getRandomFromInterval,
    formatCodeBlocks
}
