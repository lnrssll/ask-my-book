import React, { useState, useRef } from "react";
import type { MouseEvent, ChangeEvent } from "react";
import { Form, redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import style from "./Upload.module.css";
import ReactOnRails from "react-on-rails";

import Preview from "./Preview";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);

  const handleInputClick = (e: MouseEvent) => {
    e.preventDefault();
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setDescription("");
      setAuthor("");
      setStart(1);
      setPage(1);
      setTitle(file.name.split(".")[0]);
    }
  };

  return (
    <Form encType="multipart/form-data" className={style.form} method="post">
      {!file && <button onClick={handleInputClick}>Choose File</button>}
      <label htmlFor="file">
        <input
          ref={inputRef}
          id="file"
          name="document[file]"
          accept=".pdf"
          multiple={false}
          type="file"
          onChange={handleFileChange}
        />
      </label>
      {!!file && (
        <>
          <label className={style.flexbox} htmlFor="title">
            <div>Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="title"
              name="document[title]"
              type="text"
            />
          </label>
          <label className={style.flexbox} htmlFor="author">
            <div>Author</div>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              id="author"
              name="document[author]"
              type="text"
            />
          </label>
          <label className={style.flexbox} htmlFor="description">
            <textarea
              id="description"
              name="document[description]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
            />
          </label>
          <Preview
            file={file}
            page={page}
            setPage={setPage}
            setStart={setStart}
            setEnd={setEnd}
          />
          <div className={style.horizontal}>
            <label className={style.flexbox} htmlFor="start">
              <div>Start Page</div>
              <input
                className={style.narrow}
                value={start}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setStart(val);
                  if (val > end) {
                    setEnd(val);
                  }
                }}
                id="start"
                name="document[start]"
                type="number"
              />
            </label>
            <label className={style.flexbox} htmlFor="end">
              <div>End Page</div>
              <input
                className={style.narrow}
                value={end}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setEnd(val);
                  if (val < start) {
                    setStart(val);
                  }
                }}
                id="end"
                name="document[end]"
                type="number"
              />
            </label>
          </div>
          <div className={style.horizontal}>
            <button onClick={handleInputClick}>Change File</button>
            <button type="submit">Submit</button>
          </div>
        </>
      )}
    </Form>
  );
};

export default Upload;
