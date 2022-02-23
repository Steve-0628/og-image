const twemoji = require('twemoji');
import { IncomingMessage, ServerResponse } from 'http';
import { parseRequest } from './_lib/parser';
import { getScreenshot } from './_lib/chromium';
import { getCss } from './_lib/template';
import { sanitizeHtml } from './_lib/sanitizer';
const twOptions = { folder: 'svg', ext: '.svg' };
const emojify = (text: string) => twemoji.parse(text, twOptions);

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    try {
        const parsedReq = parseRequest(req);
        const { text, textcolor, fontSize, background, query } = parsedReq;
        const { text2 } = (query || {});
        const t2 = String(text2)
        // const html = getHtml(parsedReq);
        const html = `
        <!DOCTYPE html>
            <html>
            <meta charset="utf-8">
            <title>Generated Image</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                ${getCss(textcolor, fontSize, background)}
            </style>
            <body>
                <div>
                    <div class="heading">${emojify(
                        sanitizeHtml(text)
                    )}
                    </div>
                    <div class="description">
                        ${emojify(
                            sanitizeHtml(t2)
                        )}
                    </div>
                </div>
            </body>
        </html>
        `
        if (isHtmlDebug) {
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
        }
        const { fileType } = parsedReq;
        const file = await getScreenshot(html, fileType, isDev);
        res.statusCode = 200;
        res.setHeader('Content-Type', `image/${fileType}`);
        res.setHeader('Cache-Control', `public, immutable, no-transform, s-maxage=2592000, max-age=2592000`);
        res.end(file);
    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>');
        console.error(e);
    }
}
