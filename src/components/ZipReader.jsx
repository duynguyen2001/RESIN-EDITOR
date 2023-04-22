import React, { useRef, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ZipReader = () => {
  const inputRef = useRef();
  const [extractedFilePaths, setExtractedFilePaths] = useState([]);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let allExtractedFiles = [];

    for (const file of files) {
      const zip = await JSZip.loadAsync(file);
      const filePromises = [];

      zip.forEach((relativePath, zipEntry) => {
        const filePromise = zipEntry.async('blob').then((content) => ({
          filename: zipEntry.name,
          content,
        }));
        filePromises.push(filePromise);
      });

      const extractedFiles = await Promise.all(filePromises);
      allExtractedFiles = [...allExtractedFiles, ...extractedFiles];

      extractedFiles.forEach(({ filename, content }) => {
        saveAs(content, filename);
      });
    }

    setExtractedFilePaths(allExtractedFiles.map(({ filename }) => filename));
  };

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        accept=".zip"
        multiple
        onChange={handleFileChange}
      />
      <h2>Extracted files:</h2>
      <ul>
        {extractedFilePaths.map((path, index) => (
          <li key={index}>{path}</li>
        ))}
      </ul>
    </div>
  );
};

export default ZipReader;
