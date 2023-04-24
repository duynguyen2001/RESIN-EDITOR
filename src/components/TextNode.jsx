// import React from "react";
// import './TextNode.css';

// // const TextNode = ({ data, fileContent }) => {
// //     console.log("fileContent: ", fileContent);
// //     const textContent = fileContent.slice(data.offset, data.offset +  data.length);
// //     console.log("data: ", data);
// //     console.log("textContent: ", textContent);
// //     return (
// //         <div className="text-node">
// //             <mark>{textContent}</mark>
// //         </div>
// //     );
// // }

// // export default TextNode;
import React from 'react';
import './TextNode.css';

const TextNode = ({ data, fileContent }) => {
    const textContent = fileContent.slice(data.offset, data.offset + data.length);

    const extractSentence = (text, offset, length) => {
        let start = offset;
        while (start > 0 && !text[start - 1].match(/[.!?]/)) {
            start -= 1;
        }
        while (start < text.length && text[start].match(/\s/)) {
            start += 1;
        }

        let end = length;
        while (end < text.length && !text[end].match(/[.!?]/)) {
            end += 1;
        }

        return [start, offset, offset + length, end];
    };

    const [start, beginHighlight, endHighlight, end] = extractSentence(fileContent, data.offset, data.length);
    const sentence = fileContent.slice(start, end);
    const markedSentence = (
        <p>{sentence.slice(0, beginHighlight - start)}
        <mark>{sentence.slice(beginHighlight - start, endHighlight - start)}</mark>
        {sentence.slice(endHighlight - start)}</p>
    );

    return (
        <div className="text-node">
            {markedSentence}
        </div>
    );
}

export default TextNode;
