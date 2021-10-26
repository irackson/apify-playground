// @ts-nocheck
const Apify = require('apify');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

Apify.main(async () => {
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    if (!input || !input.url)
        throw new Error('Input must be a JSON object with the "url" field!');

    console.log('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer();
    const page = await browser.newPage();
    const getFavicons = async (endpoint) => {
        console.log(`Opening page ${input.url}...`);
        await page.goto(endpoint);

        const body = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(body);
        // const html = $.html().;
        const links = $('a')
            .map((i, el) => $(el).attr('href'))
            .get();

        // fetch and save the favicon of each link in links by going to https://www.google.com/s2/favicons?domain=<domain>
        const favicons = await Promise.all(
            links
                // .map((link) => link.split('/')[2])
                // .filter((domain) => !domain.includes('undefined'))
                .map(async (domain) => {
                    let dataItems = null;
                    console.log(domain);

                    const [itemsRes] = await Promise.allSettled([
                        fetch(domain),
                    ]);

                    if (itemsRes.status === 'fulfilled') {
                        try {
                            dataItems =
                                itemsRes.value.headers.get('content-type');
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    return dataItems ?? 'unknown';
                })
        );

        return favicons;
    };

    const fav1 = await getFavicons(input.url);
    const fav2 = await getFavicons(input.customData.myURL);
    // ;
    await Apify.pushData({ fav1, fav2 });
    console.log('Closing Puppeteer...');
    await page.close();
    await browser.close();

    console.log('Done.');
});

// const faviconUrl = ;
// return faviconUrl;
