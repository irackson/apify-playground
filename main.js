// @ts-nocheck
const Apify = require('apify');
const cheerio = require('cheerio');

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    if (!input || !input.url)
        throw new Error('Input must be a JSON object with the "url" field!');

    console.log('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer();

    console.log(`Opening page ${input.url}...`);
    const page = await browser.newPage();
    await page.goto(input.url);
    const body = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(body);
    // const html = $.html().;
    const links = $('a')
        .map((i, el) => $(el).attr('href'))
        .get();

    // fetch and save the favicon of each link in links by going to https://www.google.com/s2/favicons?domain=<domain>
    const favicons = await Promise.all(
        links.map(async (link) => {
            console.log(link);
            const domain = link.split('/')[2];
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}`;
            return faviconUrl;
        })
    );

    await Apify.pushData({ favicons });

    console.log('Closing Puppeteer...');
    await browser.close();

    console.log('Done.');
});
