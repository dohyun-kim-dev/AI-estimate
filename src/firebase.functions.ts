import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  getStorage,
  ref,
  ref as storageRef,
  uploadBytesResumable,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { FileData } from 'firebase/vertexai';
import { ChangeEvent } from 'react';
import { devLog } from '@/utils/devLogger';

export interface FileUploadData extends FileData {
  name: string;
}

export interface UploadImageOptions {
  onUpload: (data: FileUploadData) => void;
  progress?: (progress: number) => void;
  deleteUrl?: string;
}

export function uploadImage(
  event: ChangeEvent<HTMLInputElement>,
  { onUpload, progress, deleteUrl }: UploadImageOptions
) {
  const files = event.target.files;
  if (!files || files.length == 0) return;
  uploadFile(files[0], {
    onUpload: (data) => {
      event.target.value = ''; // Clear the input value to allow re-uploading the same file;
      onUpload(data);
    },
    progress,
    deleteUrl,
  });
}

export async function uploadFile(
  file: File,
  { onUpload, progress, deleteUrl }: UploadImageOptions
) {
  const uploadRef = storageRef(getStorage(), `tmp/${file.name}`);
  const uploadTask = uploadBytesResumable(uploadRef, file);
  uploadTask.on(
    'state_changed',
    (snapshot: UploadTaskSnapshot) => {
      const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      // devLog(`Upload is ${percent}% done`);
      if (progress) progress(percent);

      switch (snapshot.state) {
        case 'paused':
          devLog('Upload is paused');
          break;
        case 'running':
          devLog('Upload is running');
          break;
      }
    },
    (error) => {
      // Firebase Storage 에러 객체는 code와 message 속성을 가질 수 있습니다.
      // 에러 객체 전체를 로깅하여 어떤 정보가 들어있는지 확인합니다.
      // console.error('Upload failed:', error);
      // 특정 에러 코드에 따른 분기 처리도 가능합니다.
      // if (error.code === 'storage/unauthorized') {
      //   devLog("User doesn't have permission to access the object");
      // } else if (error.code === 'storage/canceled') {
      //   devLog('User canceled the upload');
      // } // ... etc.
    },
    () => {
      devLog('Upload complete');
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: string) => {
        devLog('File available at', downloadURL);

        if (deleteUrl) {
          devLog('Delete  url', deleteUrl);

          deleteObject(storageRef(getStorage(), deleteUrl))
            .then(() => {
              devLog('File deleted successfully');
            })
            .catch((error: unknown) => {
              devLog('Uh-oh, an error occurred!', error);
            });
        }
        onUpload({
          name: file.name,
          fileUri: downloadURL,
          mimeType: file.type,
        });
      });
    }
  );
}

export function deleteImage(
  url: string,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (url: string) => void;
    onError?: (url: string) => void;
  } = {}
) {
  deleteObject(storageRef(getStorage(), url))
    .then(() => {
      devLog('File deleted successfully');
      if (onSuccess) onSuccess(url);
    })
    .catch((error: unknown) => {
      devLog('Uh-oh, an error occurred!', error);
      if (onError) onError(url);
    });
}

export async function getMimeType(fileUrl: string): Promise<string | null> {
  try {
    // Create a reference to the file
    const fileRef = ref(getStorage(), fileUrl);

    // Get the metadata of the file
    const metadata = await getMetadata(fileRef);

    // Return the contentType (MIME type)
    return metadata.contentType || null;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
}

export function uploadFiles(files: File[], options: UploadImageOptions) {
  if (!files) return;

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain', // .txt
    'application/x-hwp', // .hwp
    // 필요에 따라 다른 MIME 타입 추가
  ];

  files.forEach((file) => {
    devLog('Attempting to upload file:', file.name, 'Type:', file.type);
    // file.type이 비어있는 경우도 고려 (예: 일부 시스템에서 확장자만 있고 MIME 타입이 없는 경우)
    // 이 경우 파일 확장자로 추가 검사를 할 수도 있지만, 우선은 MIME 타입 기준으로 처리합니다.
    if (file && allowedMimeTypes.includes(file.type)) {
      devLog('Allowed file type, proceeding with upload:', file.name);
      uploadFile(file, options);
    } else {
      // console.warn(
      //   'Disallowed file type or no file, skipping upload:',
      //   file.name,
      //   'Type:',
      //   file.type
      // );
      // 사용자에게 알림을 줄 수도 있습니다.
      // 예를 들어 options 객체에 onError 콜백을 추가하여 호출할 수 있습니다.
    }
  });
}

