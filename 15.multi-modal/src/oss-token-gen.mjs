// https://www.alibabacloud.com/help/zh/oss/user-guide/uploading-objects-to-oss-directly-from-clients/
// 客户端直传是指客户端直接上传文件到对象存储OSS。相对于服务端代理上传，客户端直传避免了业务服务器中转文件，提高了上传速度，节省了服务器资源

import "dotenv/config";
import OSS from "ali-oss";

async function main() {
  const config = {
    region: process.env.OSS_REGION,
    bucket: process.env.OSS_BUCKET,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  };

  const client = new OSS(config);

  const date = new Date();

  date.setDate(date.getDate() + 1);

  const res = client.calculatePostSignature({
    expiration: date.toISOString(),
    conditions: [
      ["content-length-range", 0, 1048576000], //设置上传文件的大小限制。
    ],
  });

  /**
    {
      OSSAccessKeyId: 'LTAI5t6hkcz9AR6CR8pCnZyR',
      Signature: '9xYUjWgUruyvOH6KGQMZpjV14bo=',
      policy: 'eyJleHBpcmF0aW9uIjoiMjAyNi0wNy0xN1QwNjoxOTozMS4xODZaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsMTA0ODU3NjAwMF1dfQ=='
    }
   */

  console.log(res);

  const location = await client.getBucketLocation();

  const host = `http://${config.bucket}.${location.location}.aliyuncs.com`;

  console.log(host);
}

// index.html 访问时，需要在 OSS 桶中开启 CORS；
// https://oss.console.aliyun.com/bucket/oss-cn-beijing/yann-agent-bucket/data-security/cors
main();
