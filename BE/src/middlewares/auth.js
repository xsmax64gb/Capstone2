import { jwtService } from "../config/jwt.js";

export const authMiddleware = {
  // Kiểm tra token hợp lệ
  verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

  //  console.log("Auth Header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không có token hoặc token không hợp lệ" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwtService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    req.user = decoded; // gán thông tin user vào req
    next();
  },

  // Kiểm tra quyền admin
  isAdmin(req, res, next) {
    console.log('User role in isAdmin middleware:', req.user);
    if (req.user.role_id !== "2") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
  },
};

export default authMiddleware;