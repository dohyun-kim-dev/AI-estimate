import { deleteObject, getDownloadURL, getMetadata, getStorage, ref, ref as storageRef, uploadBytesResumable, } from 'firebase/storage';
import { devLog } from '@/utils/devLogger';
export function uploadImage(event, { onUpload, progress, deleteUrl }) {
    const files = event.target.files;
    if (!files || files.length == 0)
        return;
    uploadFile(files[0], {
        onUpload: (data) => {
            event.target.value = '';
            onUpload(data);
        },
        progress,
        deleteUrl,
    });
}
export async function uploadFile(file, { onUpload, progress, deleteUrl }) {
    const uploadRef = storageRef(getStorage(), `tmp/${file.name}`);
    const uploadTask = uploadBytesResumable(uploadRef, file);
    uploadTask.on('state_changed', (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (progress)
            progress(percent);
        switch (snapshot.state) {
            case 'paused':
                devLog('Upload is paused');
                break;
            case 'running':
                devLog('Upload is running');
                break;
        }
    }, (error) => {
        console.error('Upload failed:', error);
    }, () => {
        devLog('Upload complete');
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            devLog('File available at', downloadURL);
            if (deleteUrl) {
                devLog('Delete  url', deleteUrl);
                deleteObject(storageRef(getStorage(), deleteUrl))
                    .then(() => {
                    devLog('File deleted successfully');
                })
                    .catch((error) => {
                    devLog('Uh-oh, an error occurred!', error);
                });
            }
            onUpload({
                name: file.name,
                fileUri: downloadURL,
                mimeType: file.type,
            });
        });
    });
}
export function deleteImage(url, { onSuccess, onError, } = {}) {
    deleteObject(storageRef(getStorage(), url))
        .then(() => {
        devLog('File deleted successfully');
        if (onSuccess)
            onSuccess(url);
    })
        .catch((error) => {
        devLog('Uh-oh, an error occurred!', error);
        if (onError)
            onError(url);
    });
}
export async function getMimeType(fileUrl) {
    try {
        const fileRef = ref(getStorage(), fileUrl);
        const metadata = await getMetadata(fileRef);
        return metadata.contentType || null;
    }
    catch (error) {
        console.error('Error fetching metadata:', error);
        return null;
    }
}
export function uploadFiles(files, options) {
    if (!files)
        return;
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/x-hwp',
    ];
    files.forEach((file) => {
        devLog('Attempting to upload file:', file.name, 'Type:', file.type);
        if (file && allowedMimeTypes.includes(file.type)) {
            devLog('Allowed file type, proceeding with upload:', file.name);
            uploadFile(file, options);
        }
        else {
            console.warn('Disallowed file type or no file, skipping upload:', file.name, 'Type:', file.type);
        }
    });
}
