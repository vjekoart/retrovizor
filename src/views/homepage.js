import { CloseYourEyes } from "Library";

function main ()
{
    const canvas        = document.querySelector( "canvas" );
    const closeYourEyes = new CloseYourEyes( canvas );

    closeYourEyes.setup();
    closeYourEyes
        .generate()
        .then(() =>
        {
            closeYourEyes.run();
        })
        .catch(( error ) =>
        {
            console.warn( error );
            alert( "There was an error!" );
        });
}

window.addEventListener( "DOMContentLoaded", main );
