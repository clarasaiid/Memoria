import { Platform } from 'react-native';
import { apiService } from './api';

function dataURLtoFile(dataurl: string, filename: string) {
  var arr = dataurl.split(',');
  var match = arr[0].match(/:(.*?);/);
  var mime = match ? match[1] : 'image/jpeg'; // fallback to jpeg if not found
  var bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

export async function uploadImage(uri: string): Promise<string> {
  try {
    // Get token from sessionStorage for web
    let token = null;
    if (Platform.OS === 'web') {
      token = sessionStorage.getItem('token');
    }

    // Create form data
    const formData = new FormData();
    let filename = uri.split('/').pop() || 'story.jpg';
    if (!/\.(jpg|jpeg|png|gif)$/i.test(filename)) {
      filename += '.jpg'; // Default to .jpg if no extension
    }
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    let file: any;
    if (Platform.OS === 'web') {
      if (uri.startsWith('data:')) {
        file = dataURLtoFile(uri, filename);
      } else {
        const res = await fetch(uri);
        const blob = await res.blob();
        file = new File([blob], filename, { type: blob.type });
      }
    } else {
      file = {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type,
      };
    }
    formData.append('file', file);

    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // DO NOT set 'Content-Type' here!

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:7000'}/api/upload`, {
      method: 'POST',
      body: formData,
      headers,
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    const data = await response.json();
    // Return just the path, not the full URL
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}