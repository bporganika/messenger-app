declare module 'react-native-image-picker' {
  export interface ImagePickerResponse {
    didCancel?: boolean;
    errorCode?: string;
    errorMessage?: string;
    assets?: Asset[];
  }

  export interface Asset {
    uri?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    type?: string;
    fileName?: string;
  }

  export interface CameraOptions {
    mediaType: 'photo' | 'video' | 'mixed';
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    cameraType?: 'front' | 'back';
    saveToPhotos?: boolean;
  }

  export interface ImageLibraryOptions {
    mediaType: 'photo' | 'video' | 'mixed';
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    selectionLimit?: number;
  }

  export function launchCamera(
    options: CameraOptions,
  ): Promise<ImagePickerResponse>;

  export function launchImageLibrary(
    options: ImageLibraryOptions,
  ): Promise<ImagePickerResponse>;
}
