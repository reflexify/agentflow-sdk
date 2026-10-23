---
name: create-project
description: Tạo một dự án cùng các hạng mục và việc mẫu từ một mô tả, trên một thẻ xác nhận.
---

# Tạo một dự án

## Khi nào dùng

Khi một người mô tả một dự án muốn tạo: mục tiêu, các giai đoạn, những việc cần làm và hạn chót. Đặt cả dự án, các hạng mục và các việc lên một thẻ để người đó kiểm tra, sửa và xác nhận.

## Mẫu hệ thống

Khi một mẫu dưới đây hợp với mô tả, đề xuất các hạng mục của mẫu đó trước và nói tên mẫu trong câu trả lời. Người đó vẫn bỏ chọn hay sửa được từng hạng mục trên thẻ. Khi không mẫu nào hợp, tự đặt các hạng mục theo mô tả.

### Trống (`blank`)
- (không có hạng mục)

### Dự án phần mềm (`software`)
- Phân tích: Thu thập và làm rõ yêu cầu, phạm vi và tiêu chí nghiệm thu
- Thiết kế: Thiết kế giải pháp, giao diện và kiến trúc trước khi phát triển
- Phát triển: Xây dựng tính năng theo thiết kế đã thống nhất
- Kiểm thử: Chạy kịch bản kiểm thử, ghi nhận và xác nhận sửa lỗi trước khi bàn giao
- Triển khai: Đưa vào sử dụng, hướng dẫn người dùng và theo dõi sau triển khai

### Sự kiện / Ra mắt (`event`)
- Chuẩn bị: Lên kế hoạch, ngân sách, địa điểm và nhân sự
- Truyền thông: Nội dung, kênh truyền thông và lời mời
- Hậu cần: Thiết bị, vận chuyển, ăn uống và vận hành tại chỗ
- Tổng kết: Đánh giá kết quả, thanh toán và rút kinh nghiệm

### Theo thời gian (`by_time`)
- Tuần này: Việc cần xong trong tuần này
- Tuần sau: Việc dự kiến làm tuần sau
- Để sau: Việc chưa xếp lịch

### Theo mảng việc (`by_area`)
- Kinh doanh: Bán hàng, khách hàng và đối tác
- Kỹ thuật: Hệ thống, sản phẩm và hạ tầng
- Hành chính: Nhân sự, hợp đồng và thủ tục nội bộ

## Hạng mục và việc

- Một thẻ có tối đa 20 hạng mục, tên không trùng nhau, và tối đa 30 việc. Mô tả cần nhiều hơn thì đề xuất phần quan trọng nhất và nói phần còn lại thêm được sau.
- Tự viết các việc: một tiêu đề ngắn, hạng mục của việc, một checklist vài mục ngắn khi có ích (`[{"text": "…"}]`), và hạn chót khi mô tả cho biết.
- Ngày tương đối ("tuần sau", "thứ Sáu", "cuối tháng") đổi thành ngày `YYYY-MM-DD` tính từ hôm nay. Không bao giờ viết thứ trong tuần thay cho ngày.
- Mỗi việc đặt `origin` là `"assistant"`, để biết việc do trợ lý tạo.

## Người

- Không bao giờ đặt người chính mà người dùng không nêu tên. Mặc định người tạo giữ các việc mới, và thẻ đã nói điều đó.
- Chỉ gợi ý thành viên hay người quản lý trong số những người mà `search_records` trên thực thể người dùng tìm thấy. Không bao giờ bịa tên hay mã của một người.

## Thẻ

1. Gọi `get_entity_create_form` cho Dự án, Hạng mục và Task, và dùng đúng tên trường của từng biểu mẫu.
2. Gọi `propose_records_create` một lần, với các nhóm theo thứ tự Dự án, Hạng mục, Task. Dự án có ref `p`, các hạng mục `s1`, `s2`…, các việc `t1`, `t2`…. Hạng mục trỏ về dự án bằng `{"$ref": "p"}`; việc trỏ về dự án và hạng mục của nó, ví dụ `{"$ref": "p"}` và `{"$ref": "s1"}`.
3. Cả dự án nằm trên một thẻ: không bao giờ chia ra nhiều thẻ.
4. Không bao giờ nói dự án đã được tạo trước khi người đó bấm xác nhận. Nói ngắn gọn thẻ có gì và đã dùng mẫu nào.
