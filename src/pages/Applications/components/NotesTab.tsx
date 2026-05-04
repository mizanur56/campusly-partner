import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Empty,
  Input,
  List,
  message,
  Modal,
  Skeleton,
} from "antd";
import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  useCreateApplicationNoteMutation,
  useDeleteApplicationNoteMutation,
  useGetApplicationNotesQuery,
  useReplyToApplicationNoteMutation,
  useUpdateApplicationNoteMutation,
} from "../../../redux/features/application/applicationApi";
import { selectCurrentUser } from "../../../redux/features/auth/authSlice";
import { useAppSelector } from "../../../redux/features/hooks";

type NotesTabProps = {
  applicationId: string;
};

type TNoteAuthor = {
  id: string;
  name: string;
  role: string;
};

type TApplicationNote = {
  id: string;
  applicationId: string;
  parentId: string | null;
  title: string | null;
  body: string;
  author: TNoteAuthor;
  createdAt: string;
  replies: TApplicationNote[];
};

const NotesTab = ({ applicationId }: NotesTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [replyForNoteId, setReplyForNoteId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [expandedThreads, setExpandedThreads] = useState<
    Record<string, boolean>
  >({});
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editIsReply, setEditIsReply] = useState(false);

  const { data: notesResponse, isLoading } = useGetApplicationNotesQuery(
    applicationId,
    {
      skip: !applicationId,
      refetchOnMountOrArgChange: true,
    },
  );

  const [createNote, { isLoading: isCreating }] =
    useCreateApplicationNoteMutation();
  const [replyToNote, { isLoading: isReplying }] =
    useReplyToApplicationNoteMutation();
  const [updateNote, { isLoading: isUpdating }] =
    useUpdateApplicationNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] =
    useDeleteApplicationNoteMutation();

  const notes: TApplicationNote[] = notesResponse?.data ?? [];
  const currentUser = useAppSelector(selectCurrentUser);
  const loggedUserId = currentUser?.id;

  const canMutate = (n: TApplicationNote) =>
    !!loggedUserId && n?.author?.id === loggedUserId;

  // Rich Text Editor Toolbar Modules
  const modules = {
    toolbar: [
      ["bold", "italic"],
      [{ list: "bullet" }, { list: "ordered" }],
      ["link"],
    ],
  };

  const getInitials = (name?: string) => {
    const n = (name || "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
  };

  const roleLabel = (role?: string) => {
    const r = (role || "").toUpperCase();
    if (!r) return "";
    if (r === "ADMIN") return "Admin";
    if (r === "AGENT") return "Agent";
    if (r === "STUDENT") return "Student";
    if (r === "PARTNER") return "Partner";
    return r;
  };

  const roleChipClass = (role?: string) => {
    const r = (role || "").toUpperCase();
    if (r === "ADMIN")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (r === "AGENT") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (r === "STUDENT") return "bg-amber-50 text-amber-800 border-amber-200";
    if (r === "PARTNER")
      return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-gray-50 text-gray-700 border-primary-border";
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onSend = async () => {
    if (!applicationId) return;
    const cleanTitle = title.trim();
    const cleanBody = (editorValue || "").trim();
    if (!cleanBody) {
      message.warning("Please write a note first.");
      return;
    }
    try {
      await createNote({
        applicationId,
        body: { title: cleanTitle ? cleanTitle : undefined, body: cleanBody },
      }).unwrap();
      setShowForm(false);
      setTitle("");
      setEditorValue("");
      message.success("Note sent.");
    } catch (e: any) {
      message.error(e?.data?.message || "Failed to send note.");
    }
  };

  const onReply = async (noteId: string) => {
    const clean = (replyBody || "").trim();
    if (!clean) {
      message.warning("Please write a reply first.");
      return;
    }
    try {
      await replyToNote({
        applicationId,
        noteId,
        body: { body: clean },
      }).unwrap();
      setReplyForNoteId(null);
      setReplyBody("");
      setExpandedThreads((s) => ({ ...s, [noteId]: true }));
      message.success("Reply sent.");
    } catch (e: any) {
      message.error(e?.data?.message || "Failed to send reply.");
    }
  };

  const openEdit = (n: TApplicationNote) => {
    setEditNoteId(n.id);
    setEditIsReply(!!n.parentId);
    setEditTitle(n.parentId ? "" : n.title || "");
    setEditBody(n.body || "");
  };

  const onSaveEdit = async () => {
    if (!applicationId || !editNoteId) return;
    const cleanTitle = editTitle.trim();
    const cleanBody = editBody.trim();

    if (!cleanBody) {
      message.warning("Body is required.");
      return;
    }

    try {
      await updateNote({
        applicationId,
        noteId: editNoteId,
        body: {
          body: cleanBody,
          title: cleanTitle ? cleanTitle : null,
        },
      }).unwrap();
      setEditNoteId(null);
      setEditTitle("");
      setEditBody("");
      message.success("Updated.");
    } catch (e: any) {
      message.error(e?.data?.message || "Failed to update.");
    }
  };

  const confirmDelete = (noteId: string) => {
    Modal.confirm({
      title: "Delete this note?",
      content:
        "This will remove the note. If it has replies, they will be removed too.",
      okText: "Delete",
      okButtonProps: { danger: true, loading: isDeleting },
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await deleteNote({ applicationId, noteId }).unwrap();
          message.success("Deleted.");
        } catch (e: any) {
          message.error(e?.data?.message || "Failed to delete.");
        }
      },
    });
  };

  const renderBodyHtml = (html: string) => (
    <div
      className="prose prose-sm max-w-none text-[#374151] leading-[1.7] text-[14px] prose-p:my-2 prose-li:my-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  const NotesSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-primary-border bg-white overflow-hidden p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Skeleton.Avatar active size={44} shape="circle" />
              <div className="min-w-0 w-[min(520px,80vw)]">
                <div className="flex items-center gap-3">
                  <Skeleton.Input active size="small" style={{ width: 160 }} />
                  <Skeleton.Input active size="small" style={{ width: 90 }} />
                  <Skeleton.Input active size="small" style={{ width: 120 }} />
                </div>
                <div className="mt-3">
                  <Skeleton.Input
                    active
                    size="default"
                    style={{ width: 420 }}
                  />
                </div>
              </div>
            </div>
            <Skeleton.Button active size="default" shape="circle" />
          </div>

          <div className="mt-5">
            <Skeleton
              active
              paragraph={{ rows: 3, width: ["95%", "90%", "75%"] }}
              title={false}
            />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Skeleton.Input active size="small" style={{ width: 110 }} />
            <Skeleton.Button active size="small" style={{ width: 110 }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4">
      <style>{`
        .quill-wrapper {
          border-radius: 14px;
          overflow: hidden;
        }
        .quill-wrapper .ql-toolbar {
          border-top-left-radius: 14px;
          border-top-right-radius: 14px;
          background-color: #f9fafb;
          border-color: #d1d5db;
        }
        .quill-wrapper .ql-container {
          border-bottom-left-radius: 14px;
          border-bottom-right-radius: 14px;
          font-size: 15px;
          border-color: #d1d5db;
        }
        .quill-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#111827]">
            {/* <FiEdit className="text-[18px] text-[#2d7a42]" /> */}
            <div className="text-[18px] font-semibold">Notes</div>
            <span className="ml-2 text-xs font-semibold px-2 py-1 rounded-full border border-primary-border text-gray-600 bg-white">
              {notes.length} threads
            </span>
          </div>
          <div className="text-[12px] text-gray-500 mt-1">
            Internal discussion for this application. Latest activity appears
            first.
          </div>
        </div>

        {!showForm && (
          <Button
            type="primary"
            onClick={() => setShowForm(true)}
            icon={<PlusOutlined />}
          >
            New note
          </Button>
        )}
      </div>

      {/* Note Creation Form */}
      {showForm && (
        <div className="mb-8 p-5 rounded-3xl bg-[#FFFFFF] border border-primary-border">
          <div className="">
            <div className="mb-4">
              <label className="block text-gray-500 text-sm mb-1 font-medium">
                Title
              </label>
              <Input
                placeholder="Enter title"
                className="rounded-lg border-gray-300 h-11 focus:border-[#2d7a42] focus:shadow-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                onClick={() => {
                  setShowForm(false);
                  setTitle("");
                  setEditorValue("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                className="bg-[#2d7a42] hover:bg-[#235e33] border-none rounded-lg px-8 h-10 font-semibold shadow-sm"
                loading={isCreating}
                onClick={onSend}
              >
                Send
              </Button>
            </div>
          </div>

          <style>{`
            .quill-wrapper .ql-container {
              height: 180px;
            }
          `}</style>
        </div>
      )}

      {/* Notes Display List */}
      {isLoading && (
        <div className="py-2">
          <NotesSkeleton />
        </div>
      )}

      {!isLoading && notes.length === 0 && (
        <div className="py-12 rounded-2xl border border-dashed border-primary-border bg-white">
          <Empty description="No notes yet" />
        </div>
      )}

      {!isLoading && notes.length > 0 && (
        <List
          dataSource={notes}
          renderItem={(note) => (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="rounded-3xl !border-primary-border !border transition-shadow bg-white overflow-hidden p-6">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar
                        size={44}
                        className="bg-[#EEF2FF] text-[#3730A3] font-semibold shrink-0"
                      >
                        {getInitials(note.author?.name)}
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-gray-900 truncate">
                            {note.author?.name || "Unknown"}
                          </div>

                          <span className="text-[11px] text-gray-400 font-medium">
                            {formatTime(note.createdAt)}
                          </span>
                        </div>

                        <div className="mt-1">
                          <div className="text-[15px] font-semibold text-[#111827] leading-snug">
                            {note.title ? note.title : "Note"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {canMutate(note) && (
                      <Dropdown
                        trigger={["click"]}
                        placement="bottomRight"
                        menu={{
                          items: [
                            {
                              key: "edit",
                              label: "Edit",
                              onClick: () => openEdit(note),
                            },
                            {
                              key: "delete",
                              label: "Delete",
                              onClick: () => confirmDelete(note.id),
                            },
                          ],
                        }}
                      >
                        <Button
                          variant="outlined"
                          icon={<MoreOutlined className="text-xl" />}
                          className="border-primary-border text-gray-400 rounded-lg flex items-center justify-center w-10 h-10 hover:text-gray-700 hover:border-gray-300"
                        />
                      </Dropdown>
                    )}
                  </div>

                  <div className="mt-4">{renderBodyHtml(note.body)}</div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {note.replies?.length > 0 ? (
                        <Button
                          type="default"
                          className="border-primary-border text-gray-700 rounded-lg h-9 px-3 bg-white hover:border-gray-300"
                          onClick={() =>
                            setExpandedThreads((s) => ({
                              ...s,
                              [note.id]: !s[note.id],
                            }))
                          }
                        >
                          {expandedThreads[note.id]
                            ? `Hide replies (${note.replies.length})`
                            : `View replies (${note.replies.length})`}
                        </Button>
                      ) : (
                        <span className="text-[12px] text-gray-500">
                          0 replies
                        </span>
                      )}
                    </div>

                    <Button
                      type="primary"
                      className="bg-[#2d7a42] hover:bg-[#235e33] border-none px-6 rounded-lg font-semibold h-9 shadow-sm"
                      onClick={() => {
                        setReplyForNoteId(note.id);
                        setReplyBody("");
                        setExpandedThreads((s) => ({ ...s, [note.id]: true }));
                      }}
                    >
                      Reply
                    </Button>
                  </div>
                </div>

                {note.replies?.length > 0 && expandedThreads[note.id] && (
                  <div className="mt-5">
                    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden">
                      <div className="px-5 py-3 flex items-center justify-between">
                        <div className="text-[12px] font-semibold text-gray-700">
                          Replies
                          <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E7EB] bg-white text-gray-600">
                            {note.replies.length}
                          </span>
                        </div>
                        <Button
                          type="text"
                          className="text-gray-500 hover:text-gray-800"
                          onClick={() =>
                            setExpandedThreads((s) => ({
                              ...s,
                              [note.id]: false,
                            }))
                          }
                        >
                          Hide
                        </Button>
                      </div>

                      <div className="px-5 pb-5">
                        <div className="relative mt-2">
                          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[#E5E7EB]" />

                          <div className="space-y-3">
                            {note.replies.map((r) => (
                              <div key={r.id} className="relative pl-11">
                                <span className="absolute left-[14px] top-[18px] h-2.5 w-2.5 rounded-full bg-white border border-primary-border" />

                                <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Avatar
                                        size={32}
                                        className="bg-[#F3F4F6] border border-[#E5E7EB] text-gray-700 font-semibold"
                                      >
                                        {getInitials(r.author?.name)}
                                      </Avatar>
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <div className="text-[13px] font-semibold text-gray-900 truncate">
                                            {r.author?.name || "Unknown"}
                                          </div>
                                          <span className="text-[11px] text-gray-400 font-medium">
                                            {formatTime(r.createdAt)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {canMutate(r) && (
                                      <Dropdown
                                        trigger={["click"]}
                                        placement="bottomRight"
                                        menu={{
                                          items: [
                                            {
                                              key: "edit",
                                              label: "Edit",
                                              onClick: () => openEdit(r),
                                            },
                                            {
                                              key: "delete",
                                              label: "Delete",
                                              onClick: () =>
                                                confirmDelete(r.id),
                                            },
                                          ],
                                        }}
                                      >
                                        <Button
                                          variant="outlined"
                                          icon={
                                            <MoreOutlined className="text-lg" />
                                          }
                                          className="border-[#E5E7EB] text-gray-400 rounded-lg flex items-center justify-center w-9 h-9 hover:text-gray-700 hover:border-gray-300 bg-white"
                                        />
                                      </Dropdown>
                                    )}
                                  </div>

                                  <div className="mt-3">
                                    {renderBodyHtml(r.body)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {replyForNoteId === note.id && (
                  <div className="mt-5">
                    <div className="mb-3">
                      <h2 className="text-[15px] font-semibold text-[#111827] leading-snug">
                        Replying to {note.author?.name || "this thread"}
                      </h2>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {" "}
                        Keep it short and specific.
                      </p>
                    </div>

                    <div className="quill-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={replyBody}
                        onChange={setReplyBody}
                        modules={modules}
                        placeholder="Write a reply..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        className="border-gray-300 text-gray-600 rounded-lg h-9"
                        onClick={() => {
                          setReplyForNoteId(null);
                          setReplyBody("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        className="bg-[#2d7a42] hover:bg-[#235e33] border-none rounded-lg h-9 font-semibold shadow-sm"
                        loading={isReplying}
                        onClick={() => onReply(note.id)}
                      >
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        />
      )}

      <Modal
        title="Edit note"
        open={!!editNoteId}
        onCancel={() => {
          setEditNoteId(null);
          setEditTitle("");
          setEditBody("");
          setEditIsReply(false);
        }}
        onOk={onSaveEdit}
        okText="Save"
        okButtonProps={{
          style: { backgroundColor: "#2d7a42", borderColor: "#2d7a42" },
          loading: isUpdating,
        }}
        width={800}
        centered
      >
        <div className="p-1">
          <div className="mb-4">
            <label className="block text-gray-500 text-sm mb-1 font-medium">
              Title
            </label>
            <Input
              placeholder="Enter title"
              className="rounded-md border-gray-300 h-10 focus:border-[#2d7a42] focus:shadow-none"
              value={editTitle}
              disabled={editIsReply}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            {editIsReply && (
              <div className="text-xs text-gray-400 mt-1">
                Replies don’t keep a title.
              </div>
            )}
          </div>

          <div className="quill-wrapper">
            <ReactQuill
              theme="snow"
              value={editBody}
              onChange={setEditBody}
              modules={modules}
              placeholder="Write your note here..."
            />
          </div>

          <style>{`
            .quill-wrapper .ql-container {
              height: 180px;
            }
          `}</style>
        </div>
      </Modal>
    </div>
  );
};

export default NotesTab;
