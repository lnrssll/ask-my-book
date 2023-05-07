import React from "react";
import { Form, redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import style from "./Deactivate.module.css";

export const deactivateAction: ActionFunction = async () => {
  const url = "/api/v1/deactivate";
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "DELETE",
  });
  if (res.ok) {
    return redirect("/signup");
  }
};

const Deactivate = () => {
  return (
    <Form method="delete">
      <h1>Deactivate Account</h1>
      <div className={style.flexbox}>
        <p>Are you sure?</p>
        <button className={style.danger} type="submit">
          Deactivate
        </button>
      </div>
    </Form>
  );
};

export default Deactivate;
