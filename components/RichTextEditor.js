'use client'

import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

// Dynamically import react-quill to prevent SSR window is not defined errors
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function RichTextEditor({ value, onChange, placeholder }) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    }

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'link'
    ]

    return (
        <div className="bg-white">
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || "Write description here..."}
                className="h-64 mb-12"
            />
        </div>
    )
}
