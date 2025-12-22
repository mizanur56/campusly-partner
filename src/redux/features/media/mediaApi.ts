import { baseApi } from "../../api/baseApi";

const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Media endpoints
    uploadImage: builder.mutation({
      query: (payload: FormData) => ({
        url: "/media/upload",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["media", "folders"],
    }),

    mediaList: builder.query({
      query: (args?: { name: string; value: any }[]) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((item) => {
            params.append(item.name, item.value);
          });
        }
        return {
          url: "/media",
          method: "GET",
          params: params,
        };
      },
      providesTags: ["media"],
    }),

    deleteMedia: builder.mutation({
      query: (id: string) => ({
        url: `/media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["media", "folders"],
    }),

    updateMedia: builder.mutation({
      query: ({ id, payload }: { id: string; payload: any }) => ({
        url: `/media/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["media"],
    }),

    getMediaById: builder.query({
      query: (id: string) => ({
        url: `/media/${id}`,
        method: "GET",
      }),
      providesTags: ["media"],
    }),

    // Folder endpoints
    getAllFolders: builder.query({
      query: () => ({
        url: "/media/folders/all",
        method: "GET",
      }),
      providesTags: ["folders"],
    }),

    createFolder: builder.mutation({
      query: (payload: { name: string; parentPath?: string }) => ({
        url: "/media/folders",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["folders"],
    }),

    renameFolder: builder.mutation({
      query: (payload: { oldPath: string; newName: string }) => ({
        url: "/media/folders/rename",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["folders", "media"],
    }),

    deleteFolder: builder.mutation({
      query: (path: string) => ({
        url: `/media/folders/${encodeURIComponent(path)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["folders", "media"],
    }),

    getFolderWithMedia: builder.query({
      query: (path: string) => ({
        url: `/media/folders/${encodeURIComponent(path)}/media`,
        method: "GET",
      }),
      providesTags: ["folders", "media"],
    }),
  }),
});

export const {
  // Media hooks
  useMediaListQuery,
  useUploadImageMutation,
  useDeleteMediaMutation,
  useUpdateMediaMutation,
  useGetMediaByIdQuery,

  // Folder hooks
  useGetAllFoldersQuery,
  useCreateFolderMutation,
  useRenameFolderMutation,
  useDeleteFolderMutation,
  useGetFolderWithMediaQuery,
} = mediaApi;
