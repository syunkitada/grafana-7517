import { react2AngularDirective } from "app/core/utils/react2angular";
import { PasswordStrength } from "./components/PasswordStrength";
import PageHeader from "./components/PageHeader/PageHeader";
import EmptyListCTA from "./components/EmptyListCTA/EmptyListCTA";
import LoginBackground from "./components/Login/LoginBackground";
import { SearchResult } from "./components/search/SearchResult";
import UserPicker from "./components/UserPicker/UserPicker";

export function registerAngularDirectives() {
  react2AngularDirective("passwordStrength", PasswordStrength, ["password"]);
  react2AngularDirective("pageHeader", PageHeader, ["model", "noTabs"]);
  react2AngularDirective("emptyListCta", EmptyListCTA, ["model"]);
  react2AngularDirective("loginBackground", LoginBackground, []);
  react2AngularDirective("searchResult", SearchResult, []);
  react2AngularDirective("userPickerr", UserPicker, [
    "backendSrv",
    "teamId",
    "refreshList"
  ]);
}
