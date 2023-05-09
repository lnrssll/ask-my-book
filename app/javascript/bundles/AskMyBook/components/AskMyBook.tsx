import React from "react";
import style from "./AskMyBook.module.css";
import { Outlet, redirect } from "react-router-dom";
import ReactOnRails from "react-on-rails";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";

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
  return (
    <div className={style.main}>
      <a href="/admin">
        <WrenchScrewdriverIcon className={style.icon} />
      </a>
      <Outlet />
    </div>
  );
};

export default AskMyBook;
