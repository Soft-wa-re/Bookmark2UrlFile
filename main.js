const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlFilePath = process.argv[2];

// Read the HTML file
fs.readFile(htmlFilePath, 'utf8', async (err, html) => {
    if (err) {
        console.error('Error reading HTML file:', err);
        return;
    }

    const $ = cheerio.load(html);
    let h3Element = $('h3').first()
    const h3Text = $(h3Element).text().trim();
    console.log(h3Text)
    const h3DirPath = path.join(__dirname, 'output', h3Text);
    recursiveCall($, $(h3Element).next('dl'), h3DirPath);
});

function recursiveCall($, dl, currentPath) {
    fs.mkdirSync(currentPath, { recursive: true }); // Create directory for the current path

    dl.find('dt').each(async (index, dtElement) => {
        const dtText = $(dtElement).text().trim();
        const dtHref = $(dtElement).find('a').attr('href');

        if (dtHref) {
            writeNewFile(dtHref, dtText, currentPath);
        }

        const nestedDL = $(dtElement).next('dl');
        if (nestedDL.length) {
            recursiveCall($, nestedDL, path.join(currentPath, dtText));
        }
    });
}

function writeNewFile(dtHref, dtText, currentPath) {
    try {
        const content = '[InternetShortcut]\nURL=' + dtHref;

        // Write the contents to a new file
        const fileName = `${dtText}.url`;
        const filePath = path.join(currentPath, fileName);
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                console.error(`Error writing file ${fileName}:`, err);
            } else {
                console.log(`File ${fileName} has been created with URL content.`);
            }
        });
    } catch (error) {
        console.error(`Error fetching URL ${dtHref}:`, error);
    }
}
