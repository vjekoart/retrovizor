const renderComponent = ( selector, content ) => new Promise( resolve =>
{
    document.body.innerHTML = content;

    function requestSelector ()
    {
        const element = document.querySelector( selector );

        if ( element )
        {
            resolve( element );
        }
        else
        {
            window.requestAnimationFrame( requestSelector );
        }
    }

    requestSelector();
} );

export { renderComponent };
