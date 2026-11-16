# Assignment 8 - Study Programme Information Server

A small Node.js and Express 5 server for a made-up study programme. It has several routes (text, JSON, errors, redirect), a front-end page served by the same server, a request logger and a request counter. All data is hard-coded in `server.js`.

## How to install and run

Node.js 20.11 or newer is needed (the code uses `import.meta.dirname`). I tested it with Node.js v26.3.0.

```bash
git clone https://github.com/Yokatali/Web-Lab8.git
cd Web-Lab8
npm install
npm start
```

For development with automatic restart (built into Node, no extra package):

```bash
npm run dev
```

The server prints its address when it starts: `Server is running at http://localhost:3000`. The port comes from `process.env.PORT` and falls back to `3000`, for example `PORT=4000 npm start`.

## File organization

```
assignment8
 ├─ public/
 │   ├─ index.html   page with one button per API route
 │   ├─ styles.css   styles of the page
 │   └─ app.js       fetch calls and output of the page
 ├─ server.js        Express app, middleware, routes, 404 fallback
 ├─ package.json
 ├─ package-lock.json
 ├─ .gitignore       node_modules/ and .env
 └─ README.md
```

## Routes

| Method and path | Response |
| --- | --- |
| `GET /` | `public/index.html` (served by `express.static`) |
| `GET /hello` | plain text `Hello from Yusuf's server` |
| `GET /robots.txt` | plain text file body |
| `GET /old-page` | redirect (302) to `/hello` |
| `GET /api/courses` | JSON array with 4 courses |
| `GET /api/status` | JSON with `status`, `nodeVersion`, `uptimeSeconds` |
| `GET /api/headers` | JSON with the `User-Agent` and `Accept` headers of the request |
| `POST /api/subscribe` | 201 and `{ "subscribed": true }` |
| `GET /api/admin` | 403 and `{ "error": "Forbidden" }` |
| `GET /api/stats` | JSON with `requestsServed` |
| anything else | 404 (JSON for `/api` paths, HTML message for other paths) |

## Middleware

There are two middleware functions in `server.js`, both registered before `express.static` and all routes:

- **Request logger:** prints one line with the timestamp, the method and the URL, then calls `next()`.
- **Request counter:** adds 1 to `requestsServed`, then calls `next()`. The value is shown by `GET /api/stats`.

**Order.** Express runs middleware in the order it is registered. The logger is first so every request is logged, even if a later handler answers it. The counter is second. Both are before `express.static` and the routes, so no request can skip them. The 404 fallback is the last one, so it only gets requests that no route matched and never hides a real route.

**Which requests are counted.** Every request that reaches the server is counted: the page itself, `styles.css`, `app.js`, `favicon.ico`, redirects, 404 responses and also the request to `/api/stats` itself (it is counted before the response is created). I did it like this because the counter is registered before the static files and the routes, so it sees everything. The counter starts at 0 when the server starts and is not saved anywhere.

## Testing with curl

I tested the routes with `curl -i` (`-i` is the short form of `--include`, it prints the status line and the headers). Here are 7 of them.

**Successful JSON (`GET /api/courses`)**

```
$ curl -i localhost:3000/api/courses
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 192
ETag: W/"c0-4/pZYctSQueZFPQ0ZbADpJZjYx8"
Date: Mon, 16 Nov 2026 18:18:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Web Programming","credits":6},{"id":2,"title":"Operating Systems","credits":6},{"id":3,"title":"Data Structures","credits":5},{"id":4,"title":"Database Systems","credits":5}]
```

**201 Created (`POST /api/subscribe`)**

```
$ curl -i -X POST localhost:3000/api/subscribe
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Mon, 16 Nov 2026 18:27:52 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

**403 Forbidden (`GET /api/admin`)**

```
$ curl -i localhost:3000/api/admin
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Mon, 16 Nov 2026 18:27:52 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

**Redirect (`GET /old-page`)**

```
$ curl -i localhost:3000/old-page
HTTP/1.1 302 Found
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 28
Date: Mon, 16 Nov 2026 18:15:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Found. Redirecting to /hello
```

