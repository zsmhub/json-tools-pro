document.addEventListener('DOMContentLoaded', function() {
  // 获取左侧面板元素
  const jsonInputLeft = document.getElementById('jsonInputLeft');
  const formatBtnLeft = document.getElementById('formatLeft');
  const compressBtnLeft = document.getElementById('compressLeft');
  const autoFormatCheckboxLeft = document.getElementById('autoFormatLeft');
  const copyBtnLeft = document.getElementById('copyLeft');
  const clearBtnLeft = document.getElementById('clearLeft');

  // 获取右侧面板元素
  const jsonInputRight = document.getElementById('jsonInputRight');
  const formatBtnRight = document.getElementById('formatRight');
  const compressBtnRight = document.getElementById('compressRight');
  const autoFormatCheckboxRight = document.getElementById('autoFormatRight');
  const copyBtnRight = document.getElementById('copyRight');
  const clearBtnRight = document.getElementById('clearRight');

  // 获取方向按钮
  const copyToRightBtn = document.getElementById('copyToRight');
  const copyToLeftBtn = document.getElementById('copyToLeft');

  // 设置默认自动格式化
  autoFormatCheckboxLeft.checked = true;
  autoFormatCheckboxRight.checked = true;

  // 创建面板控制器
  function createPanelController(input, preview, formatBtn, compressBtn, autoFormatCheckbox, copyBtn, clearBtn) {
    // 初始化高亮
    JSONFormatter.applyHighlight(input);

    // 更新预览区域
    function updatePreview() {
      JSONFormatter.formatPreview(input.textContent, preview);
    }

    // 输入事件
    input.addEventListener('input', () => {
      if (autoFormatCheckbox.checked) {
        const formatted = JSONFormatter.format(input.textContent);
        input.textContent = formatted;
        JSONFormatter.applyHighlight(input);
      }
      updatePreview();
    });

    // 格式化按钮点击事件
    formatBtn.addEventListener('click', () => {
      const formatted = JSONFormatter.format(input.textContent);
      input.textContent = formatted;
      JSONFormatter.applyHighlight(input);
      updatePreview();
    });

    // 压缩按钮点击事件
    compressBtn.addEventListener('click', () => {
      const compressed = JSONFormatter.compress(input.textContent);
      input.textContent = compressed;
      JSONFormatter.applyHighlight(input);
      updatePreview();
    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', () => {
      const selectedText = window.getSelection().toString();
      const textToCopy = selectedText || input.textContent;

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showCopySuccess(copyBtn);
        });
      }
    });

    // 清除按钮点击事件
    clearBtn.addEventListener('click', () => {
      input.textContent = '';
      preview.textContent = '';
      preview.parentElement.classList.remove('valid-json', 'invalid-json');
      input.dispatchEvent(new Event('input'));
    });

    // 粘贴事件
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      try {
        const obj = JSON.parse(text);
        const formatted = JSON.stringify(obj, null, 2);
        input.textContent = formatted;
      } catch (e) {
        input.textContent = text;
      }
      input.dispatchEvent(new Event('input'));
    });

    // 初始更新预览
    updatePreview();

    return { updatePreview };
  }

  // 初始化两个面板
  const previewLeft = document.getElementById('previewLeft');
  const previewRight = document.getElementById('previewRight');

  const leftPanel = createPanelController(
    jsonInputLeft,
    previewLeft,
    formatBtnLeft,
    compressBtnLeft,
    autoFormatCheckboxLeft,
    copyBtnLeft,
    clearBtnLeft
  );

  const rightPanel = createPanelController(
    jsonInputRight,
    previewRight,
    formatBtnRight,
    compressBtnRight,
    autoFormatCheckboxRight,
    copyBtnRight,
    clearBtnRight
  );

  // 方向复制按钮事件
  copyToRightBtn.addEventListener('click', () => {
    jsonInputRight.textContent = jsonInputLeft.textContent;
    jsonInputRight.dispatchEvent(new Event('input'));
  });

  copyToLeftBtn.addEventListener('click', () => {
    jsonInputLeft.textContent = jsonInputRight.textContent;
    jsonInputLeft.dispatchEvent(new Event('input'));
  });

  // 辅助函数
  function showCopySuccess(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  }
});