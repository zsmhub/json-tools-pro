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
      return this.prettyPrint(obj);
    } catch (e) {
      return json;
    }
  }

  // 自定义格式化函数
  static prettyPrint(obj, level = 0) {
    const indent = '  '.repeat(level);

    if (obj === null) return 'null';
    if (typeof obj !== 'object') {
      if (typeof obj === 'string') return `"${obj}"`;
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';

      const lines = [];
      obj.forEach((item, i) => {
        const formatted = this.prettyPrint(item, level + 1);
        if (i === obj.length - 1) {
          // 最后一个元素，不加逗号，闭合括号放在同一行
          lines.push(`${indent}  ${formatted}]`);
        } else {
          lines.push(`${indent}  ${formatted},`);
        }
      });

      return `[\n${lines.join('\n')}`;
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';

    const lines = [];
    let lastLine = '';

    keys.forEach((key, i) => {
      const formatted = this.prettyPrint(obj[key], level + 1);
      if (i === keys.length - 1) {
        // 最后一个属性，不加逗号，闭合括号放在同一行
        lastLine = `${indent}  "${key}": ${formatted}}`;
      } else {
        lines.push(`${indent}  "${key}": ${formatted},`);
      }
    });

    return `{\n${lines.join('\n')}${lastLine ? '\n' + lastLine : ''}`;
  }

  // 压缩 JSON
  static compress(json) {
    if (!json.trim()) {
      return '';
    }
    try {
      // 移除折叠按钮符号
      const cleanText = json.replace(/[▼▶]/g, '').trim();
      const obj = JSON.parse(cleanText);
      const compressed = JSON.stringify(obj);
      return compressed;
    } catch (e) {
      console.error('Compression failed:', e);
      return json;
    }
  }

  // 应用压缩后的高亮
  static applyCompressedHighlight(input) {
    if (!this.checkHighlight()) return;

    const text = input.textContent.replace(/[▼▶]/g, '').trim();
    if (!text) {
      input.textContent = '';
      return;
    }

    try {
      const obj = JSON.parse(text);
      const compressed = JSON.stringify(obj);

      // 创建临时元素来应用高亮
      const code = document.createElement('code');
      code.className = 'hljs language-json';
      code.textContent = compressed;
      hljs.highlightElement(code);

      // 更新内容
      input.innerHTML = code.innerHTML;
      input.classList.add('valid-json');
      input.classList.remove('invalid-json');
    } catch (e) {
      console.error('Compression highlight failed:', e);
      input.classList.add('invalid-json');
      input.classList.remove('valid-json');
    }
  }

  // 创建折叠按钮
  static createFoldButton() {
    const button = document.createElement('span');
    button.className = 'fold-button';
    button.innerHTML = '▼';
    return button;
  }

  // 处理折叠逻辑
  static handleFold(block) {
    block.classList.toggle('folded');
  }

  // 应用高亮和折叠功能
  static applyHighlight(input) {
    if (!this.checkHighlight()) return;

    const text = input.textContent.replace(/[▼▶]/g, '').trim(); // 移除所有已存在的折叠按钮符号
    if (!text) {
      input.textContent = '';
      return;
    }

    try {
      // 先格式化
      const formatted = this.format(text);

      // 处理每一行，添加折叠功能和高亮
      const lines = formatted.split('\n');
      let html = '';
      let inString = false;
      let bracketCount = 0;
      let indentLevel = 0;
      let inKey = false;

      // 完全清空内容，包括所有的 HTML
      input.innerHTML = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimRight();
        if (!line) continue;

        let processed = '';
        let lineContent = line.trimLeft();
        let indentSpaces = line.length - lineContent.length;

        // 处理缩进
        processed += ' '.repeat(indentSpaces);

        // 处理每个字符
        for (let j = 0; j < lineContent.length; j++) {
          const char = lineContent[j];
          const nextChar = lineContent[j + 1];

          // 处理字符串
          if (char === '"' && lineContent[j-1] !== '\\') {
            if (!inString && nextChar === ':') {
              inKey = true;
              processed += `<span class="hljs-attr">"`;
            } else {
              inKey = false;
              processed += `<span class="hljs-string">"`;
            }
            inString = !inString;
            continue;
          }

          if (!inString) {
            // 处理对象和数组的开始
            if (char === '{' || char === '[') {
              bracketCount++;
              processed += `<div class="json-block" data-depth="${indentLevel}">`;
              processed += this.createFoldButton().outerHTML;
              processed += `<span class="hljs-punctuation">${char}</span>`;
              processed += '<div class="json-block-content">';
              indentLevel++;
              continue;
            }
            // 处理对象和数组的结束
            if (char === '}' || char === ']') {
              indentLevel--;
              processed += '</div>';
              processed += `<span class="hljs-punctuation">${char}</span>`;
              processed += '</div>';
              bracketCount--;
              continue;
            }
            // 处理冒号
            if (char === ':') {
              processed += `<span class="hljs-punctuation">:</span>`;
              continue;
            }
            // 处理逗号
            if (char === ',') {
              processed += `<span class="hljs-punctuation">,</span>`;
              continue;
            }
          } else if (char === '"') {
            processed += `"</span>`;
            continue;
          }

          // 处理数字
          if (!inString && /^-?\d/.test(lineContent.substr(j))) {
            let numStr = '';
            while (j < lineContent.length && /[\d.e+-]/i.test(lineContent[j])) {
              numStr += lineContent[j];
              j++;
            }
            j--;
            processed += `<span class="hljs-number">${numStr}</span>`;
            continue;
          }

          // 处理布尔值和 null
          if (!inString && (char === 't' || char === 'f' || char === 'n')) {
            const word = lineContent.substr(j, 5);
            if (word.startsWith('true')) {
              processed += `<span class="hljs-literal">true</span>`;
              j += 3;
              continue;
            }
            if (word.startsWith('false')) {
              processed += `<span class="hljs-literal">false</span>`;
              j += 4;
              continue;
            }
            if (word.startsWith('null')) {
              processed += `<span class="hljs-keyword">null</span>`;
              j += 3;
              continue;
            }
          }

          processed += char;
        }

        html += processed + '\n';
      }

      // 一次性更新内容
      input.innerHTML = html;

      // 直接添加事件监听器，不需要克隆和替换
      const foldButtons = input.getElementsByClassName('fold-button');
      Array.from(foldButtons).forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleFold(button.parentElement);
        });
      });

      input.classList.add('valid-json');
      input.classList.remove('invalid-json');

    } catch (e) {
      input.classList.add('invalid-json');
      input.classList.remove('valid-json');

      // 如果不是有效的JSON，只应用基本高亮
      const code = document.createElement('code');
      code.className = 'hljs language-json';
      code.textContent = text;
      hljs.highlightElement(code);
      input.innerHTML = code.innerHTML;
    }
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