import React from "react";
import { Form, Link, redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";

export const deactivateAction: ActionFunction = async () => {
  const url = "/api/v1/deactivate";
  const headers = ReactOnRails.authenticityHeaders({});
  const res = await fetch(url, {
    headers,
    method: "DELETE",
  });
  if (res.ok) {
    return redirect("/auth/signup");
  }
};

const Deactivate = () => {
  return (
    <Form className="flexbox" method="delete">
      <h1>Deactivate Account</h1>
      <div className="flexbox">
        <p>Are you sure?</p>
        <p>All your data will be deleted.</p>
      </div>
      <button className="danger" type="submit">
        Deactivate
      </button>
      <Link to="/auth/logout" className="subtle">
        Logout instead?
      </Link>
    </Form>
  );
};

export default Deactivate;
