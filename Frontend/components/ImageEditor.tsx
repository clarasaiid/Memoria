import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './utils/cropImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ImageEditor() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImg);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Input type="file" accept="image/*" onChange={onFileChange} />

      {imageSrc && (
        <div className="relative w-[320px] h-[320px] bg-gray-200">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      {imageSrc && (
        <Button onClick={showCroppedImage} className="mt-4">
          Save Crop
        </Button>
      )}

      {croppedImage && (
        <div className="mt-4">
          <p className="text-sm mb-2">Preview:</p>
          <img src={croppedImage} alt="Cropped" className="rounded-lg shadow" />
        </div>
      )}
    </div>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.readAsDataURL(file);
  });
}
