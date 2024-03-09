import { Id, ToastContent, TypeOptions, toast } from "react-toastify";

export function makeLoader(content: ToastContent<unknown>): Id {
  return toast.loading(content, { autoClose: false });
}

export function updateLoader(
  id: Id,
  content: ToastContent<unknown>,
  type: TypeOptions
) {
  toast.update(id, {
    render: content,
    type: type,
    isLoading: false,
    autoClose: 5000,
  });
}

export function extractMessage(error: any): string {
  return error.metaMessages &&
    error.metaMessages.length > 0 &&
    (error.metaMessages[0] as string).startsWith("Error")
    ? error.metaMessages[0]
    : error.shortMessage || error.message;
}
