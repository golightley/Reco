
  const generateThumbImage = (img, MAX_WIDTH, MAX_HEIGHT, quality, callback) => {
    const canvas: any = document.createElement('canvas');
    const image = new Image();
    image.onload = () => {
      let width = image.width;
      let height = image.height;
 
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);
      // IMPORTANT: 'jpeg' NOT 'jpg'
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(dataUrl);
    };
    image.src = img;
  };

  const getImageSize = (dataUrl) => {
    const head = 'data:image/jpeg;base64,';
    return parseFloat(((dataUrl.length - head.length) * 3 / 4 / (1024)).toFixed(4));
  };

  export {
    generateThumbImage,
    getImageSize
  };

