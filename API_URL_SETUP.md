# Hướng dẫn Cập Nhật API URL cho Frontend

## ⚠️ Quan trọng: Thay đổi API URL trước khi chạy app!

File: `src/api/client.ts` (dòng 3)

### Hiện tại là:
```typescript
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

### Bạn cần thay thành IP của máy tính mình

---

## 🔍 Cách tìm IP của mình (Windows)

Mở PowerShell và chạy:
```powershell
ipconfig
```

Tìm dòng này trong output:
```
IPv4 Address. . . . . . . . . . : 192.168.1.XXX
```

Ví dụ:
- `192.168.1.50`
- `192.168.1.100`
- `10.0.0.15`

---

## 🔧 Cập nhật File

### Cách 1: Chỉnh sửa thủ công
1. Mở `src/api/client.ts`
2. Dòng 3, thay thế `192.168.1.100` bằng IP của bạn
3. Lưu file

### Ví dụ:
Nếu IP của bạn là `192.168.1.50`:
```typescript
const API_BASE_URL = 'http://192.168.1.50:5000/api';
```

Nếu IP của bạn là `10.0.0.100`:
```typescript
const API_BASE_URL = 'http://10.0.0.100:5000/api';
```

---

## 🚨 Đặc Biệt: Nếu chạy trên máy tính cùng với backend

Nếu máy tính cùng với backend:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

Nếu chạy trên emulator Android:
```typescript
const API_BASE_URL = 'http://10.0.2.2:5000/api';
```
(10.0.2.2 là cách Android alias localhost)

Nếu chạy trên thiết bị thực Android:
```typescript
const API_BASE_URL = 'http://192.168.1.50:5000/api';
// (thay 192.168.1.50 bằng IP máy tính chạy backend)
```

---

## ✅ Kiểm Tra Kết Nối

Mở PowerShell và chạy (thay IP):
```powershell
curl http://192.168.1.50:5000/api/health
```

Nếu thành công, bạn sẽ thấy response từ server.

---

## ⚡ Nhanh nhất: Script tự động cập nhật

Nếu bạn biết IP của mình, chạy lệnh này (thay IP):
```powershell
# Windows
(Get-Content src/api/client.ts) -replace '192\.168\.1\.\d+', '192.168.1.50' | Set-Content src/api/client.ts

# macOS/Linux
sed -i.bak 's/192\.168\.1\.\d\+/192.168.1.50/g' src/api/client.ts
```

---

## ❓ FAQ

**Q: Tôi không biết IP của mình?**
A: Chạy `ipconfig` trong PowerShell, tìm IPv4 Address

**Q: API URL nào nên dùng?**
A: 
- Máy tính cùng nhau: `http://[IP_MÁY]:5000/api`
- Emulator: `http://10.0.2.2:5000/api`
- Thiết bị thực: `http://[IP_MÁY]:5000/api`

**Q: Làm sao biết IP đúng?**
A: Test với curl trước:
```powershell
curl http://192.168.1.50:5000/api/health
# Hoặc
curl http://10.0.0.100:5000/api/health
```

Nếu thấy response, đó là IP đúng.

---

## ✨ Sau khi cập nhật

1. Cập nhật `src/api/client.ts`
2. Chạy `npm run android` hoặc `npm run ios`
3. Thử đăng ký account mới
4. Nếu thành công, API URL đúng ✓

Xong!
