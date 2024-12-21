/**
 * Utility library that would be moved to a separate project, i.e. "product codebase organization"
 * library/utility.
 */
import { argv } from "node:process";

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
    const target = argv[ 2 ];

    if ( target !== undefined && !( target in exposed ) )
    {
        console.error( "Unknown function target:", target );
        return;        
    }

    ( exposed[ target ] || fallback )();
}