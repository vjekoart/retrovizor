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
        await Promise.all(
            [
            await Library.frontend.ensureBuildFolder( Configuration ),
            await Library.frontend.ensureTempFolder ( Configuration )
            ]
        );
        await Promise.all(
            [
                Library.frontend.copyAssets  ( Configuration ),
                Library.frontend.buildLibrary( Configuration ),
                Library.frontend.buildScripts( Configuration ),
                Library.frontend.buildStyles ( Configuration )
            ]
        );
        await Library.frontend.generateHTML( Configuration );
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
        await Promise.all(
            [
                await Library.frontend.ensureBuildFolder( Configuration ),
                await Library.frontend.ensureTempFolder ( Configuration )
            ]
        );

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
                await Library.frontend.buildLibrary( Configuration, true );
            }
            if ( changes.buildScripts )
            {
                await Library.frontend.buildScripts( Configuration, true );
            }
            if ( changes.buildStyles )
            {
                await Library.frontend.buildStyles( Configuration, true );
            }
            if ( changes.generateHTML )
            {
                await Library.frontend.generateHTML( Configuration, true );
            }

            console.log( "\nLoop completed." );
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
