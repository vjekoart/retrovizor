/**
 * Utility library that would be moved to a separate project, i.e. "product codebase organization"
 * library/utility.
 */
import Process from "node:process";
import FS      from "fs";

/**
 * Expose functions of the component to the CLI (and other parts of the codebase in the future).
 * 
 * @param { Array<Function> } functions Array of functions to expose.
 * @param { Function        } fallback  Function to execute if none was provided when called via CLI.
 */
export function expose ( functions, fallback )
{
    // Map functions
    const exposed = {};

    functions.forEach( x => exposed[ x.name ] = x );

    // Execute desired function
    const target = Process.argv[ 2 ];

    if ( target !== undefined && !( target in exposed ) )
    {
        console.error( "Unknown function target:", target );
        return;        
    }

    ( exposed[ target ] || fallback )();
}

/**
 * Return content of the `configuration.json` file merged with `.internals.json` file.
 */
export function getConfiguration ()
{
    const internals     = JSON.parse( FS.readFileSync( ".internals.json",    { encoding: "utf8" } ) );
    const configuration = JSON.parse( FS.readFileSync( "configuration.json", { encoding: "utf8" } ) );

    return Object.assign( configuration, { internals } );
}
