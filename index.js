/**
 * Components' definition file. Place with majority of custom code when it comes to product codebase organization.
 *
 * @see Readme.md
 */
import * as Library from "./library.js";

const Configuration = Library.general.getConfiguration();

/**
 * TODO
 * - Support for nested views
 * - buildStyles: injection is done via templating actually, that can be done in a better way
 * - buildScripts: injection is done via templating actually, that can be done in a better way
 * - ??? try/catch block here doesn't make sense? whoever runs this will watch on output, important that return code is not 0
 * - ??? Create bundle for nested (imported) CSS files that are not part of the library OR move modules to appropriate place in dist
 * - ??? Create bundle for nested (imported) JS files that are not part of the library OR move modules to appropriate place in dist
 */
export async function build ()
{
    try
    {
        await Library.frontend.ensureBuildFolder( Configuration );
        await Promise.all([
            Library.frontend.copyAssets  ( Configuration ),
            Library.frontend.generateHTML( Configuration ),
            Library.frontend.buildLibrary( Configuration ),
            Library.frontend.buildScripts( Configuration ),
            Library.frontend.buildStyles ( Configuration )
        ]);
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
        await Library.frontend.ensureBuildFolder( Configuration );
        Library.frontend.startServer( Configuration );
        Library.frontend.watchLoop( Configuration, changes =>
        {
            if ( changes.copyAssets )
            {
                Library.frontend.copyAssets( Configuration );
            }
            if ( changes.generateHTML )
            {
                Library.frontend.generateHTML( Configuration, true );
            }
            if ( changes.buildLibrary )
            {
                Library.frontend.buildLibrary( Configuration, true );
            }
            if ( changes.buildScripts )
            {
                Library.frontend.buildScripts( Configuration, true );
            }
            if ( changes.buildStyles )
            {
                Library.frontend.buildStyles( Configuration, true );
            }
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
    // TODO tests.runE2E
}

/* Expose component methods, to others and to the CLI */
Library.general.expose(
    [
        build,
        deploy,
        dev,
        start,
        test
    ],
    dev
);
