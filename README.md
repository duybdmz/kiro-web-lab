# kiro-web-lab

Một REST API đơn giản bằng Node.js để thử nghiệm với Kiro Web.

## Tính năng

- RESTful CRUD API cho quản lý task
- Kiểm tra đầu vào (Input validation)
- Hỗ trợ phân trang (Pagination)
- Ghi log request
- Cấu hình CORS
- Giới hạn tốc độ truy cập (100 requests mỗi 15 phút)
- Xử lý lỗi toàn cục
- Hỗ trợ Docker

## Bắt đầu

```bash
npm install
npm start
```

Server chạy tại `http://localhost:3000`

## Chạy Tests

```bash
npm test
```

## Docker

```bash
docker build -t kiro-web-lab .
docker run -p 3000:3000 kiro-web-lab
```

## API Endpoints

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| GET | `/` | Kiểm tra trạng thái server |
| GET | `/api/tasks` | Lấy danh sách task (có phân trang) |
| GET | `/api/tasks/:id` | Lấy chi tiết một task |
| POST | `/api/tasks` | Tạo task mới |
| PUT | `/api/tasks/:id` | Cập nhật task theo ID |
| DELETE | `/api/tasks/:id` | Xóa task theo ID |

### Phân trang

`GET /api/tasks` hỗ trợ các query parameters:
- `page` — Số trang (mặc định: 1)
- `limit` — Số item mỗi trang (mặc định: 10, tối đa: 100)

Ví dụ: `GET /api/tasks?page=2&limit=5`

Kết quả trả về:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 12,
    "totalPages": 3
  }
}
```

### Kiểm tra đầu vào

- `title` là bắt buộc, phải là chuỗi không rỗng (tối đa 200 ký tự)
- `completed` phải là boolean nếu được cung cấp

### Phản hồi lỗi

Tất cả lỗi đều trả về dạng JSON:
```json
{ "error": "mô tả lỗi" }
```

## Biến môi trường

| Biến | Mặc định | Mô tả |
|------|----------|--------|
| `PORT` | `3000` | Port của server |
| `NODE_ENV` | — | Đặt `production` để ẩn chi tiết lỗi |
| `CORS_ORIGIN` | `*` | Nguồn gốc CORS được phép |

## Công nghệ sử dụng

- **Node.js** — Runtime JavaScript
- **Express** — Framework web
- **cors** — Xử lý Cross-Origin Resource Sharing
- **express-rate-limit** — Giới hạn tốc độ truy cập
- **Jest + Supertest** — Testing

## Ví dụ sử dụng

### Kiểm tra server

```bash
curl http://localhost:3000/
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

## License

MIT
