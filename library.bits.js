import Autoprefixer   from "autoprefixer";
import Babel          from "@babel/core";
import CSSNano        from "cssnano";
import { createHash } from "crypto";
import FS             from "fs/promises";
import FSSync         from "fs";
import Path           from "path";
import PostCSS        from "postcss";
import { cwd }        from "node:process";
import URL            from "url";

const _INTERNALS = JSON.parse( FSSync.readFileSync( ".internals.json", { encoding: "utf8" } ) );

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
    const babelOptions =
    {
        compact    : !dev,
        presets    : [ "@babel/preset-env" ],
        sourceMaps : true
    };

    if ( buildType === "native" )
    {
        babelOptions.caller =
        {
            name: "Library",
            supportsStaticESM: true
        };
    }

    const content = await FS.readFile( inputFilePath, { encoding: "utf8" } );

    let results;
    let code;

    try
    {
        results = await Babel.transformAsync( content, babelOptions );
        code    = results.code;
    }
    catch ( error )
    {
        console.info ( `\n[FILE] ${ inputFilePath }` );
        console.error( error.message, "\n" );
        return;
    }

    const hashedPath = await getFileHash( dev, { path : outputFilePath, content : code } );

    await writeFile( hashedPath, code );

    if ( results.map )
    {
        const content    = results.map.toString();
        const path       = `${ outputFilePath }.map`;
        const hashedPath = await getFileHash( dev, { path, content } );

        await writeFile( hashedPath, content );
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

    let results;
    let css;

    try
    {
        results = await PostCSS( postPlugins ).process( content, { from, to, map } );
        css    = results.css;
    }
    catch ( error )
    {
        console.info ( `\n[FILE] ${ inputFilePath }` );
        console.error( error.message, "\n" );
        return;
    }

    const hashedPath = await getFileHash( dev, { path : outputFilePath, content : css } );

    await writeFile( hashedPath, css );

    if ( results.map )
    {
        const content    = results.map.toString();
        const path       = `${ outputFilePath }.map`;
        const hashedPath = await getFileHash( dev, { path, content } );

        await writeFile( hashedPath, content );
    }
}

export function getE2ELocation ()
{
    return `http://${ _INTERNALS.tests.e2eHostname }:${ _INTERNALS.tests.e2ePort }/`;
}

/**
 * Define a `path` where's located a file for which hash needs to be calculated.
 * Provide a file content based on which hash is calculated.
 *
 * Returns new path with hash.
 */
export async function getFileHash ( dev, { content, path } = {} )
{
    if ( dev )
    {
        return path;
    }

    const hash = createHash( "sha1" );

    hash.setEncoding( "hex" );
    hash.write( content );
    hash.end();

    const sha1sum  = hash.read();
    const filename = path.split( "/" ).pop();

    let hashFileName;

    if ( filename.endsWith( ".js.map" ) )
    {
        hashFileName = filename.replace( /\.js\.map$/, `.${ sha1sum }.js.map` );
    }
    if ( filename.endsWith( ".js" ) )
    {
        hashFileName = filename.replace( /\.js$/, `.${ sha1sum }.js` );
    }
    if ( filename.endsWith( ".css.map" ) )
    {
        hashFileName = filename.replace( /\.css\.map$/, `.${ sha1sum }.css.map` );
    }
    if ( filename.endsWith( ".css" ) )
    {
        hashFileName = filename.replace( /\.css$/, `.${ sha1sum }.css` );
    }

    const units = path.split( "/" );

    units.pop();
    units.push( hashFileName );

    const hashPath = units.join( "/" );

    await writeHashFileName( path, hashPath );

    return hashPath;
}

export function getHashFileName ( configuration, path )
{
    const { buildPath } = configuration;

    const hashFilePath  = Path.join( getRootPath(), _INTERNALS.tempPath, _INTERNALS.hashFile );
    const hashFile      = JSON.parse( FSSync.readFileSync( hashFilePath, { encoding: "utf8" } ) ) ?? {};

    return hashFile[ path ];
}

