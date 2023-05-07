import React from "react";
import { Form, redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import style from "./Logout.module.css";

export const logoutAction: ActionFunction = async () => {
  const url = "/api/v1/logout";
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "DELETE",
  });
  if (res.ok) {
    return redirect("/login");
  }
  alert("Logout failed");
  return redirect("/");
};

const Logout = () => {
  return (
    <Form method="delete">
      <h1>Logout</h1>
      <div className={style.flexbox}>
        <p>Are you sure?</p>
        <button className={style.danger} type="submit">
          Logout
        </button>
      </div>
    </Form>
  );
};

export default Logout;
