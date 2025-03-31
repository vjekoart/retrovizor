/**
 * Create primitive web visits statistics based on nginx access logs.
 */
import { open, writeFile } from "node:fs/promises";

/**
 * Input arguments
 */
const _DOMAIN = process.env.DOMAIN;

if ( !_DOMAIN )
{
    console.error( "Missing DOMAIN!" );
    process.exit( 1 );
}

const _PATH_LOGS  = process.env.PATH_LOGS  ?? `/var/log/nginx/${ _DOMAIN }.access.log`;
const _PATH_STATS = process.env.PATH_STATS ?? `/var/www/stats.${ _DOMAIN }/html/index.html`;

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
    console.info( "analyse" );

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
 * @param { function analyse } analysis    Structured analysis results.
 * @param { string           } periodName  Name of the analysis period for display purposes.
 * @return { string }
 */
async function createReport ( analysis, periodName )
{
    console.info( "createReport", periodName, analysis );

    const paths = analysis.paths.map( el => `<li><strong>"${ el.url }"</strong>: ${ el.count }</li>` ).join( "" );

    return `
        <section>
            <h2>${ periodName }</h2>
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
    console.info( "getAccessLogs", pathLogs, dateMatch );

    const results = [];
    const file    = await open( pathLogs );

    for await ( const line of file.readLines() )
    {
        if ( line.includes( dateMatch ) )
        {
            results.push( line );
        }
    }

    return results;
}

/**
 * Create or extend existing report HTML file.
 *
 * @param { string } pathMasterReport  Path to a report HTML file.
 * @param { string } report            HTML snippet representing a single report.
 */
async function mergeReport ( pathMasterReport, report )
{
    console.info( "mergeReport", pathMasterReport, report );

    await writeFile( pathMasterReport, report, { flag: "a" } );
}

async function main ()
{
    console.info( "Running nginx-statistics.js ..." );

    const today        = new Date().toDateString().split( " " );
    const currentMonth = `${ today[ 1 ] }/${ today[ 3 ] }`;

    const logs       = await getAccessLogs( _PATH_LOGS, currentMonth );
    const analysed   = await analyse      ( logs                     );
    const report     = await createReport ( analysed, currentMonth   );

    await mergeReport( _PATH_STATS, report );
}

main();

