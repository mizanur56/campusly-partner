
import React, { useState } from "react";
import { Button, Input, Card, Avatar, List } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FiEdit } from "react-icons/fi";

const NotesTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [editorValue, setEditorValue] = useState("");

  const initialNotes = [
    {
      id: 1,
      sender: "Rutuja Nakate",
      title: "Application Withdrawn: Deadlines have Passed",
      time: "April 17, 2024 at 3:44 PM",
      content:
        "Hi Student,\n\nThis application has been withdrawn because the requirement deadlines have passed.\n\nRegards,\nRutuja",
    },
  ];

  // Rich Text Editor Toolbar Modules
  const modules = {
    toolbar: [
      ["bold", "italic"],
      [{ list: "bullet" }, { list: "ordered" }],
      ["link"],
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <button className="text-lg font-semibold flex items-center cursor-pointer  gap-2 text-[#2A2A2A]">
          <FiEdit className="text-lg hover:text-[#2d7a42]" /> Notes
        </button>
        {!showForm && (
          <Button
            type="primary"
            className="bg-[#2d7a42] hover:bg-[#235e33] border-none px-6 h-10 font-medium rounded-md"
            onClick={() => setShowForm(true)}
          >
            Take Action
          </Button>
        )}
      </div>

      {/* Note Creation Form */}
      {showForm && (
        <div className="mb-8 p-4 rounded-lg bg-[#FFFFFF] border border-[#CFCACF]">
          <div className="">
            <div className="mb-4">
              <label className="block text-gray-500 text-sm mb-1 font-medium">
                Title
              </label>
              <Input
                placeholder="Enter title"
                className="rounded-md border-gray-300 h-10 focus:border-[#2d7a42] focus:shadow-none"
              />
            </div>

            {/* Custom Styled React Quill */}
            <div className="quill-wrapper">
              <ReactQuill
                theme="snow"
                value={editorValue}
                onChange={setEditorValue}
                modules={modules}
                placeholder="Write your note here..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <Button
                className="border-gray-300 text-gray-600 hover:text-green-700 hover:border-green-700 rounded-lg px-8 h-10"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                className="bg-[#2d7a42] hover:bg-[#235e33] border-none rounded-lg px-8 h-10"
                onClick={() => setShowForm(false)}
              >
                Send
              </Button>
            </div>
          </div>

          <style>{`
            .quill-wrapper .ql-toolbar {
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
              background-color: #f9fafb;
              border-color: #d1d5db;
            }
            .quill-wrapper .ql-container {
              border-bottom-left-radius: 8px;
              border-bottom-right-radius: 8px;
              height: 180px;
              font-size: 15px;
              border-color: #d1d5db;
            }
            .quill-wrapper .ql-editor.ql-blank::before {
              color: #9ca3af;
              font-style: normal;
            }
          `}</style>
        </div>
      )}

      {/* Notes Display List */}
      <List
        dataSource={initialNotes}
        renderItem={(note) => (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-start gap-3">
            <div className="flex items-center gap-3 mb-4">
              
              <Avatar size={48} className="bg-[#e5e7eb] text-gray-400" />
            
            </div>

            <div>

            <p className="font-semibold text-gray-800 text-lg tracking-tight mb-4">
                {note.sender}
              </p>

            <Card
              className="rounded-2xl shadow-none transition-colors"
              style={{ borderColor: "#CFCACF", background: "#FFFFFF" }}
              styles={{
                body: {
                  background: "#FFFFFF",
                  borderRadius: 16,
                },
              }}
              bordered
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-[#374151] text-[15px] leading-snug">
                  {note.title}
                </h3>
                <span className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">
                  {note.time}
                </span>
              </div>

              <div className="text-[#4b5563] leading-[1.6] text-[14px] whitespace-pre-line mb-8">
                {note.content}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="primary"
                  className="bg-[#2d7a42] hover:bg-[#235e33] border-none px-8 rounded-lg font-medium h-9"
                >
                  Reply
                </Button>
                <Button
                  variant="outlined"
                  icon={<MoreOutlined className="text-xl" />}
                  className="border-gray-300 text-gray-400 rounded-lg flex items-center justify-center w-10 h-9 hover:text-gray-600"
                />
              </div>
            </Card>
            </div>

          
          </div>
        )}
      />
    </div>
  );
};

export default NotesTab;
