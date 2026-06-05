const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const dotenv = require("dotenv");

dotenv.config();

const client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.S3_ENDPOINT,
    // AWS SDK v3 sometimes needs forcePathStyle for custom endpoints depending on the provider,
    // but we'll try without it first since it might be standard AWS S3.
});

const BUCKET = process.env.S3_BUCKET;

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

async function processImages() {
    console.log(`Starting aggressive compression process for bucket: ${BUCKET} (Target: 300KB)...`);
    
    let isTruncated = true;
    let continuationToken = undefined;
    let totalProcessed = 0;
    let totalCompressed = 0;

    while (isTruncated) {
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET,
            ContinuationToken: continuationToken,
        });

        const listResponse = await client.send(listCommand);
        
        for (const item of listResponse.Contents || []) {
            const key = item.Key;
            const size = item.Size;

            // Process jpg, jpeg, png, and webp
            if (!key.match(/\.(jpg|jpeg|png|webp)$/i)) {
                continue;
            }

            totalProcessed++;

            // If greater than 300 KB (300 * 1024 bytes)
            if (size > 300 * 1024) {
                console.log(`[${(size / 1024).toFixed(2)} KB] Processing: ${key}...`);
                
                try {
                    // Download
                    const getCommand = new GetObjectCommand({ Bucket: BUCKET, Key: key });
                    const getResponse = await client.send(getCommand);
                    const imageBuffer = await streamToBuffer(getResponse.Body);

                    let sharpInstance = sharp(imageBuffer);
                    const metadata = await sharpInstance.metadata();

                    // Resize to a maximum width of 1600px (still high res but saves massive space)
                    if (metadata.width && metadata.width > 1600) {
                        sharpInstance = sharpInstance.resize({ width: 1600, withoutEnlargement: true });
                    }

                    // Aggressive compression logic
                    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                        sharpInstance = sharpInstance.jpeg({ quality: 75, progressive: true, mozjpeg: true });
                    } else if (metadata.format === 'png') {
                        // Secret trick: Convert large PNG content to WebP but keep .png extension
                        // This is MUCH smaller than standard PNG compression
                        sharpInstance = sharpInstance.webp({ quality: 75 });
                    } else if (metadata.format === 'webp') {
                        sharpInstance = sharpInstance.webp({ quality: 75 });
                    }

                    const compressedBuffer = await sharpInstance.toBuffer();
                    
                    // Only upload if we actually saved space
                    if (compressedBuffer.length < size) {
                        const reduction = (((size - compressedBuffer.length) / size) * 100).toFixed(1);
                        console.log(`   -> Compressed to ${(compressedBuffer.length / 1024).toFixed(2)} KB (-${reduction}%). Uploading...`);
                        
                        const putCommand = new PutObjectCommand({
                            Bucket: BUCKET,
                            Key: key,
                            Body: compressedBuffer,
                            // If we converted PNG to WebP, we tell the browser it's a webp even though key ends in .png
                            ContentType: metadata.format === 'png' ? 'image/webp' : (getResponse.ContentType || `image/${metadata.format}`),
                        });
                        
                        await client.send(putCommand);
                        totalCompressed++;
                    } else {
                        console.log(`   -> Already optimal. Skipping.`);
                    }

                } catch (err) {
                    console.error(`   ❌ Error processing ${key}:`, err.message);
                }
            }
        }

        isTruncated = listResponse.IsTruncated;
        continuationToken = listResponse.NextContinuationToken;
    }

    console.log(`\n✅ Aggressive Pass Done! Processed ${totalProcessed} images. Compressed ${totalCompressed} additional images.`);
}

processImages().catch(console.error);
