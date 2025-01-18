import { CloseYourEyes } from "Library";

function main ()
{
    const canvas        = document.querySelector( "#close-your-eyes" );
    const closeYourEyes = new CloseYourEyes( canvas );

    closeYourEyes.setup();
    closeYourEyes.generate();
    closeYourEyes.run();
}

window.addEventListener( "DOMContentLoaded", main );
