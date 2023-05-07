import React from "react";
import style from "./AskMyBook.module.css";
import { Link, Form, redirect, useLoaderData } from "react-router-dom";
import ReactOnRails from "react-on-rails";

interface MeProps {
  email: string;
}

export const homeLoader = async () => {
  const headers = ReactOnRails.authenticityHeaders({});
  const url = "/api/v1/me";
  const res = await fetch(url, {
    headers: headers,
    method: "GET",
  });
  if (res.ok) {
    const data = await res.json();
    if (data.email) {
      return data;
    } else {
      return redirect("/login");
    }
  }
};

const AskMyBook = () => {
  const val: string = "AskMyBook";
  const { email } = useLoaderData() as MeProps;
  return (
    <div>
      <h3>{val}!</h3>
      <hr />
      <div>logged in as {email}</div>
      <div className={style.flexbox}>
        <Link to="logout">Logout</Link>
        <Link to="deactivate">Deactivate</Link>
      </div>
    </div>
  );
};

export default AskMyBook;
