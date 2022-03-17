const _STEP_DURATION     = 1000 / 24;
const _GRID_STROKE_WIDTH = 2;
const _GRID_STROKE_COLOR = "#911c08";
const _GRID_SIZE         = 24;

export async function drawGrid( parent, canvas, footer )
{
    parent.style[ "padding" ] = `0`;

    await _waitFor( 1 );

    const parentClientRect = parent.getBoundingClientRect();
    const width = _GRID_SIZE * Math.floor( parentClientRect.width / _GRID_SIZE );

    const gridCountX = width / _GRID_SIZE;
    const gridCountY = Math.floor( parentClientRect.height / _GRID_SIZE );

    const paddingY = parentClientRect.height - gridCountY * _GRID_SIZE;
    const paddingX = ( parentClientRect.width - width );

    canvas.width  = width;
    canvas.height = parentClientRect.height - paddingY;
    
    canvas.style[ "width" ]   = `${ width }px`;
    canvas.style[ "height" ]  = `${ canvas.height }px`;
    parent.style[ "padding" ] = `${ paddingY / 2 }px ${ paddingX / 2 }px`;
    footer.style[ "padding" ] = `0 ${ paddingX / 2 }px ${ paddingY / 2 }px 0`;

    const menuItemsCount = parent.querySelectorAll( "section li" ).length;
    if ( menuItemsCount % 2 !== gridCountY % 2 )
    {
        parent.classList.add( "has-padding" );
    }
    else
    {
        parent.classList.remove( "has-padding" );
    }

    _drawGrid( canvas, _GRID_SIZE, gridCountX, gridCountY );
}

async function _drawGrid( canvas, gridSize, countX, countY )
{
    const context = canvas.getContext( "2d" );

    context.strokeStyle = _GRID_STROKE_COLOR;
    context.lineWidth   = _GRID_STROKE_WIDTH;

    for ( let i = 0; i < countX + countY; ++i )
    {
        const rectangles = [];

        for ( let j = 0; j < countY; ++j )
        {
            if ( ( i - j ) * gridSize < 0 )
            {
                continue;
            }

            context.strokeRect( ( i - j ) * gridSize, j * gridSize, gridSize, gridSize );
        }

        await _waitFor( _STEP_DURATION );
    }
}

function _waitFor( timeMs )
{
    return new Promise( ( resolve, reject ) =>
    {
        window.setTimeout( () => resolve(), timeMs );
    } );
}