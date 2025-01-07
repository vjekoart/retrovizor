import Autoprefixer   from "autoprefixer";
import Babel          from "@babel/core";
import CSSNano        from "cssnano";
import FS             from "fs/promises";
import Path           from "path";
import PostCSS        from "postcss";
import URL            from "url";

export function checkPath( path, isDirectory = false )
{
    return new Promise( ( resolve, reject ) =>
    {
        FS.stat( path )
            .then( stat =>
            {
                if ( isDirectory && !stat.isDirectory() )
                {
                    reject( `[checkPath] Path '${ path }' is not a directory!` );
                    return;
                }

                resolve();
            } )
            .catch( error => reject( error ) );
    } );
}

export async function compileAndMoveScript ( inputFilePath, outputFilePath, buildType, dev = false )
{
    const babelOptions = {
        compact: !dev,
        presets: [ "@babel/preset-env" ],
        sourceMaps: true,
        // TODO: related to "Configuration.buildType" === "native"
        caller:
        {
            // TODO: generalize this logic, i.e. protect the `library` namespace based on the internals location
            name: "Library",
            supportsStaticESM: true
        }
    };

    const content = await FS.readFile( inputFilePath, { encoding: "utf8" } );
    const results = await Babel.transformAsync( content, babelOptions );

    await writeFile( outputFilePath, results.code );

    if ( results.map )
    {
        await writeFile( `${ outputFilePath }.map`, results.map.toString() );
    }
}

export async function compileAndMoveStyle ( inputFilePath, outputFilePath, buildType, dev = false )
{
    const postPlugins = [ Autoprefixer ];

    if ( dev === false )
    {
        postPlugins.push( CSSNano );
    }

    const content = await FS.readFile( inputFilePath, { encoding: "utf8" } );
    const from    = inputFilePath;
    const to      = outputFilePath;
    const map     = true;
    const results = await PostCSS( postPlugins ).process( content, { from, to, map } );

    await writeFile( outputFilePath, results.css );

    if ( results.map )
    {
        await writeFile( `${ outputFilePath }.map`, results.map.toString() );
    }
}

/** "layout.homepage.html.hbs" to "layout.homepage" */
export function getPartialNameFromFileName ( file )
{
    const fileSplit  = file.split( "." );
    const extensions = [ "html", "hbs" ];

    extensions.forEach( x => fileSplit.splice( fileSplit.indexOf( x ), 1 ) );

    return fileSplit.join( "." );
}

export function getRootPath ()
{
    return Path.dirname( URL.fileURLToPath( import.meta.url ) );
}

export async function getTestFiles ( path, includes )
{
    const files = await FS.readdir( path, { recursive: true } );

    return files.filter( x => x.includes( includes ) );
}

export async function writeFile ( path, content )
{
    console.info( `[writeFile] Writing a file to '${ path }'...` );

    await FS.mkdir    ( path.split( "/" ).slice( 0, -1 ).join( "/" ), { recursive: true } );
    await FS.writeFile( path, content );
}

export class WatchPool
{
    constructor ( onChange )
    {
        this.delayBeforePublishingChanges = 1000;
        this.timerId = null;
        this.changes = {
            buildLibrary : false,
            buildStyles  : false,
            buildScripts : false,
            copyAssets   : false,
            generateHTML : false
        }

        this.onChange = onChange;
    }

    publishChanges ()
    {
        this.onChange( this.changes );
        this.changes = {
            buildLibrary : false,
            buildStyles  : false,
            buildScripts : false,
            copyAssets   : false,
            generateHTML : false
        }
    }

    push ( path )
    {
        this.resetTimer();

        // TODO: add suport for "node_modules", right now this is relevant only for buildType = "native"
        if ( path.includes( "/assets/" ) )
        {
            this.changes.copyAssets = true;
            return;
        }
        if ( path.includes( "/library/" ) )
        {
            this.changes.buildLibrary = true;
            return;
        }
        if ( path.endsWith( ".html" ) || path.endsWith( ".hbs" ) )
        {
            this.changes.generateHTML = true;
        }
        if ( path.endsWith( ".css" ) )
        {
            this.changes.buildStyles = true;
        }
        if ( path.endsWith( ".js" ) )
        {
            this.changes.buildScripts = true;
        }
    }

    resetTimer ()
    {
        if ( this.timerId )
        {
            clearTimeout( this.timerId );
        }

        this.timerId = setTimeout(
            () =>
            {
                this.publishChanges();
                this.timerId = null;
            },
            this.delayBeforePublishingChanges
        );
    }
}
