# kiro-web-lab

Một REST API đơn giản bằng Node.js để thử nghiệm với Kiro Web.

## Bắt đầu

```bash
npm install
npm start
```

Server chạy tại `http://localhost:3000`

### Chế độ phát triển

```bash
npm run dev
```

Server sẽ tự động reload khi có thay đổi code.

## API Endpoints

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| GET | `/` | Kiểm tra trạng thái server |
| GET | `/api/tasks` | Lấy danh sách tất cả task |
| POST | `/api/tasks` | Tạo task mới |
| PUT | `/api/tasks/:id` | Cập nhật task theo ID |
| DELETE | `/api/tasks/:id` | Xóa task theo ID |

## Ví dụ sử dụng

### Kiểm tra server

```bash
curl http://localhost:3000/
```

Kết quả:
```json
{ "status": "ok", "message": "kiro-web-lab is running" }
```

### Lấy danh sách task

```bash
curl http://localhost:3000/api/tasks
```

### Tạo task mới

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Task mới"}'
```

Kết quả:
```json
{ "id": 3, "title": "Task mới", "completed": false }
```

### Cập nhật task

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Xóa task

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

## Công nghệ sử dụng

- **Node.js** — Runtime JavaScript
- **Express** — Framework web

## Cấu trúc dự án

```
kiro-web-lab/
├── src/
│   └── index.js       # Entry point, định nghĩa routes
├── package.json       # Dependencies và scripts
├── package-lock.json
├── .gitignore
└── README.md
```

## Ghi chú

- Dữ liệu task được lưu trong bộ nhớ (in-memory), sẽ mất khi restart server.
- Dự án này là backend API thuần túy, chưa có giao diện frontend.
- Port mặc định là `3000`, có thể thay đổi qua biến môi trường `PORT`.

## License

MIT
