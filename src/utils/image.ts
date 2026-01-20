export const compressImage = (blob: Blob | File, quality = 0.6, maxWidth = 1920): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Resize if too big
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }
            
            // Fill white background for transparency (if converting png to jpeg)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Force JPEG for better compression
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });
};

export const fetchAndCacheIcon = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        
        // For icons, we usually want to keep transparency (PNG) and small size
        // So we don't necessarily use compressImage which forces JPEG/white bg
        // Instead, we just convert to base64 directly
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Failed to cache icon:', error);
        // If fetch fails (e.g. CORS), just return the original URL
        return url;
    }
};
