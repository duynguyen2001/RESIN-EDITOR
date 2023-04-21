import { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlusSquare,
    faDownload,
    faList,
    faCog,
    faBars,
} from "@fortawesome/free-solid-svg-icons";
import "./Menu.css";
import { Modal } from "../pages/Panel";
import { DataContext } from "../pages/DataReader";
import JSZip from "jszip";

function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [option, setOption] = useState(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    return (
        <>
            <FontAwesomeIcon
                icon={faBars}
                className="menu-icon"
                onClick={toggleMenu}
                title="Menu"
            />
            {isMenuOpen && (
                <div className="menu-container">
                    <div onClick={() => setOption("Add JSON")}>
                        <FontAwesomeIcon
                            icon={faPlusSquare}
                            className="menu-item"
                            title="Add JSON"
                        />
                    </div>

                    <div onClick={() => setOption("Download JSON")}>
                        <FontAwesomeIcon
                            icon={faDownload}
                            className="menu-item"
                            title="Download JSON"
                        />
                    </div>
                    <div onClick={() => setOption("See Legend")}>
                        <FontAwesomeIcon
                            icon={faList}
                            className="menu-item"
                            title="See Legend"
                        />
                    </div>
                    <div onClick={() => setOption("Option Change")}>
                        <FontAwesomeIcon
                            icon={faCog}
                            className="menu-item"
                            title="Option Change"
                        />
                    </div>
                </div>
            )}
            {option && (
                <MenuOptionPanel option={option} setOption={setOption} />
            )}
        </>
    );
}
const MenuOptionPanel = ({ option, setOption }) => {
    const closePanel = () => {
        setOption(null);
    };
    const [isEnlarged, setIsEnlarged] = useState(false);
    const toggleEnlarged = () => {
        setIsEnlarged(!isEnlarged);
    };

    return (
        <div className="menu-option-panel">
            <Modal handleClick={closePanel} toggleEnlarged={toggleEnlarged} />
            {option === "Add JSON" && <AddJSONPanel />}
        </div>
    );
};

function AddJSONPanel() {
    const [jsonData, setJsonData] = useContext(DataContext);
    const [images, setImages] = useState([]);

  const handleJSONUpload = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      const parsedJson = JSON.parse(e.target.result);
      setJsonData(parsedJson);
    };
  };
  const handleZipUpload = (event) => {
    const file = event.target.files[0];
    const zip = new JSZip();
    zip.loadAsync(file).then((zipContents) => {
      const imageFiles = Object.values(zipContents.files).filter(
        (file) => file.name.match(/\.(jpg|jpeg|png|gif)$/i)
      );
      const imagePromises = imageFiles.map((imageFile) =>
        imageFile.async('blob').then((blob) => URL.createObjectURL(blob))
      );
      Promise.all(imagePromises).then((imageUrls) => {
        const imageObjects = imageUrls.map((imageUrl) => ({ original: imageUrl, thumbnail: imageUrl }));
        setImages(imageObjects);
      });
    });
  };

    return <div>
        <h2>Upload New JSON File</h2>
        <h3>JSON File</h3>
        <input type="file" accept=".json" onChange={handleJSONUpload} />
        <h3>Zip File</h3>
        <input type="file" accept=".zip" onChange={handleZipUpload}/>
    </div>;
}
export default Menu;
