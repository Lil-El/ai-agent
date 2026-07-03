import "dotenv/config";
import fs from "fs";
import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

async function putStream() {
  try {
    let stream = fs.createReadStream("./image.png");

    let result = await minioClient.putObject("agent-oss", "assets/image.png", stream);
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

putStream();
