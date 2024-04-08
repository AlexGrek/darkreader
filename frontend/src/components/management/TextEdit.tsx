import React, { useState } from 'react';
import "../Creator.css"
import { IoPushSharp } from "react-icons/io5";
import { getFileContentOr401, sendPostWithPayload } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

interface TextEditProps {
    catalog: string
    file: string
}

const TextEdit: React.FC<TextEditProps> = ({ catalog, file }) => {
    const catalogName = catalog;
    const [fileName, setFileName] = useState<string>(file);
    const [text, setText] = useState<string>('');
    const [etext, setEText] = useState<string>('');

    const navigate = useNavigate();

    const updateText = () => {
        const fetchFileContent = async () => {
            try {
                const content = await getFileContentOr401(catalog, fileName);
                if (content === "401") {
                    setText("Error: cannot read file from the server")
                }
                setText(content);
            } catch (error) {
                console.error(`Error fetching file content for ${fileName}:`, error);
            }
        };

        fetchFileContent();
    }

    React.useEffect(() => {
        if (text == "") {
            updateText()
        }
    }, [fileName]);

    const isSubmitDisabled = () => {
        return text.length < 3 || fileName.length < 2 || catalogName.length < 2;
    }

    const submit = async () => {
        const result = await sendPostWithPayload("edit", {
            "catalog": catalogName, "file": file, "text": text, "rename": fileName
        })
        if (result) {
            navigate("/")
            setEText("")
        } else {
            setEText("Error, story not published")
        }
    }

    return (
        <div className='creator-body'>
            <label className='creator-meta-input-field'>
                File Name
                <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                />
            </label>
            <div className='creator-text-edit-panel'>
                <p>Text <span className='creator-char-count'>(Characters: {text.length})</span></p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>
            <p>{etext}</p>
            <button className='creator-submit' disabled={isSubmitDisabled()} onClick={submit}><IoPushSharp />  Publish chapter</button>
        </div>
    );
};

export default TextEdit;
