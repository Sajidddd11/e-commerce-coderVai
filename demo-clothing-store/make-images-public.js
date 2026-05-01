#!/usr/bin/env node

/**
 * Make existing blog images in S3 public
 * Run: node make-images-public.js
 */

const { S3Client, PutObjectAclCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require("dotenv").config();

async function makeImagesPublic() {
    const s3Client = new S3Client({
        region: process.env.S3_REGION,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        endpoint: process.env.S3_ENDPOINT,
    });

    try {
        // List all objects in blog/ folder
        const listCommand = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET,
            Prefix: "blog/",
        });

        const response = await s3Client.send(listCommand);
        const objects = response.Contents || [];

        console.log(`Found ${objects.length} images in blog/ folder`);

        // Make each object public
        for (const obj of objects) {
            console.log(`Making public: ${obj.Key}`);

            await s3Client.send(
                new PutObjectAclCommand({
                    Bucket: process.env.S3_BUCKET,
                    Key: obj.Key,
                    ACL: "public-read",
                })
            );
        }

        console.log("✅ All blog images are now public!");
    } catch (error) {
        console.error("Error:", error);
    }
}

makeImagesPublic();
