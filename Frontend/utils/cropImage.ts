// utils/cropImage.ts
export async function getCroppedImg(
    imageSrc: string,
    crop: { x: number; y: number },
    zoom: number,
    aspect: number,
    croppedAreaPixels: { width: number; height: number; x: number; y: number }
  ): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    if (!ctx) throw new Error('No 2d context found');
  
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
  
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
  
    ctx.drawImage(
      image,
      croppedAreaPixels.x * scaleX,
      croppedAreaPixels.y * scaleY,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas is empty'));
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      }, 'image/jpeg');
    });
  }
  
  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.setAttribute('crossOrigin', 'anonymous'); // handle CORS
      img.src = url;
    });
  }
  