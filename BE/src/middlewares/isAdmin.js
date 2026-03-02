export const isAdmin = (req, res, next) => {
  try {
    const user = req.user; // được gắn từ middleware auth.js

    // Nếu token có role_id = "2" hoặc role = "admin" thì OK
    if (!user || (user.role_id !== "2" && user.role !== "admin")) {
      return res.status(403).json({ message: "Chỉ quản trị viên mới được phép truy cập." });
    }

    next();
  } catch (error) {
    console.error("Middleware isAdmin error:", error);
    res.status(500).json({ message: "Lỗi xác thực quyền truy cập." });
  }
};
