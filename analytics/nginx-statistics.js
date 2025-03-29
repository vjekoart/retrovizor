/**
 * Create primitive web visits statistics based on nginx access logs.
 *
 * Internal JSON structure:
 *
 * Array<{ year: 2025, month: "mar", requests: N, "unique-ips": N, paths: Array<{ url: "/", count: N }> }>
 */

const _DOMAIN = process.env.DOMAIN;

if ( !_DOMAIN )
{
    console.error( "Missing DOMAIN!" );
    process.exit( 1 );
}

// TODO: change default value to retrovizor.xyz specific log file (requires modification of nginx configuration)
const _PATH_LOGS  = process.env.PATH_LOGS  ?? "/var/log/nginx/access.log";
const _PATH_STATS = process.env.PATH_STATS ?? `/var/www/stats.${ _DOMAIN }/html/index.html`;

async function analyse ( structured )
{}

/**
 * Create HTML visits report based on provided JSON data.
 * HTML consists of <ul> element with multiple <li> elements,
 * and nested children, if required.
 *
 * @param {json} jsonData
 * @return {string}
 */
async function createReport ( jsonData )
{}

async function extractMonth ( logs )
{}

async function getAccessLogs ( pathLogs )
{}

/**
 * Append HTML visits report (string) to master report located on the path
 * that's provided.
 */
async function mergeReport ( pathMasterReport, report )
{}

async function structure ( text )
{}

async function main ()
{
    console.log( `[${ new Date().toISOString() }] nginx-statistics.js:main` );

    const logs       = await getAccessLogs( _PATH_LOGS );
    const monthly    = await extractMonth ( logs       );
    const structured = await structure    ( monthly    );
    const analysed   = await analyse      ( structured );
    const report     = await createReport ( analysed   );

    await mergeReport( _PATH_STATS, report );
}

main();

