import React from "react";
import { Form, Link, redirect } from "react-router-dom";
import type { ActionFunction } from "react-router-dom";
import ReactOnRails from "react-on-rails";

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
  return redirect("/");
};

const Logout = () => {
  return (
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
  );
};

export default Logout;
