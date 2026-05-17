import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: any) => void;
  placeholder?: string;
  height?: number;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder,
  height = 480,
  readOnly = false,
}) => {
  const editorRef = useRef<any>(null);
  const tinyMceScriptSrc = `${import.meta.env.BASE_URL}tinymce/tinymce.min.js`;

  return (
    <div>
      <Editor
        // Self-hosted: load from /public/tinymce (no API key, no cloud)
        tinymceScriptSrc={tinyMceScriptSrc}
        licenseKey="gpl"
        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        disabled={readOnly}
        onEditorChange={(content) => onChange?.(content)}
        init={{
          height,
          // Menu bar — WordPress-Classic style
          menubar: "file edit view insert format tools table help",
          menu: {
            file: {
              title: "File",
              items: "newdocument restoredraft | preview | print",
            },
            edit: {
              title: "Edit",
              items:
                "undo redo | cut copy paste pastetext | selectall | searchreplace",
            },
            view: {
              title: "View",
              items:
                "code | visualaid visualchars visualblocks | preview fullscreen",
            },
            insert: {
              title: "Insert",
              items:
                "image link media addcomment pageembed codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor insertdatetime",
            },
            format: {
              title: "Format",
              items:
                "bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat",
            },
            tools: {
              title: "Tools",
              items: "code wordcount",
            },
            table: {
              title: "Table",
              items:
                "inserttable | cell row column | advtablesort | tableprops deletetable",
            },
            help: { title: "Help", items: "help" },
          },
          placeholder: placeholder || "Write something...",

          // ALL free GPL plugins available in the package
          plugins: [
            "accordion",
            "advlist",
            "anchor",
            "autolink",
            "autosave",
            "charmap",
            "code",
            "codesample",
            "directionality",
            "emoticons",
            "fullscreen",
            "help",
            "image",
            "insertdatetime",
            "link",
            "lists",
            "media",
            "nonbreaking",
            "pagebreak",
            "preview",
            "quickbars",
            "searchreplace",
            "table",
            "visualblocks",
            "visualchars",
            "wordcount",
          ],

          // Three-row WordPress-like toolbar
          toolbar: [
            "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor removeformat",
            "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | blockquote codesample | hr pagebreak",
            "link unlink anchor | image media table emoticons charmap | searchreplace | ltr rtl | visualblocks visualchars | preview fullscreen code | help",
          ].join(" | "),
          toolbar_mode: "sliding",
          toolbar_sticky: true,

          // Selection-based "quick" toolbars (like Medium / Notion)
          quickbars_selection_toolbar:
            "bold italic underline | h2 h3 blockquote | quicklink",
          quickbars_insert_toolbar: "quickimage quicktable | hr pagebreak",

          // Context menu when right-clicking on link/image/table
          contextmenu: "link image table",

          // Word + character count
          statusbar: true,
          elementpath: true,
          wordcount_show_words: true,
          wordcount_show_characters: true,

          // Auto-save drafts to localStorage every 10s; recoverable on reload
          autosave_ask_before_unload: true,
          autosave_interval: "10s",
          autosave_prefix: "tinymce-autosave-{path}{query}-{id}-",
          autosave_restore_when_empty: false,
          autosave_retention: "30m",

          // Paste behavior — preserve formatting from Word/Docs/etc.
          paste_data_images: true,
          paste_block_drop: false,
          paste_as_text: false,
          paste_webkit_styles: "all",
          paste_retain_style_properties: "all",
          paste_remove_styles_if_webkit: false,
          smart_paste: true,

          // Image upload — converts to base64 inline (no upload endpoint needed)
          // To use a real upload, swap this for `images_upload_handler`
          image_caption: true,
          image_advtab: true,
          image_title: true,
          object_resizing: true,

          // Branding / promo — fully disabled (GPL)
          branding: false,
          promotion: false,

          // Font/size dropdowns
          font_size_formats:
            "10px 12px 14px 15px 16px 18px 20px 22px 24px 28px 32px 36px 42px 48px 60px 72px",
          font_family_formats:
            "Inter=Inter, system-ui, sans-serif;" +
            "Arial=arial, helvetica, sans-serif;" +
            "Helvetica=helvetica, arial, sans-serif;" +
            "Georgia=georgia, palatino, serif;" +
            "Times New Roman=times new roman, times, serif;" +
            "Courier New=courier new, courier, monospace;" +
            "Tahoma=tahoma, arial, helvetica, sans-serif;" +
            "Verdana=verdana, geneva, sans-serif",
          block_formats:
            "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Blockquote=blockquote; Code=pre; Preformatted=pre",

          // Code samples — supported languages
          codesample_languages: [
            { text: "HTML/XML", value: "markup" },
            { text: "JavaScript", value: "javascript" },
            { text: "TypeScript", value: "typescript" },
            { text: "CSS", value: "css" },
            { text: "PHP", value: "php" },
            { text: "Ruby", value: "ruby" },
            { text: "Python", value: "python" },
            { text: "Java", value: "java" },
            { text: "C", value: "c" },
            { text: "C#", value: "csharp" },
            { text: "C++", value: "cpp" },
            { text: "Go", value: "go" },
            { text: "Rust", value: "rust" },
            { text: "Bash", value: "bash" },
            { text: "JSON", value: "json" },
            { text: "SQL", value: "sql" },
          ],

          // Editor content styling — matches your design system
          content_style: `
            body {
              font-family: Inter, 'Segoe UI', system-ui, -apple-system, sans-serif;
              font-size: 15px;
              line-height: 1.65;
              color: #1f2937;
              padding: 16px;
            }
            body p { margin: 0 0 0.75em; }
            body h1 { font-size: 2em; font-weight: 700; line-height: 1.25; margin: 0.5em 0 0.4em; }
            body h2 { font-size: 1.5em; font-weight: 700; line-height: 1.3; margin: 0.5em 0 0.4em; }
            body h3 { font-size: 1.25em; font-weight: 600; line-height: 1.4; margin: 0.5em 0 0.3em; }
            body h4 { font-size: 1.1em; font-weight: 600; margin: 0.4em 0 0.3em; }
            body h5, body h6 { font-weight: 600; margin: 0.4em 0 0.3em; }
            body ul, body ol { padding-left: 1.5em; margin: 0.5em 0; }
            body a { color: #237d3b; text-decoration: underline; }
            body blockquote {
              border-left: 3px solid #e5e7eb;
              padding: 0.25em 0 0.25em 1em;
              margin: 0.75em 0;
              color: #6b7280;
              font-style: italic;
            }
            body img { max-width: 100%; height: auto; border-radius: 4px; }
            body pre {
              background: #f3f4f6;
              padding: 1em;
              border-radius: 6px;
              font-family: 'Fira Code', Consolas, Monaco, monospace;
              font-size: 0.9em;
              overflow-x: auto;
            }
            body hr {
              border: none;
              border-top: 1px solid #e5e7eb;
              margin: 1.5em 0;
            }
            body table { border-collapse: collapse; margin: 1em 0; }
            body table td, body table th {
              border: 1px solid #e5e7eb;
              padding: 0.5em 0.75em;
            }
            body table th { background: #f9fafb; font-weight: 600; }
          `,
        }}
      />
    </div>
  );
};

export default RichTextEditor;
