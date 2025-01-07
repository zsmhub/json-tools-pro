/**
 * @author AI
 * @description JSON格式化工具类，提供格式化、压缩、高亮等功能
 * @class JSONFormatter
 * @methods
 *  - format: 格式化JSON
 *  - compress: 压缩JSON
 *  - applyHighlight: 应用语法高亮
 *  - applyCompressedHighlight: 应用压缩后的高亮
 */

class JSONFormatter {
  // 检查 highlight.js 是否已加载
  static checkHighlight() {
    if (typeof hljs === 'undefined') {
      console.error('highlight.js not loaded!');
      return false;
    }
    return true;
  }

  /**
   * 格式化JSON字符串
   * @param {string} jsonStr - 要格式化的JSON字符串
   * @returns {string} 格式化后的JSON字符串
   */
  static format(jsonStr) {
    if (!jsonStr.trim()) {
      return '';
    }

    try {
      const obj = JSON.parse(jsonStr);
      return JSON.stringify(obj, null, 2)
        // 在冒号后添加空格
        .replace(/": /g, '": ')
        // 确保花括号独占一行
        .replace(/^{$/gm, '{\n')
        .replace(/^}$/gm, '\n}')
        // 确保方括号独占一行
        .replace(/^[[]$/gm, '[\n')
        .replace(/^]$/gm, '\n]')
        // 移除多余的空行
        .replace(/\n\s*\n/g, '\n');
    } catch (e) {
      console.error('Format failed:', e);
      return jsonStr;
    }
  }

  /**
   * 压缩JSON字符串
   * @param {string} jsonStr - 要压缩的JSON字符串
   * @returns {string} 压缩后的JSON字符串
   */
  static compress(jsonStr) {
    if (!jsonStr.trim()) {
      return '';
    }
    try {
      // 移除折叠按钮符号
      const cleanText = jsonStr.replace(/[▼▶]/g, '').trim();
      const obj = JSON.parse(cleanText);
      return JSON.stringify(obj);
    } catch (e) {
      console.error('Compression failed:', e);
      return jsonStr;
    }
  }

  /**
   * 应用语法高亮
   * @param {HTMLElement} input - 要应用高亮的DOM元素
   */
  static applyHighlight(input) {
    if (!this.checkHighlight()) return;

    const text = input.textContent.trim();
    if (!text) {
      input.innerHTML = '';
      return;
    }

    try {
      const formatted = this.format(text);
      const code = document.createElement('code');
      code.className = 'hljs language-json';
      code.textContent = formatted;
      hljs.highlightElement(code);
      input.innerHTML = code.innerHTML;
      input.classList.add('valid-json');
      input.classList.remove('invalid-json');
    } catch (e) {
      console.error('Highlight failed:', e);
      input.classList.add('invalid-json');
      input.classList.remove('valid-json');
    }
  }

  /**
   * 应用压缩后的高亮
   * @param {HTMLElement} input - 要应用高亮的DOM元素
   */
  static applyCompressedHighlight(input) {
    if (!this.checkHighlight()) return;

    const text = input.textContent.replace(/[▼▶]/g, '').trim();
    if (!text) {
      input.innerHTML = '';
      return;
    }

    try {
      const compressed = this.compress(text);
      const code = document.createElement('code');
      code.className = 'hljs language-json';
      code.textContent = compressed;
      hljs.highlightElement(code);
      input.innerHTML = code.innerHTML;
      input.classList.add('valid-json');
      input.classList.remove('invalid-json');
    } catch (e) {
      console.error('Compressed highlight failed:', e);
      input.classList.add('invalid-json');
      input.classList.remove('valid-json');
    }
  }
}

// 导出 JSONFormatter 类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { JSONFormatter };
} else {
  // 在浏览器环境中，将 JSONFormatter 添加到全局作用域
  window.JSONFormatter = JSONFormatter;
}