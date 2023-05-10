import React from "react";
import { Outlet, Link, redirect, useLoaderData } from "react-router-dom";
import style from "./Admin.module.css";
import ReactOnRails from "react-on-rails";
import { HomeIcon, UserMinusIcon } from "@heroicons/react/24/solid";

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
      return redirect("/auth/login");
    }
  } else {
    return redirect("/auth/login");
  }
};

interface LoaderProps {
  email: string;
}

const Admin = () => {
  const { email } = useLoaderData() as LoaderProps;

  return (
    <div className={style.main}>
      <div className={style.header}>
        <div>
          <Link to="/admin">
            <h3>Admin Panel</h3>
          </Link>
          <div>{email}</div>
        </div>
        <div className={style.icons}>
          <a href="/">
            <HomeIcon className={style.icon} />
          </a>
          <Link to="/auth/logout">
            <UserMinusIcon className={style.icon} />
          </Link>
        </div>
      </div>
      <div className={style.outlet}>
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
