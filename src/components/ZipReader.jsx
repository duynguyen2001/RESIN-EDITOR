import React, { useContext, useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import { ExtractedFilesContext } from '../pages/DataReader';



const ZipReader = () => {
  const inputRef = useRef();
  const [extractedFiles, setExtractedFiles] = useContext(ExtractedFilesContext);

  useEffect(() => {
    console.log('extractedFiles: ', extractedFiles);
  }, [extractedFiles]);
  function extractFilenameFromPath(path) {
    const parts = path.split('/');
    return parts[parts.length - 1].split('.');
  }

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let allExtractedFiles = new Map();

    for (const file of files) {
      const zip = await JSZip.loadAsync(file);
      const filePromises = [];

      zip.forEach((entryName, zipEntry) => {
        const filePromise = zipEntry.async('blob').then((content) => {
          return ({
          filename: zipEntry.name, 
          content,
          entryName,
        })});
        filePromises.push(filePromise);
      });

      const extractedFiles = await Promise.all(filePromises);

      extractedFiles.forEach(({ filename, content, entryName }) => {
        const [extractedFilename, extractedFileType] = extractFilenameFromPath(entryName);
        if (filename && filename !== '' && !allExtractedFiles.get(extractedFilename) )
        {
          allExtractedFiles.set(extractedFilename, { entryName, content: URL.createObjectURL(content, extractedFileType) });
        }

      });
    }

    setExtractedFiles(allExtractedFiles);
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
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Entry Name</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(extractedFiles).map(([filename, { entryName }]) => (
            <tr key={filename}>
              <td>{filename}</td>
              <td>{entryName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ZipReader;