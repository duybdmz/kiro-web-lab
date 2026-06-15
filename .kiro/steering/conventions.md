# Quy uoc du an - kiro-web-lab

## Tong quan

Day la mot REST API don gian su dung Node.js va Express.js de quan ly task (cong viec). Du lieu duoc luu tru trong bo nho (in-memory), khong su dung database.

## Kien truc

- **Kieu du an:** Node.js REST API
- **Framework:** Express 4.21
- **Luu tru du lieu:** In-memory (mang JavaScript)
- **Entry point:** `src/index.js`
- **Port mac dinh:** 3000 (co the thay doi qua bien moi truong `PORT`)

## Cau truc thu muc

```
kiro-web-lab/
├── .kiro/steering/    # Cac file huong dan cho Kiro
├── src/
│   └── index.js       # File chinh chua toan bo logic API
├── package.json       # Cau hinh du an va dependencies
├── package-lock.json  # Lock file cho npm
└── README.md          # Tai lieu du an
```

## Quy uoc viet code

### Phong cach chung

- Su dung `const` cho cac bien khong thay doi, `let` cho cac bien co the thay doi
- Su dung arrow function cho callback
- Su dung destructuring khi lay du lieu tu request body: `const { title } = req.body`
- Indent bang 2 spaces
- Su dung single quotes cho string
- Ket thuc dong bang dau cham phay (semicolons)

### Quy uoc dat ten

- Bien va ham: camelCase (vi du: `nextId`, `findTask`)
- Route paths: lowercase voi dau gach ngang neu can (vi du: `/api/tasks`)
- File: lowercase (vi du: `index.js`)

### Xu ly loi

- Tra ve HTTP status code phu hop:
  - `200` - Thanh cong
  - `201` - Tao moi thanh cong
  - `204` - Xoa thanh cong (khong co noi dung tra ve)
  - `400` - Loi du lieu dau vao
  - `404` - Khong tim thay tai nguyen
- Tra ve loi duoi dang JSON voi truong `error`: `{ "error": "mo ta loi" }`

### API Design

- RESTful routing: su dung HTTP methods dung muc dich (GET, POST, PUT, DELETE)
- Prefix `/api/` cho cac endpoint API
- Tra ve JSON cho moi response
- Validate du lieu dau vao truoc khi xu ly

## Cach chay du an

### Cai dat

```bash
npm install
```

### Chay server (production)

```bash
npm start
```

### Chay server (development voi auto-reload)

```bash
npm run dev
```

Server se chay tai `http://localhost:3000`

## API Endpoints

| Method | Path | Mo ta |
|--------|------|-------|
| GET | `/` | Kiem tra server hoat dong |
| GET | `/api/tasks` | Lay danh sach tat ca task |
| POST | `/api/tasks` | Tao task moi (can truong `title` trong body) |
| PUT | `/api/tasks/:id` | Cap nhat task (co the cap nhat `title` va/hoac `completed`) |
| DELETE | `/api/tasks/:id` | Xoa task theo id |

## Luu y khi phat trien

- Du an hien tai chua co test framework. Khi them test, nen su dung Jest hoac Mocha.
- Du an chua co linter. Khi them, nen su dung ESLint voi cau hinh phu hop cho Node.js.
- Du lieu se mat khi restart server vi su dung in-memory store. Neu can persistence, co the tich hop SQLite hoac MongoDB.
- Khong co authentication/authorization. Neu can, nen su dung JWT hoac session-based auth.

## Git workflow

- Commit message bat dau bang type prefix: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Moi commit nen tap trung vao mot thay doi cu the
- Branch naming: `feature/ten-tinh-nang`, `fix/ten-loi`, `chore/ten-cong-viec`
