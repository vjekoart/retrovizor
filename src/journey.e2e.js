import puppeteer from "puppeteer";

import app from "../index.js";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe( "User journey", () =>
{
    let browser = null;
    let page    = null;

    beforeAll( async () =>
    {
        browser = await puppeteer.launch();
        page    = await browser.newPage();

        await page.setViewport({ width : 1366, height : 768 });
        await page.goto( app.frontend.tests.getE2ELocation() );
    });

    it( "Land on a homepage", async () =>
    {
        const titleSelector = await page.locator( "retro-title >>> a" ).waitHandle();
        const titleText     = await titleSelector?.evaluate( el => el.textContent );

        expect( titleText ).toContain( "trov" ); // Due to funny text
    });

    it( "Visit text page", async () =>
    {
        await page.locator( "retro-nav >>> a[data-name=\"text\"]" ).click();
        await page.waitForNavigation();

        const contentBlock = await page.$( "retro-content-block" );

        expect( contentBlock ).toBeTruthy();
    });

    it( "Visit code page", async () =>
    {
        await page.locator( "retro-nav >>> a[data-name=\"code\"]" ).click();
        await page.waitForNavigation();

        const experimentsSelector = await page.locator( "h2:nth-of-type(1)" ).waitHandle();
        const experimentsTitle    = await experimentsSelector?.evaluate( el => el.textContent );

        expect( experimentsTitle ).toContain( "Experiments" );

        const gistsSelector = await page.locator( "h2:nth-of-type(2)" ).waitHandle();
        const gistsTitle    = await gistsSelector?.evaluate( el => el.textContent );

        expect( gistsTitle ).toContain( "Gists" );

        const repositoriesSelector = await page.locator( "h2:nth-of-type(3)" ).waitHandle();
        const repositoriesTitle    = await repositoriesSelector?.evaluate( el => el.textContent );

        expect( repositoriesTitle ).toContain( "Git repositories" );
    });

    it( "Visit user page", async () =>
    {
        await page.locator( "retro-nav >>> a[data-name=\"user\"]" ).click();
        await page.waitForNavigation();

        const presenceSelector = await page.locator( "h2:nth-of-type(1)" ).waitHandle();
        const presenceTitle    = await presenceSelector?.evaluate( el => el.textContent );

        expect( presenceTitle ).toBe( "Online presence" );

        const careerSelector = await page.locator( "h2:nth-of-type(2)" ).waitHandle();
        const careerTitle    = await careerSelector?.evaluate( el => el.textContent );

        expect( careerTitle ).toBe( "Professional" );

        const personalSelector = await page.locator( "h2:nth-of-type(3)" ).waitHandle();
        const personalTitle    = await personalSelector?.evaluate( el => el.textContent );

        expect( personalTitle ).toBe( "Unprofessional" );
    });

    it( "Go back to the homepage", async () =>
    {
        await page.locator( "retro-nav >>> a[data-name=\"index\"]" ).click();
        await page.waitForNavigation();

        const canvas = await page.$( "canvas" );

        expect( canvas ).toBeTruthy();
    });

    afterAll( async () =>
    {
        await browser.close();
    });
});
