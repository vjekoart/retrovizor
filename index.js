/**
 * Components' definition file. Place with majority of custom code when it comes to product codebase organization.
 *
 * @see Readme.md
 */
import * as Library from "./library.js";
import * as Bits    from "./index.bits.js";

import Configuration from "./configuration.json" assert { type: "json" };

/**
 * TODO
 * - Support for nested views
 * - compileInjectStyles: injection is done via templating actually, that can be done in a better way
 * - compileInjectScripts: injection is done via templating actually, that can be done in a better way
 * - ??? try/catch block here doesn't make sense? whoever runs this will watch on output, important that return code is not 0
 * - ??? Create bundle for nested (imported) CSS files that are not part of the library OR move modules to appropriate place in dist
 * - ??? Create bundle for nested (imported) JS files that are not part of the library OR move modules to appropriate place in dist
 */
export async function build ()
{
    try
    {
        await Bits.ensureBuildFolder( Configuration.buildPath );

        Bits.generateHTML        ( Configuration.buildPath, Configuration.internals, Configuration.dataFile );
        // TODO: Compile "library" and inject in every view
        Bits.compileInjectStyles ( Configuration.buildPath, Configuration.internals );
        Bits.compileInjectScripts( Configuration.buildPath, Configuration.internals );
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

export function dev ()
{
    console.log( "Hello from dev!" );
}

export function start ()
{
    console.log( "Hello from start!" );
}

export function test ()
{
    console.log( "Hello from test!" );
}

/* Expose component methods, to others and to the CLI */
Library.expose(
    [
        build,
        deploy,
        dev,
        start,
        test
    ],
    dev
);