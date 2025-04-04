/**
 * Create primitive web visits statistics based on nginx access logs.
 */
import
{
    open,
    readFile, 
    writeFile
} from "node:fs/promises";

import { parse } from "node-html-parser";

/**
 * Input arguments
 *
 * ENV: PATH_LOGS, PATH_STATS
 * Arguments: period, e.g. "Mar:2025"
 */
const _DOMAIN = process.env.DOMAIN;

if ( !_DOMAIN )
{
    console.error( "Missing DOMAIN!" );
    process.exit( 1 );
}

const _PATH_LOGS  = process.env.PATH_LOGS  ?? `/var/log/nginx/${ _DOMAIN }.access.log`;
const _PATH_STATS = process.env.PATH_STATS ?? `/var/www/stats.${ _DOMAIN }/html/index.html`;
const _PERIOD     = process.argv[ 2 ] ?? null;

/**
 * Analyse nginx access log lines and produce statistics in JSON format.
 *
 * Number of paths in report is limited to 10.
 *
 * @param { Array<string> } text
 * @return { requests: N, unique: N, paths: Array<{ url: "/", count: N }> }
 */
async function analyse ( text )
{
    console.info( "Analysing raw logs..." );

    const paths = {}
    const ips   = {}

    const regex = new RegExp( ".+GET (/.*) HTTP.+" );

    for ( const line of text )
    {
        const request = line.match( regex );
        request?.[ 1 ] && ( paths[ request[ 1 ] ] = ( paths[ request[ 1 ] ] || 0 ) + 1 );

        const ip  = line.split( " " )[ 0 ];
        ips[ ip ] = null;
    }
    
    return {
        requests : text.length,
        paths    : Object.keys( paths ).map( el => ({ url : el, count : paths[ el ] }) ).toSorted( ( a, b ) => b.count - a.count ).toSpliced( 10 ),
        unique   : Object.keys( ips ).length
    }
}

/**
 * Creates a report of the analysis in the HTML format. See return statement for more details.
 *
 * @param { function analyse } analysis      Structured analysis results.
 * @param { string           } reportPeriod  Name of the analysis period for display purposes.
 * @return { string }
 */
async function createReport ( analysis, reportPeriod )
{
    console.info( `Creating a report for '${ reportPeriod }'...` );

    const paths = analysis.paths.map( el => `<li><strong>"${ el.url }"</strong>: ${ el.count }</li>` ).join( "" );

    return `
        <section data-period="${ reportPeriod }">
            <h2>${ reportPeriod }</h2>
            <ul>
                <li>Requests: <strong>${ analysis.requests }</strong></li>
                <li>Unique: <strong>${ analysis.unique }</strong></li>
                <li>Paths: <ol>${ paths }</ol>
                </li>
            </ul>
        </section>`;
}

/**
 * Retrieve access logs from a text file for a given time period.
 *
 * @param { string } pathLogs  Path to a nginx log file.
 * @param { string } dateMatch String that's compared with nginx datetime string from the log.
 * @return { Array<string> }
 */
async function getAccessLogs ( pathLogs, dateMatch )
{
    console.info( `Retrieving access logs on '${ pathLogs }' for period '${ dateMatch }'...` );

    const results = [];
    const file    = await open( pathLogs );

    for await ( const line of file.readLines() )
    {
        if ( line.includes( dateMatch ) )
        {
            results.push( line );
        }
    }

    await file.close();

    return results;
}

/**
 * Create or extend existing report HTML file.
 *
 * @param { string } pathMasterReport  Path to a report HTML file.
 * @param { string } report            HTML snippet representing a single report.
 * @param { string } reportPeriod      Name of the analysis period. Used for display purposes.
 */
async function mergeReport ( pathMasterReport, report, reportPeriod )
{
    console.info( `Merging a report to '${ pathMasterReport }'...` );

    const getInitialMarkdown = report => `<!doctype html>
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>Stats: ${ _DOMAIN }</title>
            </head>
            <body>
                ${ report }
            </body>
        </html>`;

    let reportContent;
    
    try
    {
        const content      = await readFile( pathMasterReport, { encoding : "utf8" } );
        const parsed       = parse( content );
        const existingNode = parsed.querySelector( `[data-period="${ reportPeriod }"]` );
        const reportNode   = parse( report );

        if ( !existingNode )
        {
            console.info( `...appending report for '${ reportPeriod }'` );

            parsed.querySelector( "body" ).appendChild( reportNode );
        }
        else
        {
            console.info( `...updating existing report for '${ reportPeriod }'` );

            existingNode.replaceWith( reportNode );
        }

        reportContent = parsed.toString();
    }
    catch ( error )
    {
        console.info( "...failed to modify or append with error:", error      );
        console.info( `...creating an initial report for '${ reportPeriod }'` );

        reportContent = getInitialMarkdown( report );
    }
    finally
    {
        if ( !reportContent ) return;

        await writeFile( pathMasterReport, reportContent  ); 
    }
}

async function main ()
{
    console.info( `Running nginx-statistics.js with '${ _PERIOD }'...` );

    const today        = new Date().toDateString().split( " " );
    const reportPeriod = _PERIOD ?? `${ today[ 1 ] }:${ today[ 3 ] }`;

    const logs       = await getAccessLogs( _PATH_LOGS, reportPeriod.split( ":" ).join( "/" ) );
    const analysed   = await analyse      ( logs                     );
    const report     = await createReport ( analysed, reportPeriod   );

    await mergeReport( _PATH_STATS, report, reportPeriod );

    console.info( "Done." );
}

main();

