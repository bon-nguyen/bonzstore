[.agents](directory;file:///c%3A/Users/Admin/Desktop/bonzstore/.agents) 
export const suggestPrices = (value: number | number[]): number[] => {
    const steps = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];
    const suggestions = new Set<number>();

    // Handle array input
    let values: number[];
    let baseValue: number;
    value = Array.isArray(value)
        ? value.filter((v) => typeof v === 'number' && v > 0)
        : value;

    if (Array.isArray(value)) {
        values = value;
        if (value.length > 1) {
            // Nếu mảng có nhiều giá trị, sử dụng giá trị lớn nhất làm cơ sở cho các gợi ý
            baseValue = Math.max(...value);
        } else {
            // Nếu mảng có một giá trị, sử dụng giá trị đó làm cơ sở cho các gợi ý
            baseValue = value[0];
        }
        // Thêm tất cả các giá trị gốc vào các gợi ý
        value.forEach((v) => suggestions.add(v));
    } else {
        // Xử lý số đơn lẻ
        values = [value];
        baseValue = value;
        suggestions.add(value);
    }

    // Tạo các gợi ý dựa trên baseValue
    for (let step of steps) {
        let nextValue = Math.ceil(baseValue / step) * step;
        suggestions.add(nextValue);
    }

    return Array.from(suggestions).sort((a: number, b: number) => a - b);
};

Tiền thực trả nhà cung cấp:
Dùng hàm suggestPrices để hiển thị danh sách lựa chọn 

Tỷ giá Giá vốn (1 ¥ Tệ → VNĐ)
Xóa những thông tin này ở header 
Tỷ giá Giá vốn (1 ¥ Tệ → VNĐ)
3.700
3.700
3.750
3.790
3.850
₫/¥
Nhập giá vốn bằng Tệ (¥) ở bảng dưới sẽ tự nhân tỷ giá sang VNĐ

Nhập Giá vốn (Giá Tệ ¥ đổi sang Tiền Việt VNĐ)

Xóa 
Lập phiếu nhập hàng
Lịch sử nhập hàng (3)
Lưu tạm (1)
Để người dùng tự thao tác ở sidebar 


Ở 
http://localhost:5173/imports/history 
cũng xóa 
Lập phiếu nhập hàng
Lịch sử nhập hàng (3)
Lưu tạm (1)

Search có debounce call api 
có skeleton cho mỗi vị trí phù hợp 

Bổ xung thêm bộ lọc là drawer lấy từ cho lịch sử nhập hàng 
Những cột  tổng cũng đi theo móc thời gian được filter