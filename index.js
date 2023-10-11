const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const chromium = require('chrome-aws-lambda');

// Puppeeteer because Twitch.tv is dynamic and not static
// First unofficial API

const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.json("Welcome to the Unofficial Twitch API");
});

app.get('/homepage', async (req, res) => {
    const browser = await chromium.puppeteer.launch({ 
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: 'new',
        executablePath: await chromium.executablePath || '/usr/bin/google-chrome',
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--disable-extentions'],
    });
    // let results = [];
    
    const page = await browser.newPage();
    const base_url = 'https://www.twitch.tv';

    await page.goto(base_url);

    // Load Show More
    show_more = await page.evaluate(() => {
        Array.from(document.querySelectorAll('p.CoreText-sc-1txzju1-0')).forEach(
            (el) => {
            if (el.textContent.includes("Show more")) {
                el.click();
            }
        });
    })
    // a = Array.from(show_more);
    // console.log(show_more);
    // await page.click(show_more);
    // await page.click('div.Layout-sc-1xcs6mc-0.eajNuk > button');

    // Live Channels we think you'll like
    const live_channels = await page.evaluate(() => {
        let items_ = [];

        const items = document.querySelectorAll('a[data-test-selector=TitleAndChannel]');
        const base_url = 'https://www.twitch.tv';
        items.forEach((item) => {
            const url = item.getAttribute('href');
            const title = item.querySelector('p[data-a-target=preview-card-channel-link]').innerHTML;
            items_.push({
                url: base_url + url,
                channel_name: title,
            });
        });

        return items_;

        
    });
    // results.push({ youll_like: live_channels });

    // First font page live channel
    // const front_page = await page.evaluate(() => {
    //     let items_ = [];

    //     const base_url = 'https://www.twitch.tv';

    //     const url = document.querySelector('a[data-test-selector=stream-info-card-component__title-link]').getAttribute('href');
    //     const title = document.querySelector('a[data-test-selector=stream-info-card-component__title-link]').innerHTML;

    //     items_.push({
    //         url: base_url + url,
    //         channel_name: title,
    //     });

    //     return items_;
    // });

    // results.push({ front_page: front_page });
   
    browser.close();
    
    res.json(live_channels);
});

app.get('/categories', async (req, res) => {
    const browser = await chromium.puppeteer.launch({ 
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--disable-extentions'],
    });
    const page = await browser.newPage();
    const new_url = 'https://www.twitch.tv/directory';

    await page.goto(new_url);

    const categories = await page.evaluate(() => {
        let items_ = [];

        const base_url = 'https://www.twitch.tv'
        // const cat = document.querySelectorAll('a.ScCoreLink-sc-16kq0mq-0.eYjhIv');
        const cat = document.querySelectorAll('div.Layout-sc-1xcs6mc-0.bZVrjx.tw-card-body');
        cat.forEach((card) => {
            const views = card.querySelector('p > a').innerHTML;
            const link = card.querySelector('a').getAttribute('href');
            const title = card.querySelector('h2').innerHTML;
            items_.push({
                link: base_url + link,
                title: title,
                views: views,
            });

        });

        return items_;
    });

    browser.close();
    res.json(categories);
});

function cleanText(str) {
    // let cleanStr = decodeURIComponent(str);
    let cleanStr = str;
    cleanStr = cleanStr.replaceAll('é', 'e');
    cleanStr = cleanStr.replaceAll('%C3%A9', 'e');
    cleanStr = cleanStr.replaceAll('+ ', '');
    cleanStr = cleanStr.replaceAll('&', 'and');
    cleanStr = cleanStr.replaceAll('!', '');
    cleanStr = cleanStr.replaceAll('\'', '');
    cleanStr = cleanStr.replaceAll(':', '');
    cleanStr = cleanStr.replaceAll(',', '');
    cleanStr = cleanStr.replaceAll('/', '');
    cleanStr = cleanStr.replaceAll(' ', '-');
    cleanStr = cleanStr.toLowerCase();

    return cleanStr;
}

app.get('/category/:categoryId', async (req, res) => {
    const browser = await chromium.puppeteer.launch({ 
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--disable-extentions'],
    });
    const page = await browser.newPage();
    const category = cleanText(req.params.categoryId);
    
    const url = 'https://www.twitch.tv/directory/category/' + category;

    await page.goto(url);

    const live_channels_in_dir = await page.evaluate(() => {
        let items_ = [];

        const container = document.querySelectorAll('div.Layout-sc-1xcs6mc-0.kJTxkr');
        // const container = document.querySelectorAll('a[data-test-selector=TitleAndChannel]');
        container.forEach((channel) => {
            const base_url = 'https://www.twitch.tv';
            const link = channel.querySelector('a').getAttribute('href');
            const title = channel.querySelector('a > h3').innerHTML;
            const channel_name = channel.querySelector('a > p').innerHTML;
            const viewers = channel.querySelector('div.Layout-sc-1xcs6mc-0.hkwQCo > div:nth-child(3) > div').innerHTML;

            items_.push({
                link: base_url + link,
                title: title,
                channel_name: channel_name,
                viewers: viewers,
            });
        });

        return items_;
    });

    browser.close();
    res.json(live_channels_in_dir);
});

app.get('/channel/:channelId', async (req, res) => {
    const browser = await chromium.puppeteer.launch({ 
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--disable-extentions'],
    });
    const page = await browser.newPage();

    const base_url = 'https://www.twitch.tv';
    const channel_id = '/' + req.params.channelId;
    const url = base_url + channel_id;

    await page.goto(url);

    const channelInfo = await page.evaluate(() => {
        let items_ = [];

        let liveStatus = ''
        let title = '';
        let category = '';
        let viewers = '';
        let live_time = '';
        const section = document.querySelectorAll('div.Layout-sc-1xcs6mc-0.bMvWIE > div');
        if (section.length == 0) {
            liveStatus = 'NOT LIVE';
            title = '';
            category = '';
            viewers = '0';
            live_time = '0:00:00';
        } else {
            liveStatus = document.querySelector('div.Layout-sc-1xcs6mc-0.bhLqhW').querySelector('p').innerText;
            title = section[0].querySelector('h2').innerText || '';
            category = section[0].querySelector('span').innerText || '';
            viewers = document.querySelector('p[data-a-target=animated-channel-viewers-count]').innerHTML || '0';
            live_time = section[1].querySelector('div > span').innerHTML || '0:00:00';
        }
        items_.push({
            status: liveStatus,
            title: title,
            category: category,
            viewers: viewers,
            live_time: live_time,
        });

        return items_;
    });

    browser.close();
    res.json(channelInfo);
});

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => console.log(`Alive on http://localhost:${PORT}/`));