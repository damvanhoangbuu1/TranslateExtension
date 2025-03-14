console.log("🔥 content.js đã được inject!");

document.addEventListener("keydown", function (event) {
  if (event.key === "Shift") {
    event.preventDefault(); // Ngăn hành vi mặc định của phím Tab
    const selection = window.getSelection();
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) return;

    console.log("✅ Văn bản được chọn:", selectedText);

    chrome.storage.sync.get("geminiApiKey", function (data) {
      if (!data.geminiApiKey) {
        alert("Vui lòng nhập API Key trong extension popup!");
        return;
      }
      translateWithGemini(selectedText, data.geminiApiKey, selection);
    });
  }
});

const createPrompt = (text) => {
  return `Cho bạn đoạn văn bản: "${text}".
               Hãy dịch đoạn văn bản đó thành Tiếng Việt (Vietnamese) với các điều kiện sau:
               - Tuân thủ chặt chẽ bối cảnh và sắc thái ban đầu.
               - Sự lưu loát tự nhiên như người bản xứ.
               - Không có thêm giải thích/diễn giải.
               - Bảo toàn thuật ngữ 1:1 cho các thuật ngữ/danh từ riêng.
               Chỉ in ra bản dịch mà không có dấu ngoặc kép.`;
}

const translateWithGemini = async (text, apiKey, selection) => {
  let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  let requestBody = {
    contents: [{ parts: [{ text: createPrompt(text) }] }]
  };

  // 🟢 Hiển thị popup "Đang dịch..."
  let popup = showPopup(selection, "Đang dịch...");

  try {
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    let result = await response.json();
    console.log("Kết quả API:", result);

    if (result && result.candidates && result.candidates.length > 0) {
      let translatedText = result.candidates[0].content.parts[0].text;
      popup.innerText = translatedText; // 🟢 Cập nhật popup với bản dịch
    } else {
      popup.innerText = "Lỗi: API không trả về kết quả hợp lệ.";
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    popup.innerText = "Lỗi khi gọi API: " + error.message;
  }
};

const showPopup = (selection, text) => {
  // Xóa popup cũ nếu có
  let existingPopup = document.getElementById("translatePopup");
  if (existingPopup) existingPopup.remove();

  // Lấy vị trí bôi đen
  let range = selection.getRangeAt(0);
  let rect = range.getBoundingClientRect();

  // Tạo popup
  let popup = document.createElement("div");
  popup.id = "translatePopup";
  popup.innerText = text;
  popup.style.position = "absolute";
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.bottom + window.scrollY + 5}px`; // Xuống dưới 5px
  popup.style.background = "black";
  popup.style.color = "white";
  popup.style.padding = "8px";
  popup.style.borderRadius = "5px";
  popup.style.fontSize = "14px";
  popup.style.zIndex = "99999";
  popup.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";
  popup.style.maxWidth = "600px";
  popup.style.maxHeight = "400px";
  popup.style.overflow = "auto";
  popup.style.wordWrap = "break-word";

  document.body.appendChild(popup);

  // Xóa popup khi click ra ngoài
  document.addEventListener("click", function removePopup(event) {
    if (!popup.contains(event.target)) {
      popup.remove();
      document.removeEventListener("click", removePopup);
    }
  });

  return popup; // 🔥 Trả về popup để cập nhật nội dung sau này
};