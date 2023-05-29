// ZipImageProvider.js
import JSZip from "jszip";
import React, { useEffect, useState } from "react";

const ZipImageContext = React.createContext();

const ZipImageProvider = ({ children }) => {
    const [imageDict, setImageDict] = useState({});

    const unzipImages = async (file = null, filePath = null) => {
        try {
            const zip = new JSZip();
            let content;

            if (filePath) {
                const response = await fetch(filePath);
                const buffer = await response.arrayBuffer();
                content = await zip.loadAsync(buffer);
            } else {
                content = await zip.loadAsync(file);
            }

            console.log("content:", content);
            const imageDict = {};

            await Promise.all(
                content
                    .filter((relativePath, zipEntry) => zipEntry.name)
                    .map(async (relativePath, zipEntry) => {
                        const blob = await zipEntry.async("blob");
                        const url = URL.createObjectURL(blob);
                        imageDict[zipEntry.name] = url;
                    })
            );

            setImageDict(imageDict);
        } catch (error) {
            console.error("Error reading zip file:", error);
            setImageDict({});
        }
    };

    const getImageByName = (name) => {
        return imageDict[name] || null;
    };
    useEffect(() => {
        const imageUrl = unzipImages({
            filePath: "../assets/zip/images.zip",
        }).then((imageUrl) => {
            console.log("imageUrl:", imageUrl);
        });
    }, []);

    return (
        <ZipImageContext.Provider value={{ unzipImages, getImageByName }}>
            {children}
        </ZipImageContext.Provider>
    );
};

export { ZipImageProvider, ZipImageContext };
