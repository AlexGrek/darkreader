import React, { useState } from 'react';
import "./Creator.css"
import { IoPushSharp } from "react-icons/io5";
import { sendPostWithPayload } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface AppenderProps {
    catalog: string
 }

const Appender: React.FC<AppenderProps> = ({catalog}) => {
    const catalogName = catalog;
    const [fileName, setFileName] = useState<string>('');
    const [text, setText] = useState<string>('');
    const [etext, setEText] = useState<string>('');

    const navigate = useNavigate();

    const isSubmitDisabled = () => {
        return text.length < 3 || fileName.length < 2 || catalogName.length < 2;
    }

    const submit = async () => {
        const result = await sendPostWithPayload("append", {
            "catalog": catalogName, "file": fileName, "text": text
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

export default Appender;
