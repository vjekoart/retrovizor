import { drawGrid } from "./modules/draw-grid.js"

function main()
{
    const mainEl       = document.getElementsByTagName( "main" )[ 0 ];
    const footerEl     = document.getElementsByTagName( "footer" )[ 0 ];
    const canvasGridEl = document.getElementById( "canvas-grid" );

    if ( !mainEl )
    {
        throw "Could not find 'main' element!";
    }

    if ( !footerEl )
    {
        throw "Could not find 'footer' element!";
    }

    if ( !canvasGridEl )
    {
        throw "Could not find '#canvas-grid' element!";
    }

    window.setTimeout( () => drawGrid( mainEl, canvasGridEl, footerEl ), 500 );
    window.addEventListener( "resize", () => drawGrid( mainEl, canvasGridEl, footerEl ) );
}

window.addEventListener( "DOMContentLoaded", () => main() );