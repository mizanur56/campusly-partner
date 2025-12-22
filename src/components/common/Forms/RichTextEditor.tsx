import { Editor } from "@tinymce/tinymce-react";
import { config } from "../../../config";

export type RichTextEditorProps = {
  value?: string;
  onChange?: any;
  height?: number;
  menubar?: boolean;
  placeholder?: string;
};

const RichTextEditor = ({
  value,
  onChange,
  height,
  menubar,
  placeholder,
}: RichTextEditorProps) => {
  return (
    <Editor
      apiKey={config.tiny_api_key}
      value={value}
      onEditorChange={(newValue: string) => {
        onChange?.(newValue);
      }}
      init={{
        height: height || 300,
        menubar: menubar || false,
        placeholder: placeholder || "Type your content here...",
        plugins: [
          "anchor",
          "autolink",
          "charmap",
          "codesample",
          "emoticons",
          "image",
          "link",
          "lists",
          "media",
          "searchreplace",
          // "table",
          "visualblocks",
          "wordcount",
          // "checklist",  <-- remove this
          // "mediaembed",
          // "casechange",
          // "formatpainter",
          // "pageembed",
          // "a11ychecker",
          // "tinymcespellchecker",
          // "permanentpen",
          // "powerpaste",
          // "advtable",
          // "advcode",
          // "editimage",
          // "advtemplate",
          // 'ai',
          // "mentions",
          // "tinycomments",
          // "tableofcontents",
          // "footnotes",
          // "mergetags",
          // 'autocorrect',
          // "typography",
          // "inlinecss",
          // "markdown",
          // "importword",
          // "exportword",
          // "exportpdf",
        ],
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
        //   ai_request: (request: any, respondWith: any) =>
        //     respondWith.string(() =>
        //       Promise.reject("See docs to implement AI Assistant")
        //     ),
      }}
    />
  );
};

export default RichTextEditor;
