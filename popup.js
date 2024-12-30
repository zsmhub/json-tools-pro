const MAX_HISTORY_LENGTH = 10;
let undoHistoryLeft = [];
let undoHistoryRight = [];
let currentHistoryIndexLeft = -1;
let currentHistoryIndexRight = -1;

document.addEventListener('DOMContentLoaded', function() {
  // 确保 JSONFormatter 对象存在
  if (typeof JSONFormatter === 'undefined') {
    console.error('JSONFormatter not loaded');
    return;
  }

  // 获取左侧面板元素
  const jsonInputLeft = document.querySelector('.json-panel:first-child .json-input');
  const formatBtnLeft = document.getElementById('formatLeft');
  const compressBtnLeft = document.getElementById('compressLeft');

  // 获取右侧面板元素
  const jsonInputRight = document.querySelector('.json-panel:last-child .json-input');
  const formatBtnRight = document.getElementById('formatRight');
  const compressBtnRight = document.getElementById('compressRight');

  // 获取方向按钮
  const copyToRightBtn = document.getElementById('copyToRight');
  const copyToLeftBtn = document.getElementById('copyToLeft');

  // 创建面板控制器
  function createPanelController(input, formatBtn, compressBtn) {
    // 确保输入元素存在
    if (!input) {
      console.error('Input element not found');
      return;
    }

    // 初始化高亮
    try {
      JSONFormatter.applyHighlight(input);
    } catch (e) {
      console.error('Error applying highlight:', e);
    }

    // 格式化函数
    const formatJSON = (text) => {
      try {
        const obj = JSON.parse(text);
        const formatted = JSONFormatter.format(JSON.stringify(obj));
        input.textContent = formatted;
        JSONFormatter.applyHighlight(input);
      } catch (e) {
        // 如果不是有效的 JSON，保持原样
        input.textContent = text;
        JSONFormatter.applyHighlight(input);
      }
    };

    // 输入事件
    input.addEventListener('input', () => {
      // 保存当前的选择范围和文本内容
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const startOffset = range.startOffset;
      const originalText = input.textContent;
      const cursorPosition = getCursorPosition(input);

      // 始终进行格式化
      formatJSON(originalText);

      // 恢复光标位置
      requestAnimationFrame(() => {
        try {
          // 设置光标位置
          setCursorPosition(input, cursorPosition);
        } catch (e) {
          console.error('Error restoring cursor position:', e);
        }
      });
    });

    // 格式化按钮点击事件
    formatBtn.addEventListener('click', () => {
      formatJSON(input.textContent);
    });

    // 压缩按钮点击事件
    compressBtn.addEventListener('click', () => {
      try {
        const compressed = JSONFormatter.compress(input.textContent);
        input.textContent = compressed;
        JSONFormatter.applyCompressedHighlight(input);
      } catch (e) {
        console.error('Compression failed:', e);
      }
    });

    // 粘贴事件
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text');

      // 直接格式化粘贴的内容
      formatJSON(text);

      // 触发输入事件以更新状态
      input.dispatchEvent(new Event('input'));
    });
  }

  // 初始化两个面板
  if (jsonInputLeft && formatBtnLeft && compressBtnLeft) {
    createPanelController(
      jsonInputLeft,
      formatBtnLeft,
      compressBtnLeft
    );
  }

  if (jsonInputRight && formatBtnRight && compressBtnRight) {
    createPanelController(
      jsonInputRight,
      formatBtnRight,
      compressBtnRight
    );
  }

  // 方向复制按钮事件
  copyToRightBtn.addEventListener('click', () => {
    try {
      // 直接复制 HTML 内容
      jsonInputRight.innerHTML = jsonInputLeft.innerHTML;

      // 重新绑定折叠事件监听器
      const foldButtons = jsonInputRight.getElementsByClassName('fold-button');
      Array.from(foldButtons).forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          JSONFormatter.handleFold(button.parentElement);
        });
      });

      // 设置正确的类
      if (jsonInputLeft.classList.contains('valid-json')) {
        jsonInputRight.classList.add('valid-json');
        jsonInputRight.classList.remove('invalid-json');
      } else {
        jsonInputRight.classList.add('invalid-json');
        jsonInputRight.classList.remove('valid-json');
      }
    } catch (e) {
      console.error('Copy failed:', e);
    }
  });

  copyToLeftBtn.addEventListener('click', () => {
    try {
      // 直接复制 HTML 内容
      jsonInputLeft.innerHTML = jsonInputRight.innerHTML;

      // 重新绑定折叠事件监听器
      const foldButtons = jsonInputLeft.getElementsByClassName('fold-button');
      Array.from(foldButtons).forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          JSONFormatter.handleFold(button.parentElement);
        });
      });

      // 设置正确的类
      if (jsonInputRight.classList.contains('valid-json')) {
        jsonInputLeft.classList.add('valid-json');
        jsonInputLeft.classList.remove('invalid-json');
      } else {
        jsonInputLeft.classList.add('invalid-json');
        jsonInputLeft.classList.remove('valid-json');
      }
    } catch (e) {
      console.error('Copy failed:', e);
    }
  });

  // 获取光标位置
  function getCursorPosition(element) {
    const selection = window.getSelection();
    let position = 0;

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      position = preCaretRange.toString().length;
    }

    return position;
  }

  // 设置光标位置
  function setCursorPosition(element, position) {
    const range = document.createRange();
    const selection = window.getSelection();

    // 遍历文本节点找到正确的位置
    let currentPos = 0;
    let targetNode = null;
    let targetOffset = 0;

    function traverseNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const length = node.textContent.length;
        if (currentPos + length >= position) {
          targetNode = node;
          targetOffset = position - currentPos;
          return true;
        }
        currentPos += length;
      } else {
        const childNodes = Array.from(node.childNodes);
        for (const child of childNodes) {
          if (traverseNodes(child)) {
            return true;
          }
        }
      }
      return false;
    }

    traverseNodes(element);

    if (targetNode) {
      range.setStart(targetNode, targetOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      // 确定当前焦点在哪个面板
      const activeElement = document.activeElement;
      const leftPanel = document.querySelector('.json-panel:first-child .json-input');
      const rightPanel = document.querySelector('.json-panel:last-child .json-input');

      if (activeElement === leftPanel) {
        undo('left');
      } else if (activeElement === rightPanel) {
        undo('right');
      }
    }
  });

  // 添加撤销功能
  function undo(panel) {
    const history = panel === 'left' ? undoHistoryLeft : undoHistoryRight;
    const historyIndex = panel === 'left' ? currentHistoryIndexLeft : currentHistoryIndexRight;
    const input = panel === 'left' ?
        document.querySelector('.json-panel:first-child .json-input') :
        document.querySelector('.json-panel:last-child .json-input');

    if (historyIndex > 0) {
        if (panel === 'left') {
            currentHistoryIndexLeft--;
        } else {
            currentHistoryIndexRight--;
        }
        input.textContent = history[historyIndex - 1];
        // 触发输入事件以更新格式化显示
        input.dispatchEvent(new Event('input'));
    }
  }

  // 为左侧面板添加历史记录
  jsonInputLeft.addEventListener('input', function(e) {
    if (!undoHistoryLeft.length || undoHistoryLeft[currentHistoryIndexLeft] !== e.target.textContent) {
        currentHistoryIndexLeft++;
        undoHistoryLeft = undoHistoryLeft.slice(0, currentHistoryIndexLeft);
        undoHistoryLeft.push(e.target.textContent);

        // 限制历史记录长度
        if (undoHistoryLeft.length > MAX_HISTORY_LENGTH) {
            undoHistoryLeft = undoHistoryLeft.slice(-MAX_HISTORY_LENGTH);
            currentHistoryIndexLeft = MAX_HISTORY_LENGTH - 1;
        }
    }
  });

  // 为右侧面板添加历史记录
  jsonInputRight.addEventListener('input', function(e) {
    if (!undoHistoryRight.length || undoHistoryRight[currentHistoryIndexRight] !== e.target.textContent) {
        currentHistoryIndexRight++;
        undoHistoryRight = undoHistoryRight.slice(0, currentHistoryIndexRight);
        undoHistoryRight.push(e.target.textContent);

        // 限制历史记录长度
        if (undoHistoryRight.length > MAX_HISTORY_LENGTH) {
            undoHistoryRight = undoHistoryRight.slice(-MAX_HISTORY_LENGTH);
            currentHistoryIndexRight = MAX_HISTORY_LENGTH - 1;
        }
    }
  });
});