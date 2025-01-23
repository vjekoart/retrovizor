const renderComponent = ( selector, content ) => new Promise( resolve =>
{
    document.body.innerHTML = content;
    requestSelector( selector ).then( element => resolve( element ) );
});

const requestSelector = selector => new Promise( resolve => 
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
});

const waitFor = timeout => new Promise( resolve =>
{
    window.setTimeout( () => resolve(), timeout );
});

export
{
    renderComponent,
    requestSelector,
    waitFor
}
