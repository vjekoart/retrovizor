import { CloseYourEyes } from "Library";

const dom =
{
    canvas : document.querySelector( "canvas"  ),
    bright : document.querySelector( "#bright" )
}

function main ()
{
    dom.bright.classList.remove( "hidden" );

    const closeYourEyes = new CloseYourEyes( dom.canvas );

    closeYourEyes.setup();
    closeYourEyes
        .generate()
        .then(() =>
        {
            dom.bright.classList.add( "hidden" );
            window.setTimeout( () => closeYourEyes.run(), 660 );
        })
        .catch( error =>
        {
            console.warn( error );
            alert( "There was an error!" );
        });
}

window.addEventListener( "DOMContentLoaded", main );
