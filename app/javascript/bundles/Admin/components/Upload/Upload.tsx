import React, { useState, useRef } from "react";
import type { MouseEvent, ChangeEvent } from "react";
import { Form, Link, redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import style from "./Upload.module.css";
import ReactOnRails from "react-on-rails";
import { startCase } from "lodash";

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
      setTitle(startCase(file.name.split(".")[0]));
    }
  };

  const handleCancel = (e: MouseEvent) => {
    setFile(null);
    setDescription("");
    setAuthor("");
    setStart(1);
    setPage(1);
    setTitle("");
  };

  return (
    <div className="flexbox fit">
      <Form encType="multipart/form-data" className={style.form} method="post">
        {!file && <button onClick={handleInputClick}>Upload</button>}
        <label className={style.label} htmlFor="file">
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
            <label className={style.label} htmlFor="title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                id="title"
                name="document[title]"
                type="text"
                className={style.input}
              />
            </label>
            <label className={style.label} htmlFor="author">
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                id="author"
                placeholder="Author"
                name="document[author]"
                type="text"
                className={style.input}
              />
            </label>
            <label className={style.label} htmlFor="description">
              <textarea
                id="description"
                name="document[description]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
              />
            </label>
            <div className={style.preview}>
              <Preview
                file={file}
                page={page}
                setPage={setPage}
                setStart={setStart}
                setEnd={setEnd}
              />
              <div className={style.horizontal}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setStart(page);
                  }}
                >
                  Set Start
                </button>
                <div className={style.flexbox}>Page {page}</div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEnd(page);
                  }}
                >
                  Set End
                </button>
              </div>
            </div>
            <div className={style.horizontal}>
              <label className={style.label} htmlFor="start">
                <input
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
                  style={{ textAlign: "center" }}
                  className={style.input}
                />
              </label>
              <div className="centered">through</div>
              <label className={style.label} htmlFor="end">
                <input
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
                  style={{ textAlign: "center" }}
                  className={style.input}
                />
              </label>
            </div>
            <div className={style.double}>
              <button onClick={handleCancel}>Cancel</button>
              <button type="submit">Submit</button>
            </div>
          </>
        )}
      </Form>
      {!file && (
        <Link to="docs">
          <button>My Docs</button>
        </Link>
      )}
    </div>
  );
};

export default Upload;
