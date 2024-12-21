/**
 * Auxiliary methods for components' index.js file.
 *
 * Keep in mind that this is also full of potential candidates for utility library,
 * but specifically for the NodeJS namespace (everything's gonna be NodeJS at the beginning).
 */
import Autoprefixer from "autoprefixer";
import Babel        from "@babel/core";
import CSSNano      from "cssnano";
import FS           from "fs/promises";
import Handlebars   from "handlebars";
import Path         from "path";
import PostCSS      from "postcss";
import URL          from "url";

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

export async function compileInjectStyles ( buildPath, internals )
{
    const fullIndexPath = Path.join( getRootPath(), internals.indexStyle );

    await checkPath( fullIndexPath );

    console.info( "[compileInjectStyles] Starting PostCSS process..." );

    const postPlugins = [
        Autoprefixer,
        CSSNano
    ];

    const content = await FS.readFile( fullIndexPath, { encoding: "utf8" } );
    const from    = fullIndexPath;
    const to      = Path.join( getRootPath(), buildPath, internals.indexStyleBuild );
    const map     = true;
    const results = await PostCSS( postPlugins ).process( content, { from, to, map } );
    const files   = {};

    files[ internals.indexStyleBuild ] = results.css;

    if ( results.map )
    {
        files[ `${ internals.indexStyleBuild }.map` ] = results.map.toString();
    }

    await writeBuildFiles( buildPath, files );

    console.info( "[compileInjectStyles] Done." );
}

export async function compileInjectScripts ( buildPath, internals )
{
    const fullIndexPath = Path.join( getRootPath(), internals.indexScript );

    await checkPath( fullIndexPath );

    console.info( "[compileInjectScripts] Starting Babel process..." );

    const babelOptions = {
        compact: true,
        presets: [ "@babel/preset-env" ]
    };

    const content = await FS.readFile( fullIndexPath, { encoding: "utf8" } );
    const results = await Babel.transformAsync( content, babelOptions );
    const files   = {};

    files[ internals.indexScriptBuild ] = results.code;

    if ( results.map )
    {
        files[ `${ internals.indexScriptBuild }.map` ] = results.map.toString();
    }

    await writeBuildFiles( buildPath, files );

    console.info( "[compileInjectScripts] Done." );
}

export async function ensureBuildFolder ( buildPath )
{
    if ( !buildPath )
    {
        throw new Error( "[ensureBuildPath] Missing buildPath!" );
    }

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
            return;
        }

        throw error;
    }

    console.info( "[ensureBuildPath] Done." );
}

export async function generateHTML ( buildPath, internals, dataFile = null )
{
    console.info( "[generateHTML] Starting template generation..." );

    const fullSourcePath    = Path.join( getRootPath(), internals.sourcePath    );
    const fullTemplatesPath = Path.join( getRootPath(), internals.templatesPath );
    const fullViewsPath     = Path.join( getRootPath(), internals.viewsPath     );
    const fullIndexPath     = Path.join( getRootPath(), internals.indexTemplate );
    const fullDataFilePath  = Path.join( getRootPath(), dataFile );

    await checkPath( fullSourcePath,    true );
    await checkPath( fullTemplatesPath, true );
    await checkPath( fullViewsPath,     true );
    await checkPath( fullIndexPath           );

    if ( dataFile )
    {
        await checkPath( fullDataFilePath );
    }

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
}
