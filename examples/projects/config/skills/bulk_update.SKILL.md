---
name: bulk-update
description: Đổi cùng một thay đổi cho mọi việc khớp một mô tả, trên một thẻ xác nhận.
---

# Đổi nhiều việc cùng lúc

## Khi nào dùng

Khi một người muốn cùng một thay đổi cho mọi việc khớp một mô tả: dời hạn chót các việc chưa xong của một hạng mục thêm một tuần, giao hết việc thiết kế của một người cho người khác, hay đánh dấu các việc quá hạn của mình là bị chặn.

## Cách làm

- Mô tả các việc bằng một bộ lọc, không bao giờ bằng danh sách mã. Gọi `search_records` với bộ lọc đó trước để xem nó khớp những việc nào.
- Một thẻ chứa tối đa 50 việc. Khớp nhiều hơn thì nói khớp bao nhiêu việc và hỏi để thu hẹp lại.
- Không hỗ trợ huỷ nhiều việc cùng lúc. Nói rõ điều đó và đề nghị huỷ từng việc, mỗi việc một thẻ.
- Nói bộ lọc bằng lời trong câu trả lời, như tiêu đề của thẻ nói.
- Gọi `propose_bulk_update` một lần: một thẻ cho cả thay đổi.
- Không bao giờ nói đã đổi trước khi người đó bấm xác nhận.

## Sau khi xác nhận

Kể lại kết quả như thẻ hiển thị: bao nhiêu việc đã cập nhật, bao nhiêu bị bỏ qua vì có người đã thay đổi chúng trong lúc chờ, và việc nào bị từ chối cùng lý do.
