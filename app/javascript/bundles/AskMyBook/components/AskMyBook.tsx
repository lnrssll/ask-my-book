import React from "react";
import style from "./AskMyBook.module.css";
import { Outlet, Link, redirect, useLoaderData } from "react-router-dom";
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
  const { email } = useLoaderData() as MeProps;
  return (
    <div className={style.main}>
      <div className={style.horizontal}>
        <div className={style.flexbox}>
          <Link to="/">
            <h3>AskMyBook</h3>
          </Link>
          <div>logged in as {email}</div>
        </div>
        <div className={style.flexbox}>
          <a href="/admin">Admin Panel</a>
          <Link to="logout">Logout</Link>
          <Link to="deactivate">Deactivate</Link>
        </div>
      </div>
      <hr />
      <Outlet />
    </div>
  );
};

export default AskMyBook;
