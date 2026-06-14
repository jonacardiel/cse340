# Unit 3 Study Notes

## Relational Databases vs Static Objects
Static arrays and plain objects feel easy at first, but they cause problems as an app grows. When everything lives in memory, the data disappears when the server restarts, and the app keeps using more memory as the list gets bigger. A relational database is better because it stores data on disk, keeps it organized with tables, and lets many requests read and write safely without rebuilding everything in JavaScript.

## DDL vs DML
DDL means Data Definition Language. These commands change the structure of the database, like `CREATE`, `ALTER`, `DROP`, and `TRUNCATE`. DML means Data Manipulation Language. These commands work with the actual data inside the tables, like `INSERT`, `SELECT`, `UPDATE`, and `DELETE`. I think of DDL as changing the shape of the house and DML as moving the furniture inside it.

## Pass By Value vs Pass By Reference
Primitive values like numbers, strings, and booleans are copied by value. That means if I assign one variable to another, I get a separate copy. Objects and arrays are different because they share a memory address, so two variables can point to the same data. That can cause mutation bugs if I change one variable and accidentally change the original too. A simple way to avoid that is using the spread operator, like `const copy = { ...original }` or `const arrCopy = [...originalArray]`, before editing the data.

## HTTP Methods & Web Sessions
HTTP is stateless, which means each request is separate and the server does not automatically remember the previous request. `GET` is safe and idempotent, so it should only read data and not change anything important. It also sends information in the URL, which is easy to bookmark but not good for secrets. `POST` is used for sending data in the request body, so it is better for forms and private information. Sessions help the server remember a logged-in user, but in-memory sessions disappear when the server restarts. A database-backed session store like `connect-pg-simple` keeps session data in PostgreSQL, so login state survives restarts and is more reliable.

## Validation Layers
Client-side validation is helpful because it gives the user quick feedback before the form is submitted. But it is only a convenience. It cannot be trusted for security because someone can bypass it with custom tools or by turning off JavaScript. Server-side validation is the real security gate. That is why `express-validator` is important. The server must always check the data again before saving it to the database.
