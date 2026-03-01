# Capstone2

## APIs liên quan tới người dùng

Các route nằm trong `BE/src/routes/user.js` với tiền tố `/users`.

- `POST /users/send-verify-code` : gửi mã OTP email để đăng ký.
- `POST /users/register` : đăng ký tài khoản (cần username, password, email, verify_code,..).
- `POST /users/login` : đăng nhập.
- `GET /users` : lấy danh sách người dùng (cần token).
- `GET /users/me` : lấy thông tin user hiện tại.
- `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id` : CRUD user (token, admin).

### Quên mật khẩu

- `POST /users/send-reset-code` : gửi mã OTP tới email (validate email). Mã này sẽ chỉ dùng cho việc đặt lại mật khẩu.
- `POST /users/reset-password` : đặt lại mật khẩu bằng email + mã + mật khẩu mới. Ngoài ra check password đủ mạnh.

Mã OTP lưu tạm trong bộ nhớ (`verifyCodes`), có hiệu lực 5 phút. Sau khi dùng sẽ bị xóa.