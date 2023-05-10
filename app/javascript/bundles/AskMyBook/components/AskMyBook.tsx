import React from "react";
import style from "./AskMyBook.module.css";
import {
  Link,
  Outlet,
  redirect,
  useLocation,
  useLoaderData,
} from "react-router-dom";
import ReactOnRails from "react-on-rails";
import {
  HomeIcon,
  UserMinusIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

export const homeLoader = async () => {
  const headers = ReactOnRails.authenticityHeaders({});
  const url = "/api/v1/me";
  const res = await fetch(url, {
    headers: headers,
    method: "GET",
  });
  if (res.ok) {
    return res;
  }
};

export const authLoader = async () => {
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
  }
};

const AskMyBook = () => {
  const { email } = useLoaderData() as { email: string };
  const location = useLocation();
  return (
    <div className={style.main}>
      <div className={style.icons}>
        {location.pathname.startsWith("/auth") ? (
          <Link to="/">
            <HomeIcon className={style.icon} />
          </Link>
        ) : !!email ? (
          <>
            <a href="/admin">
              <WrenchScrewdriverIcon className={style.icon} />
            </a>
            <Link to="/auth/logout">
              <UserMinusIcon className={style.icon} />
            </Link>
          </>
        ) : (
          <Link to="/auth/login">
            <UserPlusIcon className={style.icon} />
          </Link>
        )}
      </div>
      <div className={style.outlet}>
        <Outlet />
      </div>
    </div>
  );
};

export default AskMyBook;
