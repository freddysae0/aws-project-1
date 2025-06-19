// Script to launch an EC2 instance, create AMI, and measure boot times
import {
  EC2Client,
  RunInstancesCommand,
  waitUntilInstanceStatusOk,
  CreateImageCommand,
  waitUntilImageAvailable,
} from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import fs from "fs";

const region = process.env.AWS_REGION || "us-east-1";
const client = new EC2Client({ region, credentials: fromIni() });

async function launchInstance(amiId: string, userData: string) {
  const start = Date.now();
  const run = await client.send(
    new RunInstancesCommand({
      ImageId: amiId,
      InstanceType: "t2.micro",
      MinCount: 1,
      MaxCount: 1,
      UserData: Buffer.from(userData).toString("base64"),
    })
  );
  const instanceId = run.Instances?.[0].InstanceId as string;
  await waitUntilInstanceStatusOk({ client, maxWaitTime: 300 }, { InstanceIds: [instanceId] });
  const end = Date.now();
  const boot = (end - start) / 1000;
  console.log(`Instance ${instanceId} booted in ${boot} seconds`);
  return instanceId;
}

async function createAmi(instanceId: string, name: string) {
  const resp = await client.send(
    new CreateImageCommand({ InstanceId: instanceId, Name: name })
  );
  const imageId = resp.ImageId as string;
  await waitUntilImageAvailable({ client, maxWaitTime: 300 }, { ImageIds: [imageId] });
  console.log(`AMI ${imageId} created`);
  return imageId;
}

(async () => {
  const userData = fs.readFileSync("scripts/user-data.sh", "utf8");
  const baseAmi = "ami-051f7e7f6c2f40dc1"; // Amazon Linux 2 AMI
  const instanceId = await launchInstance(baseAmi, userData);
  const amiId = await createAmi(instanceId, "app-snapshot");
  await launchInstance(amiId, "");
})();
