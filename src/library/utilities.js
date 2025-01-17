const getRandomFromInterval = ( min, max ) => Math.floor( Math.random() * ( max - min ) + min );
const getRandomArray        = ( n, min, max ) => Array.from( { length: n }, () => getRandomFromInterval( min, max ) );

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
    } );
}

export
{
    getRandomArray,
    getRandomFromInterval,
    formatCodeBlocks
};
