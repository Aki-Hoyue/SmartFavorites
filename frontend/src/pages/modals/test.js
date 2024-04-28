import React from 'react';

const FilePreview = () => {
    return (
        <>
            <DocViewer
                documents={[
                    {
                        uri: 'http://127.0.0.1:8000/files/test.pdf',
                    },
                ]}
            />
        </>
    );
};

export default FilePreview;
