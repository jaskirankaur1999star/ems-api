import mongoose from "mongoose";

const uploadImage = async (file) => {
    if (!file) {
        return null;
    }

    const db = mongoose.connection.db;

    const bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: "employeeImages",
    });

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(
            file.originalname,
            {
                contentType: file.mimetype,
            }
        );

        uploadStream.on("error", (error) => {
            reject(error);
        });

        uploadStream.on("finish", () => {
            resolve(uploadStream.id);
        });

        uploadStream.end(file.buffer);
    });
};

export default uploadImage;