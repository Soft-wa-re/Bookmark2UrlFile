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

    // Parse the HTML using Cheerio
    const $ = cheerio.load(html);

    // Find all top-level <h3> tags
    $('h3').each(async (index, h3Element) => {
        const h3Text = $(h3Element).text().trim();
        const h3DirPath = path.join(__dirname, 'output', h3Text);
        fs.mkdirSync(h3DirPath, { recursive: true }); // Create directory for the top-level <h3> tag

        // Find all nested <dt> tags within the <dl> tag following the current <h3> tag
        $(h3Element).next('dl').find('dt').each(async (index, dtElement) => {
            const dtText = $(dtElement).text().trim();
            const dtHref = $(dtElement).find('a').attr('href');

            if (dtHref) {
                // Get the contents of the URL
                try {
                    const content = '[InternetShortcut]\nURL=' + dtHref;

                    // Write the contents to a new file
                    const fileName = `${dtText}.url`;
                    const filePath = path.join(h3DirPath, fileName);
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
        });
    });
});