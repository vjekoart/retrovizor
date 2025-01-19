import { CloseYourEyes } from "Library";

function main ()
{
    const canvas        = document.querySelector( "#close-your-eyes" );
    const closeYourEyes = new CloseYourEyes( canvas );

    closeYourEyes.onEvent = ( name, data ) =>
    {
        console.log( "closeYourEyes.onEvent", name, data );
    }

    closeYourEyes.setup();
    closeYourEyes.generate();
    closeYourEyes.run();
}

window.addEventListener( "DOMContentLoaded", main );
