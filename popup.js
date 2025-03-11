document.getElementById("saveKey").addEventListener("click", function() {
    const apiKey = document.getElementById("apiKey").value;
    if (apiKey) {
      chrome.storage.sync.set({ geminiApiKey: apiKey }, function() {
        alert("API Key saved!");
        document.getElementById("apiKey").value = ""; // Xóa input sau khi lưu
      });
    }
  });
  
  // Hiển thị API key đã lưu (nếu có) khi mở popup
  chrome.storage.sync.get(["geminiApiKey"], function(result) {
    if (result.geminiApiKey) {
      document.getElementById("apiKey").value = result.geminiApiKey;
    }
  });