// ZipImageProvider.js
import React, { useState } from 'react';
import JSZip from 'jszip';

const ZipImageContext = React.createContext();

const ZipImageProvider = ({ children }) => {
  const [imageDict, setImageDict] = useState({});

  const unzipImages = async (file ) => {
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      console.log('content:', content);

      const imageDict = {};

      await Promise.all(
        content.filter((relativePath, zipEntry) => zipEntry.name.match(/\.(jpg|jpeg|png|gif)$/))
          .map(async (relativePath, zipEntry) => {
            const blob = await zipEntry.async('blob');
            const url = URL.createObjectURL(blob);
            imageDict[zipEntry.name] = url;
          })
      );

      setImageDict(imageDict);
    } catch (error) {
      console.error('Error reading zip file:', error);
      setImageDict({});
    }
  };

  const getImageByName = (name) => {
    return imageDict[name] || null;
  };

  return (
    <ZipImageContext.Provider value={{ unzipImages, getImageByName }}>
      {children}
    </ZipImageContext.Provider>
  );
};

export { ZipImageProvider, ZipImageContext };