**404 on an `/api` path (`GET /api/nope`)**

```
$ curl -i localhost:3000/api/nope
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Mon, 16 Nov 2026 18:51:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

**404 on a non-API path (`GET /abc`)**

```
$ curl -i localhost:3000/abc
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 50
ETag: W/"32-59nXlt0eSCu7kE4qb0y/wa/q+1k"
Date: Mon, 16 Nov 2026 18:51:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<h1>404</h1><p>Sorry, this page was not found.</p>
```

**Plain text content type (`GET /robots.txt`)**

```
$ curl -i localhost:3000/robots.txt
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 30
ETag: W/"1e-fz6IoKfWOEcSop5pxzp50fKiI7Q"
Date: Mon, 16 Nov 2026 18:15:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

User-agent: *
Disallow: /api/
```

## Reasoning questions

**1. Route order.** I moved the 404 fallback above the logger and the routes. Then every request got a 404: the page `/` did not open, `/hello` was 404 and the API routes returned the JSON 404. The terminal also printed no log lines. Express checks middleware and routes in the order they are written, and the fallback matches every request and sends a response, so nothing below it is reached. This is why the fallback must be the last one.

**2. Middleware.** I removed `next()` from the logger. The browser kept loading the page and never got a response, and the terminal printed only the log line of the first request. The logger never passed control to the next middleware, so the counter, the static files and the routes were never reached, and the request stayed open.

**3. Status codes.** `POST /api/subscribe` answers `201` because a new subscription is created, and `201 Created` tells the client that exactly. `200` only says that the request was fine. A missing page is a `404` because the status code is what browsers, `fetch` and other tools read first. A `200` with an error text would look like a success, so `response.ok` would be true even though the page does not exist.

**4. Configuration.** The port is read from `process.env.PORT` because the port can be different on every computer or hosting service, and the server must not need a code change for that. The fallback `3000` makes it work locally without any setup. It also helps when port 3000 is already used, because I can start the server with another port.

**5. Dependencies.** `node_modules` is not committed because it is very big and can be created again from `package.json` and `package-lock.json`. A teammate must clone the repository, go into the folder and run `npm install`, then start the server with `npm start` or `npm run dev`.

**6. Same origin.** If the page is opened directly from disk (`file://`), a relative URL like `/api/courses` points to a file path on the computer and not to the server, so the request fails. Even with a full URL like `http://localhost:3000/api/courses`, the browser blocks the response because the page and the server have different origins. This restriction is called the same-origin policy (blocked by CORS). Because the server serves the page itself, the page and the API have the same origin and relative URLs work.

## Self-study notes

- **Node version and running time.** I read the Node documentation for the `process` object. `process.version` gives the Node version (for example `v26.3.0`) and `process.uptime()` gives how many seconds the process has been running. It returns decimals, so I used `Math.floor` to get whole seconds. Both values are real, they are not hard-coded.
- **Plain-text content type.** `res.send` with a string sends `text/html` by default. In the Express documentation I found `res.type('text/plain')`, which sets the `Content-Type` header. I use it for `/hello` and `/robots.txt`, and the curl output shows `text/plain; charset=utf-8`.
- **Neat JSON in the page.** In `app.js` I use `JSON.stringify(JSON.parse(text), null, 2)`. The third argument `2` makes the output indented with 2 spaces. If the body is not JSON (like the HTML 404), the `try/catch` shows the raw text.
- **Folder of the server.** I used `import.meta.dirname` with `path.join` for the `public` folder, so the server works no matter which folder it is started from. I tested it by running `node assignment8/server.js` from the parent folder.

## Challenges

- Express 5 does not accept `app.get('*', ...)`, so I wrote the 404 fallback with `app.use` at the end of the file.
- I did not know that `res.send` sends HTML by default, so I had to find out how to send plain text with the right content type.
- I had to decide what the counter should count. I placed it before the static files, so it counts everything, and I documented this above.
- Making the server work from any folder needed `import.meta.dirname` instead of a relative path.