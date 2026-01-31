// ==================== AWS S3 Imports & Dependencies ====================
import { ObjectCannedACL, S3Client, PutObjectCommand ,GetObjectCommand, DeleteObjectCommand,
     DeleteObjectCommandOutput,
    DeleteObjectsCommand} from "@aws-sdk/client-s3";
import { StorageEnum } from "./cloud.multer";
import { v4 as uuid } from "uuid";    
import { BadRequestException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ==================== S3 Client Configuration Factory ====================
export const s3config = () => {
    return new S3Client({
        region: process.env.AWS_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
    });
};

// ==================== Single File Upload to S3 ====================
export const uploadFile = async ({
storageApproach= StorageEnum.MEMORY,
Bucket= process.env.BUCKET_NAME as string,
ACL = "private",
path = "general",
file,
}:{
storageApproach?: StorageEnum;
Bucket?: string;
ACL?: ObjectCannedACL;
path?: string;
file: Express.Multer.File;

}) => {

const command  = new PutObjectCommand({
    Bucket,
    ACL,
    Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
        file.originalname

    }`,
    Body: storageApproach === StorageEnum.MEMORY 
    ? file.buffer 
    : file.path,
    ContentType: file.mimetype,
});

await s3config().send(command);

console.log(command.input.Key);

if(!command.input?.Key) 
throw new BadRequestException("File upload failed");

return command.input.Key;

};

// ==================== Large File Multipart Upload to S3 ====================
export const uploadLargeFile = async ({
storageApproach= StorageEnum.MEMORY,
Bucket= process.env.BUCKET_NAME as string,
ACL = "private",
path = "general",
file,
}:{storageApproach?: StorageEnum;
Bucket?: string;
ACL?: ObjectCannedACL;
path?: string;
file: Express.Multer.File;})=> {
const parallelUpload = new Upload({
    client: s3config(),
    params: {
        Bucket,
        ACL,
        Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
            file.originalname   
}`,
        Body: storageApproach === StorageEnum.MEMORY 
        ? file.buffer 
        :file.path,
        ContentType: file.mimetype,
    },
     partSize: 500 * 1024 * 1024, 
});
parallelUpload.on("httpUploadProgress", (progress: any) => {
    console.log("Upload progress:", progress); //EVENT
});
const { Key } = await parallelUpload.done();
if(!Key) 
throw new BadRequestException("File upload failed");
return Key;
};

// ==================== Multiple Files Upload (using single upload in parallel) ====================
export const uploadFiles = async ({
    storageApproach = StorageEnum.MEMORY,
    Bucket = process.env.BUCKET_NAME as string,
    ACL = "private",
    path = "general",
    files,
}: {
    storageApproach?: StorageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
}) => {
    const urls = await Promise.all(
        files.map((file) => {
            return uploadFile({
                storageApproach,
                Bucket,
                ACL,
                path,
                file,
            });
        })
    );

    return urls; 
};
// for (const file of files) {
//         const Key = await uploadFile({
// storageApproach,
// Bucket,
// ACL,
// path,
// file
//         });
//         urls.push(Key);
//     }
//     return urls;
// };

// ==================== Generate Pre-signed URL for Direct Upload ====================
export const createPresignedURL = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string, 
    path = "general",
    ContentType,
    originalname,
    expiresIn = 120
}:{
    Bucket?: string,
    path?: string,
    ContentType: string,
    originalname: string,
    expiresIn?: number
}) => {
    const command = new PutObjectCommand({
        Bucket,
        Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-presigned-${originalname}`,
        ContentType,
      
    });
    const url = await getSignedUrl(s3config(), command, { expiresIn });
    if (!url || !command?.input.Key) {
        throw new BadRequestException("Could not generate presigned URL");
    }
    return {url, Key: command.input.Key};
}

// ==================== Get File Metadata & Stream from S3 ====================
export const getFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string, 
   Key,
}:{
    Bucket?: string;
    Key: string;
})  => {
 const command = new GetObjectCommand({
    Bucket,
    Key,
 });
 return await s3config().send(command)
 };

// ==================== Generate Pre-signed Download URL ====================
export const createGetPresignedURL = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string, 
    Key,
    expiresIn = 120,
    downloadName = "dummy",
}:{
    Bucket?: string,
    Key: string,
    downloadName?: string,
    expiresIn?: number
}) => {
    const command = new GetObjectCommand({
        Bucket,
        Key, 
        ResponseContentDisposition: `attachment; filename="${downloadName}"`,
    });
    const url = await getSignedUrl(s3config(), command, { expiresIn });
    if (!url) {
        throw new BadRequestException("Fail To generate URL");
    }
    return {url};
};

// ==================== Delete Single File from S3 ====================
export const deleteFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string, 
   Key,
}:{
    Bucket?: string;
    Key: string;
}): Promise<DeleteObjectCommandOutput> => {
    const command = new DeleteObjectCommand({
        Bucket,
        Key,
    });
    return await s3config().send(command);
};

// ==================== Delete Multiple Files from S3 ====================
export const deleteFiles = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string, 
   urls,
   Quite = false,
}:{
    Bucket?: string;
    urls: string[];
    Quite?: boolean;
}): Promise<DeleteObjectCommandOutput> => {
  const objects = urls.map((url) =>  { 
    return {Key: url}});
    const command = new DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects: objects,
            Quiet: Quite,
        }
    });
    return await s3config().send(command);
};