import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditorType } from 'tinymce';
import { useRef } from 'react';

interface TinyMCEEditorProps {
	value: string | undefined;
	onChange: (content: string) => void;
	height?: number;
}

export default function TinyMCEEditor({ value, onChange, height = 500 }: TinyMCEEditorProps) {
	const editorRef = useRef<TinyMCEEditorType | null>(null);

	return (
		<Editor
			apiKey="y0s2sc1av6gjwzlkgysihlsj540unxshm8sfgo8z6yc2yhp2"
			onInit={(_evt, editor) => editorRef.current = editor}
			value={value || ''}
			onEditorChange={(content) => onChange(content)}
			init={{
				height: height,
				menubar: true,
				plugins: [
					'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
					'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
					'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
				],
				toolbar: 'undo redo | blocks | ' +
					'bold italic forecolor | alignleft aligncenter ' +
					'alignright alignjustify | bullist numlist outdent indent | ' +
					'removeformat | help',
				content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
			}}
		/>
	);
}
