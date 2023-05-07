import React from "react";
import { Outlet, Link, redirect, useLoaderData } from "react-router-dom";
import style from "./Admin.module.css";
import ReactOnRails from "react-on-rails";

export const adminLoader = async () => {
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

interface LoaderProps {
  email: string;
}

const Admin = () => {
  const { email } = useLoaderData() as LoaderProps;

  return (
    <div className={style.main}>
      <div className={style.horizontal}>
        <div className={style.flexbox}>
          <Link to="/admin">
            <h3>Admin Panel</h3>
          </Link>
          <div>logged in as {email}</div>
        </div>
        <div className={style.horizontal}>
          <div className={style.flexbox}>
            <Link to="upload">Upload</Link>
            <Link to="docs">Documents</Link>
          </div>
          <div className={style.flexbox}>
            <a href="/">Normal View</a>
            <Link to="logout">Logout</Link>
            <Link to="deactivate">Deactivate</Link>
          </div>
        </div>
      </div>
      <hr />
      <Outlet />
    </div>
  );
};

export default Admin;
