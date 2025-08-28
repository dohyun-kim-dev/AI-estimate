import { FileData } from 'firebase/vertexai';
import { ChangeEvent } from 'react';
export interface FileUploadData extends FileData {
    name: string;
}
export interface UploadImageOptions {
    onUpload: (data: FileUploadData) => void;
    progress?: (progress: number) => void;
    deleteUrl?: string;
}
export declare function uploadImage(event: ChangeEvent<HTMLInputElement>, { onUpload, progress, deleteUrl }: UploadImageOptions): void;
export declare function uploadFile(file: File, { onUpload, progress, deleteUrl }: UploadImageOptions): Promise<void>;
export declare function deleteImage(url: string, { onSuccess, onError, }?: {
    onSuccess?: (url: string) => void;
    onError?: (url: string) => void;
}): void;
export declare function getMimeType(fileUrl: string): Promise<string | null>;
export declare function uploadFiles(files: File[], options: UploadImageOptions): void;
