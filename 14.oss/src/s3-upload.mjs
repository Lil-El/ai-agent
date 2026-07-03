import "dotenv/config";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  signatureVersion: "v4",
  region: "aaa", // 本地私有存储随便填，不影响
});

async function putStream() {
  try {
    let stream = fs.createReadStream("./image.png");
    let result = await client.send(
      new PutObjectCommand({
        Bucket: "agent-oss",
        Key: "assets/image.png",
        Body: stream,
        ContentType: "image/png",
      })
    );
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

putStream();