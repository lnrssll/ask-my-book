import React from "react";
import { Form, redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import style from "./Upload.module.css";
import ReactOnRails from "react-on-rails";

export const uploadAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = "/api/v1/docs";
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "POST",
    body: formData,
  });
  if (res.ok) {
    return redirect("/admin/docs");
  }
};

const Upload = () => {
  return (
    <Form encType="multipart/form-data" className={style.flexbox} method="post">
      <label htmlFor="file">
        <input
          id="file"
          name="document[file]"
          accept=".pdf"
          multiple={false}
          type="file"
        />
      </label>
      <label className={style.flexbox} htmlFor="title">
        <div className={style.bright}>Title</div>
        <input id="title" name="document[title]" type="text" />
      </label>
      <label className={style.flexbox} htmlFor="description">
        <textarea
          id="description"
          name="document[description]"
          placeholder="Description..."
        />
      </label>
      <button type="submit">Submit</button>
    </Form>
  );
};

export default Upload;
