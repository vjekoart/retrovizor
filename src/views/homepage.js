import { Blank } from "Library";

const dom =
{
    canvas : document.querySelector( "canvas"  ),
    bright : document.querySelector( "#bright" )
}

async function main ()
{
    const blank = new Blank( dom.canvas );

    await blank.setup();

    blank.on = event =>
    {
        if ( event === "generate:start" ) dom.bright.classList.remove( "hidden" );
        if ( event === "generate:end"   ) dom.bright.classList.add   ( "hidden" );
    }

    blank
        .generate()
        .then(() =>
        {
            window.setTimeout( () => blank.run(), 660 );
        })
        .catch( error =>
        {
            console.warn( error );
            alert( "There was an error!" );
        });
}

window.addEventListener( "DOMContentLoaded", main );
