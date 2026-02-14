const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * Download a CSV file from URL
 * @param {string} url - URL to download from
 * @param {string} outputPath - Where to save the file
 * @returns {Promise<Object>} Download result
 */
async function download(url, outputPath) {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(outputPath);

        console.log(`Downloading: ${url}`);
        console.log(`Saving to: ${outputPath}`);

        const request = protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }

            const totalSize = parseInt(response.headers['content-length'], 10);
            const lastModified = response.headers['last-modified'];
            let downloadedSize = 0;

            console.log(`File size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Last modified: ${lastModified}`);

            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
                process.stdout.write(`\rProgress: ${percent}%`);
            });

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log('\n✅ Download complete');

                resolve({
                    path: outputPath,
                    size: totalSize,
                    lastModified,
                    url
                });
            });
        });

        request.on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });

        request.setTimeout(parseInt(process.env.TIMEOUT_SECONDS || 120) * 1000, () => {
            request.destroy();
            fs.unlink(outputPath, () => {});
            reject(new Error('Download timeout'));
        });
    });
}

/**
 * Download data source by ID
 * @param {string} sourceId - Data source ID from config
 * @param {Object} source - Data source configuration
 * @returns {Promise<Object>} Download result
 */
async function downloadSource(sourceId, source) {
    const downloadDir = process.env.DATA_DOWNLOAD_DIR || './data/downloads';
    const filename = `${sourceId}_${Date.now()}.csv`;
    const outputPath = path.join(downloadDir, filename);

    return download(source.url, outputPath);
}

module.exports = {
    download,
    downloadSource
};