export async function writeHashFileName ( originalPath, hashPath )
{
    const hashFilePath = Path.join( getRootPath(), _INTERNALS.tempPath, _INTERNALS.hashFile );

    let hashFile;

    try
    {
        await checkPath( hashFilePath, true );
        hashFile = JSON.parse( FSSync.readFileSync( hashFilePath, { encoding: "utf8" } ) );
    }
    catch ( error )
    {
        hashFile = {};
    }

    hashFile[ originalPath ] = hashPath;

    FSSync.writeFileSync( hashFilePath, JSON.stringify( hashFile ) );
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

/**
 * @param path {string} Full path of the folder with files.
 * @param modifiers { filter: x => x, input: x => x, output: x => x }
 * @return Array<{ input: fileNamePath, output: fileNamePath }>
 */
export async function getTargetFiles ( path, modifiers )
{
    const files = await FS.readdir( path, { recursive: true } );

    return files
        .filter( modifiers.filter )
        .map( x =>
        {
            return {
                input  : modifiers.input ( x ),
                output : modifiers.output( x )
            }
        } );
}

export async function getTestFiles ( path, includes )
{
    const files = await FS.readdir( path, { recursive: true } );

    return files.filter( x => x.includes( includes ) );
}

export function isScriptFile ( file )
{
    if ( !file.endsWith( ".js" ) )
    {
        return false;
    }
    if ( file.includes( _INTERNALS.tests.testUtilityIncludes ) )
    {
        return false;
    }
    if ( file.includes( _INTERNALS.tests.browserTestIncludes ) )
    {
        return false;
    }
    if ( file.includes( _INTERNALS.tests.e2eTestIncludes ) )
    {
        return false;
    }

    return true;
}

export async function readTemplates ()
{
    const {
        indexTemplate,
        layoutPrefix,
        templatesPath
    } = _INTERNALS;

    const fullIndexPath     = Path.join( getRootPath(), indexTemplate );
    const fullTemplatesPath = Path.join( getRootPath(), templatesPath );

    const partials =
    {
        index : await FS.readFile( fullIndexPath, { encoding : "utf8" } )
    };

    const templateFiles     = await FS.readdir( fullTemplatesPath );
    const htmlTemplateFiles = templateFiles.filter( x => x.endsWith( ".html" ) || x.endsWith( ".hbs" ) );

    for ( const file of htmlTemplateFiles )
    {
        if ( file.startsWith( layoutPrefix ) )
        {
            const name    = getPartialNameFromFileName( file );
            const content = await FS.readFile( Path.join( fullTemplatesPath, file ), { encoding : "utf8" } );

            partials[ name ] = content;
        }
    }

    return partials;
}

export async function writeViews ( Handlebars, configuration, buildPath, dataFile, dev )
{
    const {
        indexTemplate,
        layoutPrefix,
        templatesPath,
        viewsPath
    } = _INTERNALS;

    const fullBuildPath     = Path.join( getRootPath(), buildPath     );
    const fullViewsPath     = Path.join( getRootPath(), viewsPath     );
    const fullDataFilePath  = Path.join( getRootPath(), dataFile      );

    const data          = dataFile ? JSON.parse( await FS.readFile( fullDataFilePath, { encoding: "utf8" } ) ) : {};
    const templateData  = { data, configuration };
    const viewFiles     = await FS.readdir( fullViewsPath, { recursive: true } );
    const htmlViewFiles = viewFiles.filter( x => x.endsWith( ".html" ) || x.endsWith( ".hbs" ) );

    for ( const file of htmlViewFiles )
    {
        const content  = await FS.readFile( Path.join( fullViewsPath, file ), { encoding: "utf8" } );
        const template = Handlebars.compile( content );
        const fileName = file.endsWith( ".hbs" ) && file.replace( ".hbs", "" ) || file;

        await writeFile( Path.join( fullBuildPath, fileName ), template( templateData ) );
    }
}

export async function writeFile ( path, content )
{
    console.info( `Writing '${ path.replace( process.cwd(), "" ) }'...` );

    await FS.mkdir    ( path.split( "/" ).slice( 0, -1 ).join( "/" ), { recursive: true } );
    await FS.writeFile( path, content );
}

export class WatchPool
{
    constructor ( onChange )
    {
        this.delayBeforePublishingChanges = 1000;
        this.timerId = null;
        this.changes =
        {
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
        this.changes =
        {
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
