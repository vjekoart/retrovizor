/**
 * Components' definition file. Place with majority of custom code when it comes to product codebase organization.
 *
 * @see Readme.md
 */
import * as Library from "./library.js";

const Configuration = Library.general.getConfiguration();

export async function build ()
{
    try
    {
        await Library.frontend.ensureBuildFolder( Configuration, true );
        await Library.frontend.copyAssets       ( Configuration );

        const loopState =
        {
            library : {},
            scripts : {},
            styles  : {}
        };

        loopState.library = await Library.frontend.buildLibrary( Configuration );
        loopState.scripts = await Library.frontend.buildScripts( Configuration );
        loopState.styles  = await Library.frontend.buildStyles ( Configuration, loopState.library.styles );

        await Library.frontend.generateHTML( Configuration, loopState );
    }
    catch ( error )
    {
        console.error( "[build:error]", error );
    }
}

export function deploy ()
{
    console.log( "Hello from deploy!" );
}

export async function dev ()
{
    try
    {
        const loopState =
        {
            library : {},
            scripts : {},
            styles  : {}
        };

        await Library.frontend.ensureBuildFolder( Configuration );
        Library.frontend.startServer( Configuration );

        Library.frontend.watchLoop( Configuration, async changes =>
        {
            console.info( "\nStarting the loop...\n" );

            if ( changes.copyAssets )
            {
                await Library.frontend.copyAssets( Configuration );
            }
            if ( changes.buildLibrary )
            {
                loopState.library = await Library.frontend.buildLibrary( Configuration, true );
            }
            if ( changes.buildScripts )
            {
                loopState.scripts = await Library.frontend.buildScripts( Configuration, true );
            }
            if ( changes.buildStyles )
            {
                loopState.styles  = await Library.frontend.buildStyles ( Configuration, loopState.library.styles, true );
            }
            if ( changes.generateHTML )
            {
                await Library.frontend.generateHTML( Configuration, loopState, true );
            }

            console.info( "\nLoop completed." );
        } );
    }
    catch ( error )
    {
        console.error( "[dev:error]", error );
    }
}

export function start ()
{
    console.log( "Hello from start!" );
}

export function test ()
{
    Library.frontend.tests.runWebBrowser( Configuration );
}

export function e2e ()
{
    Library.frontend.tests.runE2E( Configuration );
}

/* Expose component methods, to others and to the CLI */
Library.general.expose(
    [
        build,
        deploy,
        dev,
        start,
        test,
        e2e
    ],
    dev
);
