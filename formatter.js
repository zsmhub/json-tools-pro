// JSON 格式化工具类
class JSONFormatter {
  // 检查 highlight.js 是否已加载
  static checkHighlight() {
    if (typeof hljs === 'undefined') {
      console.error('highlight.js not loaded!');
      return false;
    }
    return true;
  }

  // 格式化 JSON
  static format(json) {
    if (!json.trim()) {
      return '';
    }
    try {
      const obj = JSON.parse(json);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return json;
    }
  }

  // 压缩 JSON
  static compress(json) {
    if (!json.trim()) {
      return '';
    }
    try {
      const obj = JSON.parse(json);
      return JSON.stringify(obj);
    } catch (e) {
      return json;
    }
  }

  // 应用高亮
  static applyHighlight(input) {
    if (!this.checkHighlight()) return;

    const text = input.textContent;
    if (!text.trim()) {
      input.textContent = '';
      return;
    }

    // 创建一个临时的 pre 和 code 元素来应用高亮
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'hljs language-json';
    code.textContent = text;
    pre.appendChild(code);

    // 应用 highlight.js
    hljs.highlightElement(code);

    try {
      JSON.parse(text);
      input.classList.add('valid-json');
      input.classList.remove('invalid-json');
    } catch (e) {
      input.classList.add('invalid-json');
      input.classList.remove('valid-json');
    }

    input.innerHTML = code.innerHTML;
  }

  // 格式化并高亮预览
  static formatPreview(text, preview) {
    if (!this.checkHighlight()) return;

    if (!text.trim()) {
      preview.innerHTML = '';
      preview.parentElement.classList.remove('valid-json', 'invalid-json');
      return;
    }

    try {
      const obj = JSON.parse(text);
      const formatted = JSON.stringify(obj, null, 2);

      // 创建一个临时的 code 元素来应用高亮
      const code = document.createElement('code');
      code.className = 'hljs language-json';
      code.textContent = formatted;

      // 应用高亮
      hljs.highlightElement(code);

      // 更新预览
      preview.innerHTML = code.innerHTML;
      preview.parentElement.classList.add('valid-json');
      preview.parentElement.classList.remove('invalid-json');
    } catch (e) {
      preview.textContent = '无效的 JSON';
      preview.parentElement.classList.add('invalid-json');
      preview.parentElement.classList.remove('valid-json');
    }
  }
}

// 等待 DOM 和 highlight.js 加载完成
document.addEventListener('DOMContentLoaded', () => {
  if (typeof hljs !== 'undefined') {
    // 初始化 highlight.js
    hljs.configure({
      languages: ['json']
    });
  }
});