const Apify = require("apify");

/**
 * Helper function which writes provided message into console log and then
 * exists the process with failure code.
 *
 * @param {String} errorMessage Message to be written into console log
 */
function crash(errorMessage) {
    console.log(errorMessage);
    process.exit(1);
}

/**
 * Store screen from puppeteer page to Apify key-value store
 * @param page - Instance of puppeteer Page class https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page
 * @param [key] - Function stores your screen in Apify key-value store under this key
 * @return {Promise<void>}
 */
const saveScreenshot = async (page, selector, key = "OUTPUT") => {
    let options = undefined;
    const padding = 0;

    console.log("selector", selector);

    if (selector) {
        const rect = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const { x, y, width, height } = element.getBoundingClientRect();
            return { left: x, top: y, width, height, id: element.id };
        }, selector);

        if (!rect)
            throw Error(
                `Could not find element that matches selector: ${selector}.`
            );

        options = {
            clip: {
                x: rect.left - padding,
                y: rect.top - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
            },
        };
    } else {
        options = { fullPage: true };
    }

    const screenshotBuffer = await page.screenshot(options);
    await Apify.setValue(key, screenshotBuffer, { contentType: "image/png" });
};

module.exports = {
    crash,
    saveScreenshot,
};
