CREATE DATABASE grafanadstest;
REVOKE CONNECT ON DATABASE grafanadstest FROM PUBLIC;
GRANT CONNECT ON DATABASE grafanadstest TO grafanatest;