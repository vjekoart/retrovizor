/**
 * Create primitive web visits statistics based on nginx access logs.
 *
 * Internal JSON structure:
 *
 * Array<{ year: 2025, month: "mar", requests: N, "unique-ips": N, paths: Array<{ url: "/", count: N }> }>
 */

// TODO: ENV or default values
const _LOGS_PATH =  "";
const _STATS_PATH = "";

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

async function extractMonthly ( logs )
{}

async function getAccessLogs ()
{}

/**
 * Append HTML visits report (string) to master report located on the path
 * that's provided.
 */
async function mergeReport ( report, masterPath )
{}

async function textToJSON ( text )
{}

async function main ()
{
    console.log( `[${ new Date().toISOString() }] nginx-statistics.js:main` );

    const logs       = await getAccessLogs ( _LOGS_PATH );
    const monthly    = await extractMonthly( logs       );
    const structured = await textToJSON    ( monthly    );
    const analysed   = await analyse       ( structured );
    const report     = await createReport  ( analysed   );

    await mergeReport( `${ _STATS_PATH }/index.html` );
}

main();

