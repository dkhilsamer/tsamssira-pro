const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function addWatermark(inputPath) {
    try {
        const logoPath = path.join(__dirname, '../../../frontend-react/public/logo.png');
        const outputPath = inputPath.replace(/(\.[\w\d]+)$/, '-wm$1');

        if (!fs.existsSync(logoPath)) {
            console.warn('Watermark logo not found at:', logoPath);
            return inputPath;
        }

        const image = sharp(inputPath);
        const metadata = await image.metadata();

        const watermark = await sharp(logoPath)
            .resize({
                width: Math.floor(metadata.width * 0.2), // 20% of image width
                height: Math.floor(metadata.height * 0.1),
                fit: 'inside'
            })
            .toBuffer();

        await image
            .composite([
                {
                    input: watermark,
                    gravity: 'southeast', // Bottom right
                    blend: 'over'
                }
            ])
            .toFile(outputPath);

        // Replace original with watermarked version
        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath, inputPath);

        return inputPath;
    } catch (err) {
        console.error('Error adding watermark:', err);
        return inputPath;
    }
}

module.exports = { addWatermark };
