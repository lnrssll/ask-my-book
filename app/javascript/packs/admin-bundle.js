import ReactOnRails from "react-on-rails";

import App from "../bundles/Admin/components/App";
import "../stylesheets/Admin.css";

// This is how react_on_rails can see the Admin in the browser.
ReactOnRails.register({
  App,
});
