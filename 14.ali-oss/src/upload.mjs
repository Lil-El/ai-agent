import "dotenv/config";
import OSS from "ali-oss";
import fs from "fs";

const client = new OSS({
  // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  authorizationV4: true,
  bucket: process.env.OSS_BUCKET,
});

async function putStream() {
  try {
    let stream = fs.createReadStream("./image.png");

    // 完整路径，不包含Bucket名称
    let result = await client.putStream("assets/image.png", stream);
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

putStream();

async function getStream() {
  try {
    let result = await client.getStream("avatar.jfif");
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

// getStream();