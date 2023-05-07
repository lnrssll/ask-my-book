import { redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";

export const docDeleteAction: ActionFunction = async ({ params }) => {
  const id = params.id;
  const url = `/api/v1/docs/${id}`;
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "DELETE",
  });
  if (res.ok) {
    return redirect("/admin/docs");
  }
};
