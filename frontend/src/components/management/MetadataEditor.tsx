import React, { useState } from 'react';
import './MetadataEditor.css'

export interface Metadata {
    tags: string[];
    description: string;
    protected: boolean;
    hidden: boolean;
    unpublished: boolean;
}

interface Props {
    initialMetadata: Metadata;
    onSave: (metadata: Metadata) => void;
}

const MetadataEditor: React.FC<Props> = ({ initialMetadata, onSave }) => {
    const [metadata, setMetadata] = useState<Metadata>(initialMetadata);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;

        setMetadata((prevMetadata) => ({
            ...prevMetadata,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    React.useEffect(() => {
        setMetadata(initialMetadata)
    }, [initialMetadata])

    const handleTagsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const tags = event.target.value.split(',').map((tag) => tag.trim());
        setMetadata((prevMetadata) => ({
            ...prevMetadata,
            tags,
        }));
    };

    const handleSave = () => {
        onSave(metadata);
    };

    return (
        <div className='metadata-editor'>
            <div>
                <label>
                    Description:
                    <input
                        type="text"
                        name="description"
                        value={metadata.description}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Tags:
                    <input
                        type="text"
                        name="tags"
                        value={metadata.tags.join(', ')}
                        onChange={handleTagsChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Protected:
                    <input
                        type="checkbox"
                        name="protected"
                        checked={metadata.protected}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Hidden:
                    <input
                        type="checkbox"
                        name="hidden"
                        checked={metadata.hidden}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Unpublished:
                    <input
                        type="checkbox"
                        name="unpublished"
                        checked={metadata.unpublished}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <button onClick={handleSave}>Update</button>
        </div>
    );
};

export default MetadataEditor;
