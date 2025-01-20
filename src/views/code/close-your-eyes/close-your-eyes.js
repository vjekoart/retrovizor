import { CloseYourEyes } from "Library";

function main ()
{
    const canvas        = document.querySelector( "#close-your-eyes" );
    const closeYourEyes = new CloseYourEyes( canvas );

    closeYourEyes.onEvent = ( name, data ) =>
    {
        console.log( "closeYourEyes.onEvent", name, data );

        // TODO: on 'generating' show loading state
        // TODO: on 'generating-done' hide loading state
        // TODO: maybe not here, but on error show error state
    }

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
