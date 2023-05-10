import React from "react";
import { Form, Link, redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import style from "./Logout.module.css";
import { XMarkIcon } from "@heroicons/react/24/solid";

export const logoutAction: ActionFunction = async () => {
  const url = "/api/v1/logout";
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "DELETE",
  });
  if (res.ok) {
    return redirect("/auth/login");
  }
  alert("Logout failed");
  return redirect("/admin");
};

const Logout = () => {
  return (
    <div className={style.main}>
      <Link to="/admin">
        <XMarkIcon className={style.icon} />
      </Link>
      <div className={style.outlet}>
        <Form className="flexbox" method="delete">
          <h1 className="centered">Logout</h1>
          <p>Are you sure?</p>
          <button className="danger" type="submit">
            Confirm
          </button>
          <Link to="/auth/deactivate" className="subtle">
            Looking to deactivate instead?
          </Link>
        </Form>
      </div>
    </div>
  );
};

export default Logout;
