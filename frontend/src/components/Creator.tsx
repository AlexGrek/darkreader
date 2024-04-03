import React, { useState } from 'react';
import "./Creator.css"
import { IoPushSharp } from "react-icons/io5";
import { sendPostWithPayload } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface CreatorProps { }

const Creator: React.FC<CreatorProps> = () => {
    const [catalogName, setCatalogName] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [text, setText] = useState<string>('');
    const [etext, setEText] = useState<string>('');
    const [protectedField, setProtectedField] = useState<boolean>(false);

    const navigate = useNavigate();


    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tagsString = e.target.value;
        const tagsArray = tagsString.split(',').map(tag => tag.trim());
        setTags(tagsArray);
    };

    const isSubmitDisabled = () => {
        return text.length < 3 || fileName.length < 2 || catalogName.length < 2 || description.length < 3;
    }

    const submit = async () => {
        const result = await sendPostWithPayload("create", {
            "catalog": catalogName, "file": fileName, "text": text,
            "tags": tags, "description": description, "protected": protectedField
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
                Catalog Name
                <input
                    type="text"
                    value={catalogName}
                    onChange={(e) => setCatalogName(e.target.value)}
                />
            </label>
            <label className='creator-meta-input-field'>
                File Name
                <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                />
            </label>
            <label className='creator-meta-input-field'>
                Description
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>
            <label className='creator-meta-input-field'>
                Tags (comma-separated)
                <input
                    type="text"
                    value={tags.join(',')}
                    onChange={handleTagsChange}
                />

            </label>
            <label className='creator-meta-input-field'>
                Protected (cannot be read without password)
                <input
                    type="checkbox"
                    checked={protectedField}
                    onChange={(e) => setProtectedField(e.target.checked)}
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
            <button className='creator-submit' disabled={isSubmitDisabled()} onClick={submit}><IoPushSharp />  Publish</button>
        </div>
    );
};

export default Creator;
