// ==================== Imports & Required Modules ====================
import os from "node:os";
import {v4 as uuid} from "uuid";
import multer, { FileFilterCallback } from "multer";
import { BadRequestException } from "../response/error.response";
import { Request } from "express";

// ==================== Storage Approach Enum Definition ====================
export enum StorageEnum {
    MEMORY= "MEMORY",
    DISK= "DISK",
}

// ==================== Allowed File Types Configuration ====================
export const fileValidation = {
    images: ["image/jpeg", "image/png", "image/gif", "image/jpg"],
    pdf: ["application/pdf"],
    documents: ["application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

// ==================== Cloud File Upload Multer Factory ====================
export const cloudFileUpload = ({ 
    validation = [],
    storageApproach = StorageEnum.MEMORY,
    maxSizeMB = 6,
}: {
    validation?: string[];
    storageApproach?: StorageEnum; 
    maxSizeMB?: number;
}) => {
     
    // ==================== Storage Engine Configuration (Memory or Disk) ====================
    const storage = 
    storageApproach === StorageEnum.MEMORY 
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: os.tmpdir(),
        filename: (req:Request, file:Express.Multer.File, cb) => {
            cb(null,`${uuid()}-${file.originalname}`);
        },
    });

    // ==================== File Type Validation Filter ====================
    function fileFilter (
        req:Request,
         file:Express.Multer.File,
         cb:FileFilterCallback
        ) {
        if(!validation.includes(file.mimetype)) {
            return cb(new BadRequestException("Invalid file type"));
        }
        return cb(null, true);
    }

    // ==================== Temporary Directory Logging (Debug) ====================
    console.log(os.tmpdir());

    // ==================== Multer Instance Creation & Return ====================
    return multer({
        fileFilter,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
        storage,
        
    });
};