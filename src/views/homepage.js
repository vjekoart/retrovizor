import { Blank } from "Library";

const dom =
{
    canvas : document.querySelector( "canvas"  ),
    bright : document.querySelector( "#bright" )
}

async function main ()
{
    dom.bright.classList.remove( "hidden" );

    const blank = new Blank( dom.canvas );

    await blank.setup();

    blank
        .generate()
        .then(() =>
        {
            dom.bright.classList.add( "hidden" );
            window.setTimeout( () => blank.run(), 660 );
        })
        .catch( error =>
        {
            console.warn( error );
            alert( "There was an error!" );
        });
}

window.addEventListener( "DOMContentLoaded", main );
