document.getElementById('open-chatgpt').addEventListener('click', () => {
  chrome.tabs.query({ url: "*://chatgpt.com/*" }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      chrome.tabs.create({ url: "https://chatgpt.com/" });
    }
  });
});
