import React, { useContext, useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import { ExtractedFilesContext } from '../pages/DataReader';



const ZipReader = () => {
  const inputRef = useRef();
  const [extractedFiles, setExtractedFiles] = useContext(ExtractedFilesContext);
  const [extractedFilesList, setExtractedFilesList] = useState([]);

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
  useEffect(() => {
    console.log('extractedFiles: ', extractedFiles);
    const newExtractedFilesList = [];
    extractedFiles.forEach((value, key) => {
      newExtractedFilesList.push(<tr key={key}>
        <td>{key}</td>
        <td>{value.entryName}</td>
      </tr>);
    });
    setExtractedFilesList(newExtractedFilesList);
  }, [extractedFiles]);

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        accept=".zip"
        multiple
        onChange={handleFileChange}
      />
      {extractedFiles.size > 0 && (
        <div>
        <h2>Extracted files:</h2>
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Entry name</th>
            </tr>
          </thead>
          <tbody>
            {extractedFilesList}
          </tbody>
        </table>
        </div>
        )}
      
    </div>
  );
};

export default ZipReader;