import { Box, Button, Typography } from '@mui/material';
import React, { useMemo, useRef } from 'react';
import Iconify from '../Iconify';
import app from '@/config';

export default function ImageInput({
    handleFile,
    file,
    defaultImage,
    label,
    style,
}: {
    handleFile: (file: any) => void;
    file: any;
    defaultImage?: string,
    label?: string;
    style?: React.CSSProperties;
}) {
    const hiddenFileInput = useRef(null);

    const handleClick = (event) => {
        hiddenFileInput.current.click();
    };

    const handleChange = (event) => {
        const fileUploaded = event.target.files[0];
        handleFile(fileUploaded);
    };

    const handleDelete = () => handleFile(null);

    return (
        <Box>
            {label && <Typography variant="subtitle2" align="center" gutterBottom sx={{}}>
                {label}
            </Typography>}
            <Button
                style={{
                    width: 100,
                    height: 100,
                    backgroundColor: '#C6C6C6',
                    margin: 15,
                    padding: 0,
                    borderRadius: 10,
                    overflow: 'hidden',
                    ...style,
                }}
                onClick={handleClick}
            >
                <input type="file" ref={hiddenFileInput} onChange={handleChange} accept="Image/*" style={{ display: 'none' }} />
                {file || defaultImage ? (
                    <img
                        src={file ? URL.createObjectURL(file) : app.route + defaultImage}
                        style={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            padding: 0,
                            margin: 0,
                            border: '2px solid #c6c6c6',
                        }}
                    />
                ) : (
                    <Iconify width={60} height={60} icon="bi:image-fill" color="#fff" />
                )}
            </Button>
            {(file || defaultImage) && (
                <Button onClick={handleDelete}>
                    <Iconify width={20} height={20} icon="zondicons:close-solid" color="red" />
                </Button>
            )}
        </Box>
    );
}
