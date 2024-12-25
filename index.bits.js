/**
 * Auxiliary methods for components' index.js file.
 *
 * Keep in mind that this is also full of potential candidates for utility library,
 * but specifically for the NodeJS namespace (everything's gonna be NodeJS at the beginning).
 */
import Autoprefixer from "autoprefixer";
import Babel        from "@babel/core";
import Chokidar     from "chokidar";
import CSSNano      from "cssnano";
import FS           from "fs/promises";
import Handlebars   from "handlebars";
import HTTP         from "http";
import Jasmine      from "jasmine";
import Path         from "path";
import PostCSS      from "postcss";
import ServeHandler from "serve-handler";
import URL          from "url";

import { performance } from "node:perf_hooks";

function checkPath( path, isDirectory = false )
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

async function compileAndMoveScript ( inputFilePath, outputFilePath, buildType, dev = false )
{
    console.info( `[compileAndMoveScript] Starting Babel process for '${ inputFilePath }'...` );

    const babelOptions = {
        compact: !dev,
        presets: [ "@babel/preset-env" ],
        // TODO: related to "Configuration.buildType" === "native"
        caller:
        {
            // TODO: generalize this logic, i.e. protect the `library` namespace based on the internals location
            name: "/library/index.js",
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

    console.info( "[compileAndMoveScript] Done." );
}

async function compileAndMoveStyle ( inputFilePath, outputFilePath, buildType, dev = false )
{
    console.info( `[compileAndMoveStyle] Starting PostCSS process for '${ inputFilePath }'...` );

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

    console.info( "[compileAndMoveStyle] Done." );
}

/** "homepage.html.hbs" to "homepage" */
function getOutputViewName ( file )
{
    return file.replace( ".html", "" ).replace( ".hbs", "" );
}

/** "layout.homepage.html.hbs" to "layout.homepage" */
function getPartialNameFromFileName ( file )
{
    const fileSplit  = file.split( "." );
    const extensions = [ "html", "hbs" ];

    extensions.forEach( x => fileSplit.splice( fileSplit.indexOf( x ), 1 ) );

    return fileSplit.join( "." );
}

function getRootPath ()
{
    return Path.dirname( URL.fileURLToPath( import.meta.url ) );
}

async function getUnitTestFiles ( path )
{
    const files = await FS.readdir( path, { recursive: true } );

    return files.filter( x => x.includes( ".test." ) );
}

/**
 * @param {Array<string>} folders
 */
async function makeFolders ( buildPath, folders )
{
    const fullBuildPath = Path.join( getRootPath(), buildPath );

    for ( const folder of folders )
    {
        console.info( `[makeFolders] Making folder '${ folder }'...` );
        await FS.mkdir( Path.join( fullBuildPath, folder ), { recursive: true } );
    }
}

/**
 * @param { key: content } files Every key represents filename, while content is textual
 *                               content that should be written to a file.
 */
async function writeBuildFiles ( buildPath, files )
{
    const fullBuildPath = Path.join( getRootPath(), buildPath );

    for ( const file in files )
    {
        console.info( `[writeBuildFiles] Writing file '${ file }'...` );
        await FS.writeFile( Path.join( fullBuildPath, file ), files[ file ] );
    }
}

async function writeFile ( path, content )
{
    console.info( `[writeFile] Writing a file to '${ path }'...` );

    await FS.mkdir    ( path.split( "/" ).slice( 0, -1 ).join( "/" ), { recursive: true } );
    await FS.writeFile( path,                                         content             );
}

class WatchPool
{
    constructor ( onChange )
    {
        this.delayBeforePublishingChanges = 1000;
        this.timerId = null;
        this.changes = {
            buildLibrary: false,
            buildStyles: false,
            buildScripts: false,
            generateHTML: false
        }

        this.onChange = onChange;
    }

    publishChanges ()
    {
        this.onChange( this.changes );
        this.changes = {
            buildLibrary: false,
            buildStyles: false,
            buildScripts: false,
            generateHTML: false
        }
    }

    push ( path )
    {
        this.resetTimer();

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
            () => {
                this.publishChanges();
                this.timerId = null;
            },
            this.delayBeforePublishingChanges
        );
    }
}


/**
 * PUBLIC
 */


export async function buildLibrary ( buildPath, buildType, internals, dev = false )
{
    performance.mark( "buildLibrary:start" );
    console.info( "[buildLibrary] Starting..." );

    const fullLibraryPath = Path.join( getRootPath(), internals.libraryPath );
    const libraryFiles    = await FS.readdir( fullLibraryPath, { recursive: true } );
    const compilePromises = [];

    for ( const file of libraryFiles )
    {
        const inputPath  = Path.join( fullLibraryPath, file );
        const outputPath = Path.join( getRootPath(), buildPath, internals.libraryBuild, file );

        if ( file.endsWith( ".css" ) )
        {
            compilePromises.push( compileAndMoveStyle( inputPath, outputPath, buildType, dev ) );
        }
        if ( file.endsWith( ".js" ) )
        {
            compilePromises.push( compileAndMoveScript( inputPath, outputPath, buildType, dev ) );
        }
    }

    await Promise.all( compilePromises );

    // What about web components? They import node modules, so need to handle that
    // Handle with Babel, it's possible to know if something is e.g. CJS module or native

    console.info( "[buildLibrary] Done." );
    performance.mark( "buildLibrary:end" );
}

export async function buildScripts ( buildPath, buildType, internals, dev = false )
{
    performance.mark( "buildScripts:start" );
    console.info( "[buildScripts] Starting Babel process..." );

    const fullIndexPath  = Path.join( getRootPath(), internals.indexScript                 );
    const fullOutputPath = Path.join( getRootPath(), buildPath, internals.indexScriptBuild ); 

    await compileAndMoveScript( fullIndexPath, fullOutputPath, buildType, dev );

    console.info( "[buildScripts] Done." );
    performance.mark( "buildScripts:end" );
}

export async function buildStyles ( buildPath, buildType, internals, dev = false )
{
    performance.mark( "buildStyles:start" );
    console.info( "[buildStyles] Starting PostCSS process..." );

    const fullIndexPath  = Path.join( getRootPath(), internals.indexStyle                 );
    const fullOutputPath = Path.join( getRootPath(), buildPath, internals.indexStyleBuild );

    await compileAndMoveStyle( fullIndexPath, fullOutputPath, buildType, dev );

    console.info( "[buildStyles] Done." );
    performance.mark( "buildStyles:end" );
}

export async function ensureBuildFolder ( buildPath )
{
    performance.mark( "ensureBuildFolder:start" );
    console.info( "[ensureBuildPath] Checking build folder..." );

    const fullPath = Path.join( getRootPath(), buildPath );

    try
    {
        await checkPath( fullPath, true );    
    }
    catch ( error )
    {
        if ( error.code === "ENOENT" )
        {
            await FS.mkdir( fullPath, { recursive: true } )
            console.info( "[ensureBuildPath] Build folder created." );
            performance.mark( "ensureBuildFolder:end" );
            return;
        }

        performance.mark( "ensureBuildFolder:end" );
        throw error;
    }

    console.info( "[ensureBuildPath] Done." );
    performance.mark( "ensureBuildFolder:end" );
}

export async function generateHTML ( buildPath, internals, dataFile = null, dev = false )
{
    performance.mark( "generateHTML:start" )
    console.info( "[generateHTML] Starting template generation..." );

    const fullTemplatesPath = Path.join( getRootPath(), internals.templatesPath );
    const fullViewsPath     = Path.join( getRootPath(), internals.viewsPath     );
    const fullIndexPath     = Path.join( getRootPath(), internals.indexTemplate );
    const fullDataFilePath  = Path.join( getRootPath(), dataFile );

    console.info( "[generateHTML] Registering Handlebars partials..." );

    const partials = {
        index: await FS.readFile( fullIndexPath, { encoding: "utf8" } )
    };

    const templateFiles = await FS.readdir( fullTemplatesPath );

    for ( const file of templateFiles )
    {
        if ( file.startsWith( internals.layoutPrefix ) )
        {
            const name    = getPartialNameFromFileName( file );
            const content = await FS.readFile( Path.join( fullTemplatesPath, file ), { encoding: "utf8" } );

            partials[ name ] = content;
        }
    }

    Handlebars.registerPartial( partials );

    console.info( "[generateHTML] Compiling views..." );

    const data          = dataFile ? JSON.parse( await FS.readFile( fullDataFilePath, { encoding: "utf8" } ) ) : {};
    const viewFiles     = await FS.readdir( fullViewsPath );
    const outputFiles   = {};
    const outputFolders = [];

    for ( const file of viewFiles )
    {
        const content  = await FS.readFile( Path.join( fullViewsPath, file ), { encoding: "utf8" } );
        const template = Handlebars.compile( content );
        const fileName = getOutputViewName( file );

        if ( fileName !== "index" )
        {
            outputFolders.push( fileName );
        }

        outputFiles[ fileName === "index" ? "index.html" : `${ fileName }/index.html` ] = template( Object.assign( { data }, { internals } ) );
    }

    await makeFolders    ( buildPath, outputFolders );
    await writeBuildFiles( buildPath, outputFiles   );

    console.info( "[generateHTML] Done." );
    performance.mark( "generateHTML:end" );
}

export function startServer( buildPath, internals )
{
    const fullBuildPath = Path.join( getRootPath(), buildPath );

    console.info( "[startServer] Starting..." );

    const server = HTTP.createServer( ( request, response ) =>
    {
        ServeHandler( request, response, { public: fullBuildPath } );
    } );

    server.listen( internals.devPort, () =>
    {
        console.info( `[startServer] Listening on port ${ internals.devPort }...` );
    } )
}

/**
 * @param {( changes ) => void} onChange
 * changes = { buildLibrary: boolean, buildStyles: boolean, buildScripts: boolean, generateHTML: boolean }
 */
export function watchLoop ( internals, onChange )
{
    console.info( "[watchLoop] Starting the loop..." );

    const fullSourcePath = Path.join( getRootPath(), internals.sourcePath );
    const watchPool      = new WatchPool( onChange );

    Chokidar
        .watch( fullSourcePath, { persistent: true, usePolling: true } )
        .on( "all", ( event, path ) =>
        {
            if ( event === "add" || event === "change" )
            {
                console.info( "[watchLoop]", event, path );
                watchPool.push( path );
            }
        } );
}

export const tests =
{
    runUnit: async ( internals ) =>
    {
        const root   = Path.join( getRootPath(), internals.sourcePath );
        const units  = await getUnitTestFiles( root );
        const runner = new Jasmine();

        runner.loadConfig( {
            spec_dir   : internals.sourcePath,
            spec_files : units
        } );

        const results = await runner.execute();

        console.info( results );
    }
};
