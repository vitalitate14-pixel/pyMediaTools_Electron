/**
 * reels-batch-table.js — 批量文案卡片表格管理
 *
 * 表格驱动的批量生产面板：
 *   - 每行 = 一个 Reel 任务
 *   - 列: # | 背景素材 | 音频 | 字幕 | 标题 | 内容 | 模板
 *   - 支持从 Google Sheets 粘贴 标题+内容
 *   - 每行可独立选择卡片模板
 *   - 拖拽/批量分配素材
 */

// ═══════════════════════════════════════════════════════
// 1. Core State & Config
// ═══════════════════════════════════════════════════════

const _batchTableState = {
    visible: false,
    container: null,
};

// ═══════════════════════════════════════════════════════
// 2. Initialization
// ═══════════════════════════════════════════════════════

function _initBatchTable() {
    // 容器
    let container = document.getElementById('reels-batch-table-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'reels-batch-table-container';
        container.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9000;background:rgba(0,0,0,0.85);overflow:hidden;';
        document.body.appendChild(container);
    }
    _batchTableState.container = container;
}

// ═══════════════════════════════════════════════════════
// 3. Toggle visibility
// ═══════════════════════════════════════════════════════

function reelsToggleBatchTable() {
    if (!_batchTableState.container) _initBatchTable();
    _batchTableState.visible = !_batchTableState.visible;
    if (_batchTableState.visible) {
        _renderBatchTable();
        _batchTableState.container.style.display = 'flex';
    } else {
        _batchTableState.container.style.display = 'none';
    }
}

// ═══════════════════════════════════════════════════════
// 3b. Language list for subtitle alignment
// ═══════════════════════════════════════════════════════

const REELS_LANG_STORAGE_KEY = 'reels_align_language';

const REELS_ALL_LANGUAGES = [
    // ── 常用 ──
    { name: '英语', code: 'en', en: 'English', pinned: true },
    { name: '中文', code: 'zh', en: 'Chinese', pinned: true },
    { name: '日语', code: 'ja', en: 'Japanese', pinned: true },
    { name: '韩语', code: 'ko', en: 'Korean', pinned: true },
    { name: '西班牙语', code: 'es', en: 'Spanish', pinned: true },
    { name: '法语', code: 'fr', en: 'French', pinned: true },
    { name: '德语', code: 'de', en: 'German', pinned: true },
    { name: '葡萄牙语', code: 'pt', en: 'Portuguese', pinned: true },
    { name: '俄语', code: 'ru', en: 'Russian', pinned: true },
    { name: '阿拉伯语', code: 'ar', en: 'Arabic', pinned: true },
    { name: '粤语', code: 'yue', en: 'Cantonese', pinned: true },
    // ── 亚洲 ──
    { name: '印地语', code: 'hi', en: 'Hindi' },
    { name: '泰语', code: 'th', en: 'Thai' },
    { name: '越南语', code: 'vi', en: 'Vietnamese' },
    { name: '印尼语', code: 'id', en: 'Indonesian' },
    { name: '马来语', code: 'ms', en: 'Malay' },
    { name: '泰米尔语', code: 'ta', en: 'Tamil' },
    { name: '泰卢固语', code: 'te', en: 'Telugu' },
    { name: '孟加拉语', code: 'bn', en: 'Bengali' },
    { name: '卡纳达语', code: 'kn', en: 'Kannada' },
    { name: '马拉雅拉姆语', code: 'ml', en: 'Malayalam' },
    { name: '马拉地语', code: 'mr', en: 'Marathi' },
    { name: '古吉拉特语', code: 'gu', en: 'Gujarati' },
    { name: '旁遮普语', code: 'pa', en: 'Punjabi' },
    { name: '僧伽罗语', code: 'si', en: 'Sinhala' },
    { name: '尼泊尔语', code: 'ne', en: 'Nepali' },
    { name: '乌尔都语', code: 'ur', en: 'Urdu' },
    { name: '高棉语', code: 'km', en: 'Khmer' },
    { name: '老挝语', code: 'lo', en: 'Lao' },
    { name: '蒙古语', code: 'mn', en: 'Mongolian' },
    { name: '缅甸语', code: 'my', en: 'Myanmar' },
    { name: '藏语', code: 'bo', en: 'Tibetan' },
    { name: '他加禄语', code: 'tl', en: 'Tagalog' },
    { name: '爪哇语', code: 'jw', en: 'Javanese' },
    { name: '巽他语', code: 'su', en: 'Sundanese' },
    { name: '阿萨姆语', code: 'as', en: 'Assamese' },
    // ── 欧洲 ──
    { name: '意大利语', code: 'it', en: 'Italian' },
    { name: '荷兰语', code: 'nl', en: 'Dutch' },
    { name: '波兰语', code: 'pl', en: 'Polish' },
    { name: '土耳其语', code: 'tr', en: 'Turkish' },
    { name: '瑞典语', code: 'sv', en: 'Swedish' },
    { name: '芬兰语', code: 'fi', en: 'Finnish' },
    { name: '丹麦语', code: 'da', en: 'Danish' },
    { name: '挪威语', code: 'no', en: 'Norwegian' },
    { name: '新挪威语', code: 'nn', en: 'Nynorsk' },
    { name: '捷克语', code: 'cs', en: 'Czech' },
    { name: '斯洛伐克语', code: 'sk', en: 'Slovak' },
    { name: '匈牙利语', code: 'hu', en: 'Hungarian' },
    { name: '罗马尼亚语', code: 'ro', en: 'Romanian' },
    { name: '保加利亚语', code: 'bg', en: 'Bulgarian' },
    { name: '希腊语', code: 'el', en: 'Greek' },
    { name: '乌克兰语', code: 'uk', en: 'Ukrainian' },
    { name: '白俄罗斯语', code: 'be', en: 'Belarusian' },
    { name: '克罗地亚语', code: 'hr', en: 'Croatian' },
    { name: '塞尔维亚语', code: 'sr', en: 'Serbian' },
    { name: '斯洛文尼亚语', code: 'sl', en: 'Slovenian' },
    { name: '立陶宛语', code: 'lt', en: 'Lithuanian' },
    { name: '拉脱维亚语', code: 'lv', en: 'Latvian' },
    { name: '爱沙尼亚语', code: 'et', en: 'Estonian' },
    { name: '马其顿语', code: 'mk', en: 'Macedonian' },
    { name: '波斯尼亚语', code: 'bs', en: 'Bosnian' },
    { name: '阿尔巴尼亚语', code: 'sq', en: 'Albanian' },
    { name: '冰岛语', code: 'is', en: 'Icelandic' },
    { name: '马耳他语', code: 'mt', en: 'Maltese' },
    { name: '卢森堡语', code: 'lb', en: 'Luxembourgish' },
    { name: '法罗语', code: 'fo', en: 'Faroese' },
    { name: '加泰罗尼亚语', code: 'ca', en: 'Catalan' },
    { name: '加利西亚语', code: 'gl', en: 'Galician' },
    { name: '巴斯克语', code: 'eu', en: 'Basque' },
    { name: '奥克语', code: 'oc', en: 'Occitan' },
    { name: '布列塔尼语', code: 'br', en: 'Breton' },
    { name: '威尔士语', code: 'cy', en: 'Welsh' },
    // ── 中东/中亚 ──
    { name: '波斯语', code: 'fa', en: 'Persian' },
    { name: '希伯来语', code: 'he', en: 'Hebrew' },
    { name: '亚美尼亚语', code: 'hy', en: 'Armenian' },
    { name: '格鲁吉亚语', code: 'ka', en: 'Georgian' },
    { name: '阿塞拜疆语', code: 'az', en: 'Azerbaijani' },
    { name: '哈萨克语', code: 'kk', en: 'Kazakh' },
    { name: '乌兹别克语', code: 'uz', en: 'Uzbek' },
    { name: '土库曼语', code: 'tk', en: 'Turkmen' },
    { name: '塔吉克语', code: 'tg', en: 'Tajik' },
    { name: '普什图语', code: 'ps', en: 'Pashto' },
    { name: '信德语', code: 'sd', en: 'Sindhi' },
    { name: '鞑靼语', code: 'tt', en: 'Tatar' },
    { name: '巴什基尔语', code: 'ba', en: 'Bashkir' },
    // ── 非洲 ──
    { name: '南非荷兰语', code: 'af', en: 'Afrikaans' },
    { name: '斯瓦希里语', code: 'sw', en: 'Swahili' },
    { name: '约鲁巴语', code: 'yo', en: 'Yoruba' },
    { name: '豪萨语', code: 'ha', en: 'Hausa' },
    { name: '索马里语', code: 'so', en: 'Somali' },
    { name: '绍纳语', code: 'sn', en: 'Shona' },
    { name: '阿姆哈拉语', code: 'am', en: 'Amharic' },
    { name: '林加拉语', code: 'ln', en: 'Lingala' },
    { name: '马达加斯加语', code: 'mg', en: 'Malagasy' },
    // ── 其他 ──
    { name: '拉丁语', code: 'la', en: 'Latin' },
    { name: '梵语', code: 'sa', en: 'Sanskrit' },
    { name: '毛利语', code: 'mi', en: 'Maori' },
    { name: '夏威夷语', code: 'haw', en: 'Hawaiian' },
    { name: '海地克里奥尔语', code: 'ht', en: 'Haitian Creole' },
    { name: '意第绪语', code: 'yi', en: 'Yiddish' },
];

function _initLangPicker(container) {
    const btn = container.querySelector('#rbt-lang-picker-btn');
    const dropdown = container.querySelector('#rbt-lang-dropdown');
    const searchInput = container.querySelector('#rbt-lang-search');
    const listEl = container.querySelector('#rbt-lang-list');
    const hiddenInput = container.querySelector('#rbt-align-lang');
    if (!btn || !dropdown || !listEl || !hiddenInput) return;

    // Restore saved language
    const savedLang = localStorage.getItem(REELS_LANG_STORAGE_KEY);
    if (savedLang) {
        const found = REELS_ALL_LANGUAGES.find(l => l.name === savedLang);
        if (found) {
            hiddenInput.value = found.name;
            btn.textContent = found.name + ' ▾';
        }
    }

    const renderList = (filter = '') => {
        const q = filter.toLowerCase().trim();
        const filtered = q
            ? REELS_ALL_LANGUAGES.filter(l =>
                l.name.includes(q) || l.en.toLowerCase().includes(q) || l.code.includes(q))
            : REELS_ALL_LANGUAGES;

        // Pinned first, then the rest
        const pinned = filtered.filter(l => l.pinned);
        const rest = filtered.filter(l => !l.pinned);
        const sorted = [...pinned, ...rest];

        listEl.innerHTML = sorted.map(l => `
            <div class="rbt-lang-item" data-name="${l.name}"
                 style="padding:6px 12px;cursor:pointer;font-size:12px;color:#ccc;
                        border-bottom:1px solid rgba(255,255,255,0.04);
                        display:flex;justify-content:space-between;align-items:center;
                        ${hiddenInput.value === l.name ? 'background:rgba(0,212,255,0.12);color:#00D4FF;' : ''}
                        ${l.pinned ? 'font-weight:600;' : ''}">
                <span>${l.name}</span>
                <span style="font-size:10px;color:#666;">${l.en}</span>
            </div>
        `).join('');

        if (sorted.length === 0) {
            listEl.innerHTML = '<div style="padding:12px;text-align:center;color:#555;font-size:11px;">未找到匹配语言</div>';
        }
    };

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display !== 'none';
        dropdown.style.display = isOpen ? 'none' : 'block';
        if (!isOpen) {
            searchInput.value = '';
            renderList();
            setTimeout(() => searchInput.focus(), 30);
        }
    });

    // Search filter
    searchInput.addEventListener('input', () => {
        renderList(searchInput.value);
    });
    searchInput.addEventListener('click', (e) => e.stopPropagation());

    // Click item
    listEl.addEventListener('click', (e) => {
        const item = e.target.closest('.rbt-lang-item');
        if (!item) return;
        const name = item.dataset.name;
        hiddenInput.value = name;
        btn.textContent = name + ' ▾';
        dropdown.style.display = 'none';
        // Persist
        localStorage.setItem(REELS_LANG_STORAGE_KEY, name);
    });

    // Hover effect
    listEl.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.rbt-lang-item');
        if (item) item.style.background = 'rgba(255,255,255,0.08)';
    });
    listEl.addEventListener('mouseout', (e) => {
        const item = e.target.closest('.rbt-lang-item');
        if (item) item.style.background = hiddenInput.value === item.dataset.name ? 'rgba(0,212,255,0.12)' : '';
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!container.querySelector('#rbt-lang-picker-wrap')?.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// ═══════════════════════════════════════════════════════
// 4. Render the batch table
// ═══════════════════════════════════════════════════════

function _renderBatchTable() {
    const container = _batchTableState.container;
    const state = window._reelsState;
    if (!state) return;

    // 自动保存当前配置到 localStorage
    _batchAutoSave();
    const tasks = state.tasks || [];

    // 获取已保存的卡片模板列表
    const cardTemplates = _getOverlayGroupPresetList();
    const subtitlePresets = _getSubtitlePresetList();

    container.innerHTML = `
        <div class="rbt-panel">
            <div class="rbt-header">
                <h2>📋 批量文案管理</h2>
                <div class="rbt-actions">
                    <button class="rbt-btn rbt-btn-folder" id="rbt-upload-folder" title="选择文件夹，自动按文件类型分类+同名配对">📂 读取文件夹</button>
                    <span class="rbt-sep"></span>
                    <button class="rbt-btn" id="rbt-upload-bg" title="批量添加背景素材（图片/视频）">🖼 批量背景</button>
                    <button class="rbt-btn" id="rbt-upload-audio" title="批量添加音频">🔊 批量音频</button>
                    <button class="rbt-btn" id="rbt-upload-srt" title="批量添加字幕">📝 批量字幕</button>
                    <button class="rbt-btn" id="rbt-upload-txt" title="批量添加TXT文案（用于对齐生成SRT）">📄 批量TXT</button>
                    <span class="rbt-sep"></span>
                    <select id="rbt-align-source" style="font-size:11px;padding:3px 6px;background:#1a1a3a;color:#a0d0ff;border:1px solid #4a6a8a;border-radius:4px;">
                        <option value="audio">🎙 用MP3配音对齐</option>
                        <option value="video">🎬 用背景视频对齐</option>
                    </select>
                    <div style="position:relative;display:inline-block;" id="rbt-lang-picker-wrap">
                        <button id="rbt-lang-picker-btn" style="font-size:11px;padding:3px 10px;background:#1a1a3a;color:#a0d0ff;border:1px solid #4a6a8a;border-radius:4px;cursor:pointer;min-width:90px;text-align:left;">英语 ▾</button>
                        <input type="hidden" id="rbt-align-lang" value="英语">
                        <div id="rbt-lang-dropdown" style="display:none;position:absolute;top:100%;left:0;z-index:9999;background:#1a1a3a;border:1px solid #4a6a8a;border-radius:6px;width:220px;max-height:320px;box-shadow:0 8px 24px rgba(0,0,0,0.6);overflow:hidden;">
                            <input id="rbt-lang-search" type="text" placeholder="🔍 搜索语言..." style="width:100%;box-sizing:border-box;padding:6px 10px;border:none;border-bottom:1px solid #333;background:#12122a;color:#ddd;font-size:12px;outline:none;">
                            <div id="rbt-lang-list" style="max-height:270px;overflow-y:auto;"></div>
                        </div>
                    </div>
                    <button class="rbt-btn" id="rbt-align-all-btn" title="对齐所有有文案的任务，生成字幕时间轴" style="background:#2a4a6a;border-color:#4a6a8a;color:#a0d0ff;">🔗 对齐字幕</button>
                    <label style="display:flex;align-items:center;gap:3px;font-size:10px;color:#888;cursor:pointer;">
                        <input type="checkbox" id="rbt-force-realign"> 强制重新对齐
                    </label>
                    <button class="rbt-btn" id="rbt-set-bgm-btn" title="选择一首配乐，应用到所有勾选的行（或全部行）" style="background:#5b3a8b;border-color:#7b5aab;color:#e0d0ff;">🎵 设置配乐</button>
                    <span class="rbt-sep"></span>
                    <button class="rbt-btn rbt-btn-accent" id="rbt-paste-btn" title="从 Google 表格粘贴标题+内容">📋 粘贴文案</button>
                    <button class="rbt-btn" id="rbt-add-row-btn" title="添加空行">➕ 添加行</button>
                    <span class="rbt-sep"></span>
                    <button class="rbt-btn" id="rbt-save-config-btn" title="导出当前所有行配置为JSON文件" style="background:#2a5a3a;border-color:#3a7a4a;color:#a0e0b0;">💾 保存配置</button>
                    <button class="rbt-btn" id="rbt-load-config-btn" title="从JSON文件恢复配置" style="background:#3a4a6a;border-color:#5a6a8a;color:#b0c0e0;">📂 加载配置</button>
                    <input type="file" id="rbt-file-config" class="rbt-hidden-input" accept=".json">
                    <button class="rbt-btn rbt-btn-danger" id="rbt-clear-btn" title="清空所有行">🧹 清空</button>
                    <button class="rbt-btn" id="rbt-close-btn" title="关闭表格">✕ 关闭</button>
                </div>
            </div>
            <!-- hidden file inputs -->
            <input type="file" id="rbt-file-bg" class="rbt-hidden-input" accept=".mp4,.mov,.mkv,.avi,.wmv,.flv,.webm,.jpg,.jpeg,.png,.webp" multiple>
            <input type="file" id="rbt-file-audio" class="rbt-hidden-input" accept=".mp3,.wav,.m4a,.aac,.flac,.ogg" multiple>
            <input type="file" id="rbt-file-srt" class="rbt-hidden-input" accept=".srt" multiple>
            <input type="file" id="rbt-file-txt" class="rbt-hidden-input" accept=".txt" multiple>
            <input type="file" id="rbt-file-bgm" class="rbt-hidden-input" accept=".mp3,.wav,.m4a,.aac,.flac,.ogg">
            <input type="file" id="rbt-file-single" class="rbt-hidden-input" accept="*/*">
            <input type="file" id="rbt-file-folder" class="rbt-hidden-input" webkitdirectory directory multiple>
            <div class="rbt-table-wrap">
                <table class="rbt-table" id="rbt-table">
                    <thead>
                        <tr>
                            <th class="rbt-col-num">#</th>
                            <th class="rbt-col-bg">🖼 背景素材</th>
                            <th class="rbt-col-audio">🔊 音频</th>
                            <th class="rbt-col-srt">📝 字幕</th>
                            <th class="rbt-col-txtcontent">� 文案内容</th>
                            <th class="rbt-col-bgm">🎵 配乐</th>
                            <th class="rbt-col-title">📋 覆层标题</th>
                            <th class="rbt-col-body">📋 覆层内容</th>
                            <th class="rbt-col-footer">📋 覆层结尾</th>
                            <th class="rbt-col-dur">⏱ 时长(s)</th>
                            <th class="rbt-col-tpl">🎬 字幕模板</th>
                            <th class="rbt-col-tpl">📦 覆层预设</th>
                            <th class="rbt-col-act">操作</th>
                        </tr>
                    </thead>
                    <tbody id="rbt-tbody">
                        ${tasks.map((t, i) => _renderBatchRow(t, i, subtitlePresets, cardTemplates)).join('')}
                    </tbody>
                </table>
            </div>
            <div class="rbt-footer">
                <span id="rbt-count">${tasks.length} 个任务</span>
                <span id="rbt-align-progress" style="font-size:12px;color:#a0d0ff;margin-left:12px;"></span>
                <div class="rbt-footer-hint">提示: 先粘贴文案创建行 → 再批量添加素材自动按顺序分配</div>
                <button class="rbt-btn rbt-btn-primary" id="rbt-apply-btn">✅ 应用更改并关闭</button>
            </div>
        </div>
    `;

    // CSS
    _injectBatchTableCSS();

    // 事件
    _bindBatchTableEvents();
}

function _renderBatchRow(task, idx, subtitlePresets, cardTemplates) {
    // 提取覆层信息
    const ov = (task.overlays || [])[0];
    const title = ov ? (ov.title_text || '') : '';
    const body = ov ? (ov.body_text || '') : '';
    const footer = ov ? (ov.footer_text || '') : '';
    const bgName = _shortName(task.bgPath || task.videoPath || '');
    const audioName = _shortName(task.audioPath || '');
    const srtName = _shortName(task.srtPath || '');
    const txtName = _shortName(task.txtPath || '');
    const txtStatus = task.txtContent ? (task.aligned ? '✅' : '⏳') : '';
    const bgmName = _shortName(task.bgmPath || '');

    // 缩略图生成
    let bgContent = bgName || '<span class="rbt-placeholder">拖拽/点击</span>';
    const bgPath = task.bgPath || task.videoPath;
    if (bgPath) {
        const isImg = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(bgPath);
        const urlObj = task.bgSrcUrl || (window.electronAPI && window.electronAPI.toFileUrl ? window.electronAPI.toFileUrl(bgPath) : `file://${bgPath}`);
        if (isImg) {
            bgContent = `<div style="display:flex;align-items:center;gap:6px;">
                            <img src="${_escHtml(urlObj)}" style="width:32px;height:32px;object-fit:cover;border-radius:4px;flex-shrink:0;">
                            <span class="rbt-file-name" style="flex:1" title="${_escHtml(bgPath)}">${bgName}</span>
                         </div>`;
        } else {
            bgContent = `<div style="display:flex;align-items:center;gap:6px;">
                            <video src="${_escHtml(urlObj)}#t=1" preload="metadata" style="width:32px;height:32px;object-fit:cover;border-radius:4px;flex-shrink:0;background:#000;"></video>
                            <span class="rbt-file-name" style="flex:1" title="${_escHtml(bgPath)}">${bgName}</span>
                         </div>`;
        }
    } else {
        bgContent = `<span class="rbt-file-name" title="">${bgContent}</span>`;
    }

    const subTplOptions = subtitlePresets.map(t =>
        `<option value="${_escHtml(t)}" ${task._subtitlePreset === t ? 'selected' : ''}>${_escHtml(t)}</option>`
    ).join('');

    const cardTplOptions = cardTemplates.map(t =>
        `<option value="${_escHtml(t.name)}" ${task._overlayPresetName === t.name ? 'selected' : ''}>${_escHtml(t.name)} (${t.count}层)</option>`
    ).join('');

    return `
        <tr data-idx="${idx}" class="rbt-row ${idx === (window._reelsState?.selectedIdx || -1) ? 'rbt-row-selected' : ''}">
            <td class="rbt-col-num">${idx + 1}</td>
            <td class="rbt-col-bg rbt-droppable" data-field="bg">
                <div style="display:flex;align-items:center;gap:2px;">
                    <div style="flex:1;min-width:0;overflow:hidden;">${bgContent}</div>
                    ${bgPath ? `<button class="rbt-field-clear" data-idx="${idx}" data-field="bg" title="清除背景">✕</button>` : ''}
                </div>
            </td>
            <td class="rbt-col-audio rbt-droppable" data-field="audio">
                <div style="display:flex;align-items:center;gap:2px;">
                    <span class="rbt-file-name" style="flex:1" title="${_escHtml(task.audioPath || '')}">${audioName || '<span class="rbt-placeholder">—</span>'}</span>
                    ${audioName ? `<button class="rbt-field-clear" data-idx="${idx}" data-field="audio" title="清除音频">✕</button>` : ''}
                </div>
            </td>
            <td class="rbt-col-srt rbt-droppable" data-field="srt">
                <div style="display:flex;align-items:center;gap:2px;">
                    <span class="rbt-file-name" style="flex:1" title="${_escHtml(task.srtPath || '')}">${srtName || '<span class="rbt-placeholder">—</span>'}</span>
                    ${srtName ? `<button class="rbt-field-clear" data-idx="${idx}" data-field="srt" title="清除字幕">✕</button>` : ''}
                </div>
            </td>
            <td class="rbt-col-txtcontent">
                <div style="position:relative;">
                    <textarea class="rbt-textarea rbt-txtcontent-input" data-idx="${idx}" rows="3" placeholder="粘贴或输入文案...">${_escHtml(task.txtContent || '')}</textarea>
                    ${task.txtContent ? `<button class="rbt-field-clear" data-idx="${idx}" data-field="txt" title="清除文案" style="position:absolute;top:2px;right:2px;">✕</button>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
                    <span style="font-size:10px;color:${task.aligned ? '#4ade80' : task.txtContent ? '#facc15' : '#666'};">${task.aligned ? '✅ 已对齐' : task.txtContent ? '⏳ 待对齐' : ''}</span>
                    ${task.srtPath ? `<span style="font-size:10px;color:#888;" title="${_escHtml(task.srtPath)}">📄 ${_shortName(task.srtPath)}</span>` : ''}
                </div>
            </td>
            <td class="rbt-col-bgm">
                <div style="display:flex;align-items:center;gap:4px;">
                    <input type="checkbox" class="rbt-bgm-check" data-idx="${idx}" title="勾选后可批量设置配乐">
                    <span class="rbt-file-name rbt-bgm-pick" data-idx="${idx}" title="${_escHtml(task.bgmPath || '')}"
                          style="cursor:pointer;flex:1;">${bgmName || '<span class="rbt-placeholder">点击选择</span>'}</span>
                    ${bgmName ? `<button class="rbt-field-clear" data-idx="${idx}" data-field="bgm" title="清除配乐">✕</button>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:4px;margin-top:3px;">
                    <span style="font-size:10px;color:#888;white-space:nowrap;">🔉</span>
                    <input type="range" class="rbt-bgm-vol" data-idx="${idx}" min="0" max="100" value="${task.bgmVolume != null ? task.bgmVolume : 30}"
                           style="flex:1;height:14px;accent-color:#9b59b6;" title="配乐音量">
                    <span class="rbt-bgm-vol-label" style="font-size:10px;color:#888;min-width:28px;text-align:right;">${task.bgmVolume != null ? task.bgmVolume : 30}%</span>
                </div>
            </td>
            <td class="rbt-col-title">
                <textarea class="rbt-textarea rbt-title-input" data-idx="${idx}" rows="2">${_escHtml(title)}</textarea>
            </td>
            <td class="rbt-col-body">
                <textarea class="rbt-textarea rbt-body-input" data-idx="${idx}" rows="2">${_escHtml(body)}</textarea>
            </td>
            <td class="rbt-col-footer">
                <textarea class="rbt-textarea rbt-footer-input" data-idx="${idx}" rows="2">${_escHtml(footer)}</textarea>
            </td>
            <td class="rbt-col-dur">
                <input type="number" class="rbt-textarea rbt-dur-input" data-idx="${idx}" min="0" max="600" step="0.5"
                    value="${task.customDuration ? task.customDuration : ''}" placeholder="自动" style="width:55px;text-align:center;" title="留空=自动跟随音频/视频时长，输入数字=自定义秒数">
            </td>
            <td class="rbt-col-tpl">
                <select class="rbt-select rbt-sub-tpl-select" data-idx="${idx}">
                    <option value="">默认</option>
                    ${subTplOptions}
                </select>
            </td>
            <td class="rbt-col-tpl">
                <select class="rbt-select rbt-card-tpl-select" data-idx="${idx}">
                    <option value="">无预设</option>
                    ${cardTplOptions}
                </select>
            </td>
            <td class="rbt-col-act">
                <button class="rbt-row-btn rbt-select-btn" data-idx="${idx}" title="预览此任务">👁</button>
                <button class="rbt-row-btn rbt-clone-btn" data-idx="${idx}" title="复制此行">📋</button>
                <button class="rbt-row-btn rbt-delete-btn" data-idx="${idx}" title="删除此行">🗑</button>
            </td>
        </tr>
    `;
}

// ═══════════════════════════════════════════════════════
// 5. Event Binding
// ═══════════════════════════════════════════════════════

function _bindBatchTableEvents() {
    const container = _batchTableState.container;

    // Close
    container.querySelector('#rbt-close-btn')?.addEventListener('click', () => reelsToggleBatchTable());
    container.querySelector('#rbt-apply-btn')?.addEventListener('click', () => {
        _applyBatchTableChanges();
        reelsToggleBatchTable();
    });

    // ── Language searchable picker ──
    _initLangPicker(container);

    // Add row
    container.querySelector('#rbt-add-row-btn')?.addEventListener('click', () => {
        _batchAddEmptyRow();
        _renderBatchTable();
    });

    // Clear
    container.querySelector('#rbt-clear-btn')?.addEventListener('click', () => {
        if (confirm('确定清空所有任务？')) {
            window._reelsState.tasks = [];
            _renderBatchTable();
        }
    });

    // Paste
    container.querySelector('#rbt-paste-btn')?.addEventListener('click', () => {
        _batchPasteFromSheet();
    });

    // Save config
    container.querySelector('#rbt-save-config-btn')?.addEventListener('click', () => {
        _batchExportConfig();
    });

    // Load config
    container.querySelector('#rbt-load-config-btn')?.addEventListener('click', () => {
        container.querySelector('#rbt-file-config').click();
    });
    container.querySelector('#rbt-file-config')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) _batchImportConfig(file);
        e.target.value = '';
    });

    // ── 读取文件夹 ──
    container.querySelector('#rbt-upload-folder')?.addEventListener('click', () => {
        container.querySelector('#rbt-file-folder').click();
    });
    container.querySelector('#rbt-file-folder')?.addEventListener('change', (e) => {
        _batchImportFolder(Array.from(e.target.files));
        e.target.value = '';
    });

    // ── 批量上传按钮 ──
    container.querySelector('#rbt-upload-bg')?.addEventListener('click', () => {
        container.querySelector('#rbt-file-bg').click();
    });
    container.querySelector('#rbt-upload-audio')?.addEventListener('click', () => {
        container.querySelector('#rbt-file-audio').click();
    });
    container.querySelector('#rbt-upload-srt')?.addEventListener('click', () => {
        container.querySelector('#rbt-file-srt').click();
    });
    container.querySelector('#rbt-upload-txt')?.addEventListener('click', () => {
        container.querySelector('#rbt-file-txt').click();
    });
    container.querySelector('#rbt-align-all-btn')?.addEventListener('click', () => {
        _batchAlignAllTasks();
    });

    // ── 批量文件选完后按顺序分配到各行 ──
    container.querySelector('#rbt-file-bg')?.addEventListener('change', (e) => {
        _batchAssignFiles(Array.from(e.target.files), 'bg');
        e.target.value = '';
    });
    container.querySelector('#rbt-file-audio')?.addEventListener('change', (e) => {
        _batchAssignFiles(Array.from(e.target.files), 'audio');
        e.target.value = '';
    });
    container.querySelector('#rbt-file-srt')?.addEventListener('change', (e) => {
        _batchAssignFiles(Array.from(e.target.files), 'srt');
        e.target.value = '';
    });
    container.querySelector('#rbt-file-txt')?.addEventListener('change', (e) => {
        _batchAssignTxtFiles(Array.from(e.target.files));
        e.target.value = '';
    });

    // ── 配乐批量设置 ──
    container.querySelector('#rbt-set-bgm-btn')?.addEventListener('click', () => {
        // 点击“设置配乐”按钮，先选文件，然后应用到勾选的行
        _batchTableState._bgmBatchMode = true;
        container.querySelector('#rbt-file-bgm').click();
    });
    container.querySelector('#rbt-file-bgm')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const filePath = file.path || file.name;
        const state = window._reelsState;

        if (_batchTableState._bgmBatchMode) {
            // 批量模式：应用到所有勾选的行
            const checks = container.querySelectorAll('.rbt-bgm-check:checked');
            let targets;
            if (checks.length > 0) {
                targets = Array.from(checks).map(c => state.tasks[parseInt(c.dataset.idx)]).filter(Boolean);
            } else {
                // 没有勾选任何行，应用到全部
                targets = state.tasks;
            }
            for (const t of targets) {
                t.bgmPath = filePath;
            }
            _renderBatchTable();
            if (typeof _renderTaskList === 'function') _renderTaskList();
            alert(`✅ 已将配乐设置到 ${targets.length} 个任务`);
        } else if (_batchTableState._bgmSingleIdx != null) {
            // 单行模式
            const task = state.tasks[_batchTableState._bgmSingleIdx];
            if (task) {
                task.bgmPath = filePath;
                _renderBatchTable();
                if (typeof _renderTaskList === 'function') _renderTaskList();
            }
        }
        _batchTableState._bgmBatchMode = false;
        _batchTableState._bgmSingleIdx = null;
        e.target.value = '';
    });

    // ── 单行文件选择 ──
    container.querySelector('#rbt-file-single')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const { idx, field } = _batchTableState._pendingSingle || {};
        if (idx != null && field) {
            _assignSingleFile(idx, field, file);
        }
        _batchTableState._pendingSingle = null;
        e.target.value = '';
    });

    // ── 拖拽文件到批量表格 ──
    const panel = container.querySelector('.rbt-panel') || container;
    let _dropOverlay = null;
    const _showDropOverlay = () => {
        if (_dropOverlay) return;
        _dropOverlay = document.createElement('div');
        _dropOverlay.style.cssText = 'position:absolute;inset:0;z-index:99;background:rgba(80,140,255,0.15);border:3px dashed #4a9eff;border-radius:12px;display:flex;align-items:center;justify-content:center;pointer-events:none;';
        _dropOverlay.innerHTML = '<span style="font-size:24px;color:#4a9eff;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.5);">📂 拖放文件到这里</span>';
        panel.style.position = 'relative';
        panel.appendChild(_dropOverlay);
    };
    const _hideDropOverlay = () => {
        if (_dropOverlay) { _dropOverlay.remove(); _dropOverlay = null; }
    };
    let _dragCounter = 0;
    panel.addEventListener('dragenter', (e) => { e.preventDefault(); _dragCounter++; _showDropOverlay(); });
    panel.addEventListener('dragleave', (e) => { e.preventDefault(); _dragCounter--; if (_dragCounter <= 0) { _dragCounter = 0; _hideDropOverlay(); } });
    panel.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    panel.addEventListener('drop', (e) => {
        e.preventDefault();
        _dragCounter = 0;
        _hideDropOverlay();
        const files = Array.from(e.dataTransfer.files || []);
        if (!files.length) return;

        // 按扩展名分类
        const bgExts = new Set(['mp4', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'webm', 'jpg', 'jpeg', 'png', 'webp']);
        const audioExts = new Set(['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg']);
        const groups = { bg: [], audio: [], srt: [], txt: [] };

        for (const f of files) {
            const ext = (f.name || '').split('.').pop().toLowerCase();
            if (ext === 'srt') groups.srt.push(f);
            else if (ext === 'txt') groups.txt.push(f);
            else if (audioExts.has(ext)) groups.audio.push(f);
            else if (bgExts.has(ext)) groups.bg.push(f);
        }

        // 按类型依次分配（最多的类型先处理，其他自动填充）
        const assignments = [];
        if (groups.bg.length) assignments.push(['bg', groups.bg]);
        if (groups.audio.length) assignments.push(['audio', groups.audio]);
        if (groups.srt.length) assignments.push(['srt', groups.srt]);
        if (groups.txt.length) assignments.push(['txt', groups.txt]);

        if (assignments.length === 0) {
            alert('未识别到支持的文件类型');
            return;
        }

        // 依次批量分配（异步串行）
        (async () => {
            for (const [field, fieldFiles] of assignments) {
                await _batchAssignFiles(fieldFiles, field);
            }
        })();
    });

    // Per-row events (delegated)
    const tbody = container.querySelector('#rbt-tbody');
    if (tbody) {
        // 音量滑块实时更新标签
        tbody.addEventListener('input', (e) => {
            if (e.target.classList.contains('rbt-bgm-vol')) {
                const label = e.target.parentElement.querySelector('.rbt-bgm-vol-label');
                if (label) label.textContent = e.target.value + '%';
                // Sync volume to task for real-time preview
                const idx = parseInt(e.target.dataset.idx);
                const task = window._reelsState && window._reelsState.tasks[idx];
                if (task) {
                    task.bgmVolume = parseInt(e.target.value) || 0;
                    // If this is the selected task, update preview audio immediately
                    if (idx === window._reelsState.selectedIdx && typeof _applyPreviewAudioMix === 'function') {
                        _applyPreviewAudioMix();
                    }
                }
            }
        });
        tbody.addEventListener('click', (e) => {
            // 预览按钮
            const selectBtn = e.target.closest('.rbt-select-btn');
            if (selectBtn) {
                const idx = parseInt(selectBtn.dataset.idx);
                _applyBatchTableChanges();
                reelsToggleBatchTable();
                if (typeof reelsSelectTask === 'function') reelsSelectTask(idx);
                return;
            }
            // 复制行按钮
            const cloneBtn = e.target.closest('.rbt-clone-btn');
            if (cloneBtn) {
                const idx = parseInt(cloneBtn.dataset.idx);
                const src = window._reelsState.tasks[idx];
                if (src) {
                    const copy = JSON.parse(JSON.stringify(src));
                    copy.baseName = (copy.baseName || 'copy') + '_copy';
                    copy.fileName = copy.baseName + '.mp4';
                    // 清掉不可序列化的引用
                    delete copy._video;
                    delete copy._bgThumb;
                    window._reelsState.tasks.splice(idx + 1, 0, copy);
                    _renderBatchTable();
                }
                return;
            }
            // 删除按钮
            const delBtn = e.target.closest('.rbt-delete-btn');
            if (delBtn) {
                const idx = parseInt(delBtn.dataset.idx);
                window._reelsState.tasks.splice(idx, 1);
                _renderBatchTable();
                return;
            }
            // 单字段清除按钮
            const clearBtn = e.target.closest('.rbt-field-clear');
            if (clearBtn) {
                e.stopPropagation();
                const idx = parseInt(clearBtn.dataset.idx);
                const field = clearBtn.dataset.field;
                const task = window._reelsState.tasks[idx];
                if (!task) return;
                switch (field) {
                    case 'bg': task.bgPath = ''; task.videoPath = ''; task.bgSrcUrl = ''; break;
                    case 'audio': task.audioPath = ''; break;
                    case 'srt': task.srtPath = ''; task.aligned = false; break;
                    case 'txt': task.txtContent = ''; task.aligned = false; break;
                    case 'bgm': task.bgmPath = ''; break;
                }
                _renderBatchTable();
                return;
            }
            // 点击文件单元格 → 选择文件
            const cell = e.target.closest('.rbt-droppable');
            if (cell) {
                const row = cell.closest('.rbt-row');
                if (!row) return;
                const idx = parseInt(row.dataset.idx);
                const field = cell.dataset.field;
                _pickSingleFile(idx, field);
                return;
            }
            // 点击配乐单元格 → 选择配乐文件
            const bgmPick = e.target.closest('.rbt-bgm-pick');
            if (bgmPick) {
                const idx = parseInt(bgmPick.dataset.idx);
                _batchTableState._bgmBatchMode = false;
                _batchTableState._bgmSingleIdx = idx;
                container.querySelector('#rbt-file-bgm').click();
                return;
            }
        });
    }
}

// ═══════════════════════════════════════════════════════
// 6. Apply changes from table → tasks
// ═══════════════════════════════════════════════════════

function _applyBatchTableChanges() {
    const container = _batchTableState.container;
    if (!container) return;
    const state = window._reelsState;
    if (!state) return;

    const titleInputs = container.querySelectorAll('.rbt-title-input');
    const bodyInputs = container.querySelectorAll('.rbt-body-input');
    const footerInputs = container.querySelectorAll('.rbt-footer-input');
    const subTplSelects = container.querySelectorAll('.rbt-sub-tpl-select');
    const cardTplSelects = container.querySelectorAll('.rbt-card-tpl-select');

    titleInputs.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        const task = state.tasks[idx];
        if (!task) return;
        if (!task.overlays || !task.overlays[0]) {
            // Only create overlay if user actually typed something
            const titleVal = el.value.trim();
            if (!titleVal) return;
            const ReelsOverlay = window.ReelsOverlay;
            if (ReelsOverlay) {
                task.overlays = [ReelsOverlay.createTextCardOverlay({
                    title_text: titleVal,
                    body_text: '',
                    start: 0, end: 9999,
                })];
            }
        } else {
            task.overlays[0].title_text = el.value;
        }
    });

    bodyInputs.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        const task = state.tasks[idx];
        if (!task || !task.overlays || !task.overlays[0]) return;
        task.overlays[0].body_text = el.value;
    });

    footerInputs.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        const task = state.tasks[idx];
        if (!task || !task.overlays || !task.overlays[0]) return;
        task.overlays[0].footer_text = el.value;
    });

    // 自定义时长
    const durInputs = container.querySelectorAll('.rbt-dur-input');
    durInputs.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        const task = state.tasks[idx];
        if (!task) return;
        const v = parseFloat(el.value) || 0;
        task.customDuration = v > 0 ? v : 0;
    });

    // 文案内容（用于字幕对齐）
    const txtContentInputs = container.querySelectorAll('.rbt-txtcontent-input');
    txtContentInputs.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        const task = state.tasks[idx];
        if (!task) return;
        const newContent = el.value.trim();
        if (newContent !== (task.txtContent || '').trim()) {
            task.txtContent = newContent;
            task.aligned = false; // 内容变了重置对齐状态
        }
    });

    // 字幕模板
    subTplSelects.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        const task = state.tasks[idx];
        if (!task) return;
        task._subtitlePreset = el.value || '';
    });

    // 覆盖层组预设
    cardTplSelects.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        const task = state.tasks[idx];
        if (!task) return;
        const presetName = el.value;
        if (presetName) {
            _applyOverlayGroupPresetToTask(task, presetName);
        }
    });

    // 配乐音量
    const bgmVols = container.querySelectorAll('.rbt-bgm-vol');
    bgmVols.forEach(el => {
        const idx = parseInt(el.dataset.idx);
        const task = state.tasks[idx];
        if (!task) return;
        task.bgmVolume = parseInt(el.value) || 0;
    });

    // 刷新任务列表
    if (typeof _renderTaskList === 'function') _renderTaskList();

    // 同步当前选中任务的覆层到 overlayMgr
    const selIdx = state.selectedIdx;
    const selTask = state.tasks[selIdx];
    if (selTask && state.overlayProxy && state.overlayProxy.overlayMgr) {
        const mgr = state.overlayProxy.overlayMgr;
        mgr.overlays = selTask.overlays ? [...selTask.overlays] : [];
        if (state.overlayPanel) {
            state.overlayPanel.deselectOverlay();
            state.overlayPanel._refreshList();
        }
    }
}

// ═══════════════════════════════════════════════════════
// 7. Paste from Google Sheets
// ═══════════════════════════════════════════════════════

async function _batchPasteFromSheet() {
    // ── 第一步：让用户选模式 ──
    const mode = await _showPasteModeDialog();
    if (!mode) return;

    // ── 第二步：获取文本 ──
    let raw = '';
    try {
        raw = await navigator.clipboard.readText();
    } catch (e) {
        raw = await _showPasteDialog();
    }
    if (!raw || !raw.trim()) return;

    const rows = _parseBatchTSV(raw);
    if (!rows.length) {
        alert('未检测到有效数据');
        return;
    }

    const state = window._reelsState;
    const ReelsOverlay = window.ReelsOverlay;
    if (!state || !ReelsOverlay) return;

    // 解析每行数据
    const entries = [];
    for (const row of rows) {
        let title = '', body = '';
        if (row.length >= 3) {
            // 三列格式：名称 | 标题 | 内容（名称暂不用于此版本）
            title = row[1] || '';
            body = row[2] || '';
        } else {
            title = row[0] || '';
            body = row[1] || '';
        }
        if (!title && !body) continue;
        entries.push({ title, body });
    }

    if (!entries.length) {
        alert('未检测到有效文案数据');
        return;
    }

    let filled = 0, created = 0;

    if (mode === 'fill') {
        // ═══ 补全模式：只填没有文案的空行 ═══
        let entryIdx = 0;
        for (let i = 0; i < state.tasks.length && entryIdx < entries.length; i++) {
            const task = state.tasks[i];
            const ov = (task.overlays && task.overlays.length > 0) ? task.overlays[0] : null;
            // 判断是不是空文案（title 和 body 都空，或者是默认占位符）
            const titleVal = ov ? (ov.title_text || '') : '';
            const bodyVal = ov ? (ov.body_text || '') : '';
            const isDefault = (t) => !t || t === '标题文字' || t === '内容文字';
            const isEmpty = isDefault(titleVal) && isDefault(bodyVal);

            if (isEmpty) {
                _setTaskText(task, entries[entryIdx].title, entries[entryIdx].body, ReelsOverlay);
                entryIdx++;
                filled++;
            }
        }
        // 剩余的追加为新行
        while (entryIdx < entries.length) {
            _createNewTextRow(state, entries[entryIdx].title, entries[entryIdx].body, ReelsOverlay);
            entryIdx++;
            created++;
        }

    } else if (mode === 'new') {
        // ═══ 添加新行模式：全部新建 ═══
        for (const entry of entries) {
            _createNewTextRow(state, entry.title, entry.body, ReelsOverlay);
            created++;
        }

    } else if (mode === 'overwrite') {
        // ═══ 覆盖模式：从第1行开始往下覆盖 ═══
        for (let i = 0; i < entries.length; i++) {
            if (i < state.tasks.length) {
                _setTaskText(state.tasks[i], entries[i].title, entries[i].body, ReelsOverlay);
                filled++;
            } else {
                _createNewTextRow(state, entries[i].title, entries[i].body, ReelsOverlay);
                created++;
            }
        }
    }

    _renderBatchTable();
    if (typeof _renderTaskList === 'function') _renderTaskList();

    const parts = [];
    if (filled) parts.push(`填充 ${filled} 行`);
    if (created) parts.push(`新建 ${created} 行`);
    alert(`✅ 粘贴完成：${parts.join('，')}`);
}

// ── 辅助：设置一行的文案 ──
function _setTaskText(task, title, body, ReelsOverlay) {
    if (!task.overlays) task.overlays = [];
    if (!task.overlays[0]) {
        task.overlays[0] = ReelsOverlay.createTextCardOverlay({
            title_text: '', body_text: '',
            start: 0, end: 9999,
        });
    }
    task.overlays[0].title_text = title;
    task.overlays[0].body_text = body;
}

// ── 辅助：新建一行并填入文案 ──
function _createNewTextRow(state, title, body, ReelsOverlay) {
    const taskName = `card_${String(state.tasks.length + 1).padStart(3, '0')}`;
    state.tasks.push({
        baseName: taskName,
        fileName: `${taskName}.mp4`,
        bgPath: null, bgSrcUrl: null,
        audioPath: null, srtPath: null,
        segments: [],
        videoPath: null, srcUrl: null,
        overlays: [ReelsOverlay.createTextCardOverlay({
            title_text: title,
            body_text: body,
            start: 0, end: 9999,
        })],
    });
}

// ── 模式选择弹窗 ──
function _showPasteModeDialog() {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;';

        const box = document.createElement('div');
        box.style.cssText = 'background:#1e1e2e;border:1px solid #333;border-radius:14px;padding:24px;min-width:360px;box-shadow:0 10px 40px rgba(0,0,0,0.6);';
        box.innerHTML = `
            <div style="font-size:16px;font-weight:700;margin-bottom:16px;color:#00D4FF;">📋 选择粘贴模式</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button class="rbt-paste-mode-btn" data-mode="fill" style="padding:12px 16px;border-radius:8px;border:1px solid #2a6b3a;background:#1a3a2a;color:#8f8;cursor:pointer;text-align:left;font-size:13px;">
                    <div style="font-weight:700;font-size:14px;margin-bottom:4px;">🔄 补全模式</div>
                    <div style="color:#aaa;font-size:12px;">只填充空行（没有文案的行），已有文案的行保持不动。多出的文案追加为新行。</div>
                </button>
                <button class="rbt-paste-mode-btn" data-mode="overwrite" style="padding:12px 16px;border-radius:8px;border:1px solid #b48b00;background:#3a3020;color:#ffd700;cursor:pointer;text-align:left;font-size:13px;">
                    <div style="font-weight:700;font-size:14px;margin-bottom:4px;">⚡ 覆盖模式</div>
                    <div style="color:#aaa;font-size:12px;">从第1行开始逐行覆盖文案（不改变背景/音频等其它数据）。多出的追加为新行。</div>
                </button>
                <button class="rbt-paste-mode-btn" data-mode="new" style="padding:12px 16px;border-radius:8px;border:1px solid #4466aa;background:#1a2540;color:#88bbff;cursor:pointer;text-align:left;font-size:13px;">
                    <div style="font-weight:700;font-size:14px;margin-bottom:4px;">➕ 新行模式</div>
                    <div style="color:#aaa;font-size:12px;">全部作为新行添加到末尾，不影响任何现有行。</div>
                </button>
            </div>
            <div style="margin-top:14px;text-align:right;">
                <button class="rbt-paste-cancel" style="padding:6px 16px;border-radius:6px;border:1px solid #555;background:transparent;color:#aaa;cursor:pointer;font-size:13px;">取消</button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        const close = (val) => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            resolve(val);
        };

        box.querySelectorAll('.rbt-paste-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => close(btn.dataset.mode));
            btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.85'; btn.style.transform = 'scale(1.01)'; });
            btn.addEventListener('mouseleave', () => { btn.style.opacity = '1'; btn.style.transform = 'scale(1)'; });
        });
        box.querySelector('.rbt-paste-cancel').addEventListener('click', () => close(null));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
    });
}

function _showPasteDialog() {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:10001;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `
            <div style="background:#1a1a3e;border-radius:12px;padding:24px;width:500px;">
                <h3 style="margin:0 0 12px;color:#00D4FF;">📋 粘贴表格数据</h3>
                <textarea id="rbt-paste-area" style="width:100%;height:200px;background:#12122a;border:1px solid #2a2a4a;border-radius:8px;color:#ddd;font-size:13px;padding:12px;" placeholder="从 Google 表格粘贴..."></textarea>
                <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">
                    <button id="rbt-paste-cancel" style="padding:8px 16px;background:#333;border:1px solid #555;border-radius:6px;color:#ccc;cursor:pointer;">取消</button>
                    <button id="rbt-paste-ok" style="padding:8px 16px;background:#00D4FF;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;">导入</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        const close = v => { document.body.removeChild(overlay); resolve(v); };
        overlay.querySelector('#rbt-paste-cancel').onclick = () => close(null);
        overlay.querySelector('#rbt-paste-ok').onclick = () => close(overlay.querySelector('#rbt-paste-area').value);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
        setTimeout(() => overlay.querySelector('#rbt-paste-area')?.focus(), 100);
    });
}

// ═══════════════════════════════════════════════════════
// 8. TSV Parser (same as overlay panel)
// ═══════════════════════════════════════════════════════

function _parseBatchTSV(raw) {
    const rows = [];
    let i = 0;
    const len = raw.length;
    while (i < len) {
        const cells = [];
        while (i < len) {
            let cell = '';
            if (raw[i] === '"') {
                i++;
                while (i < len) {
                    if (raw[i] === '"') {
                        if (i + 1 < len && raw[i + 1] === '"') { cell += '"'; i += 2; }
                        else { i++; break; }
                    } else { cell += raw[i++]; }
                }
            } else {
                while (i < len && raw[i] !== '\t' && raw[i] !== '\n' && raw[i] !== '\r') { cell += raw[i++]; }
            }
            cells.push(cell);
            if (i < len && raw[i] === '\t') { i++; continue; }
            if (i < len && (raw[i] === '\n' || raw[i] === '\r')) {
                if (raw[i] === '\r' && i + 1 < len && raw[i + 1] === '\n') i++;
                i++;
                break;
            }
        }
        if (cells.length > 0 && cells.some(c => c.trim())) {
            rows.push([cells[0] || '', cells[1] || '']);
        }
    }
    return rows;
}

// ═══════════════════════════════════════════════════════
// 9. Template helpers
// ═══════════════════════════════════════════════════════

function _getSubtitlePresetList() {
    try {
        if (window.ReelsStyleEngine && typeof ReelsStyleEngine.loadSubtitlePresets === 'function') {
            const data = ReelsStyleEngine.loadSubtitlePresets();
            return Object.keys(data.presets || {});
        }
    } catch (e) { }
    return [];
}

function _getOverlayGroupPresetList() {
    try {
        const stored = localStorage.getItem('reels_overlay_group_presets');
        if (stored) {
            const obj = JSON.parse(stored);
            return Object.keys(obj).map(name => ({
                name,
                count: Array.isArray(obj[name]) ? obj[name].length : 0,
            }));
        }
    } catch (e) { }
    // Fallback: also include single-card templates as 1-layer presets
    try {
        const stored = localStorage.getItem('reels_card_templates');
        if (stored) {
            const obj = JSON.parse(stored);
            return Object.keys(obj).map(name => ({ name, count: 1 }));
        }
    } catch (e) { }
    return [];
}

function _applyOverlayGroupPresetToTask(task, presetName) {
    try {
        // Try group presets first
        const groupStored = localStorage.getItem('reels_overlay_group_presets');
        if (groupStored) {
            const presets = JSON.parse(groupStored);
            if (presets[presetName] && Array.isArray(presets[presetName])) {
                const layers = presets[presetName];
                task.overlays = layers.map(layerData => {
                    const clone = JSON.parse(JSON.stringify(layerData));
                    clone.id = 'ov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                    // Preserve existing title/body text if already set in the task
                    return clone;
                });
                task._overlayPresetName = presetName;
                return;
            }
        }
        // Fallback: single card template
        const cardStored = localStorage.getItem('reels_card_templates');
        if (cardStored) {
            const templates = JSON.parse(cardStored);
            const tpl = templates[presetName];
            if (tpl) {
                if (!task.overlays || !task.overlays[0]) {
                    const ReelsOverlay = window.ReelsOverlay;
                    if (ReelsOverlay) {
                        task.overlays = [ReelsOverlay.createTextCardOverlay({
                            title_text: '', body_text: '',
                            start: 0, end: 9999,
                        })];
                    }
                }
                if (task.overlays && task.overlays[0]) {
                    const keepKeys = ['id', 'type', 'title_text', 'body_text', 'start', 'end'];
                    for (const [k, v] of Object.entries(tpl)) {
                        if (!keepKeys.includes(k)) task.overlays[0][k] = v;
                    }
                }
                task._overlayPresetName = presetName;
            }
        }
    } catch (e) { }
}

function _batchAddEmptyRow() {
    const state = window._reelsState;
    const ReelsOverlay = window.ReelsOverlay;
    if (!state || !ReelsOverlay) return;
    const taskName = `card_${String(state.tasks.length + 1).padStart(3, '0')}`;
    state.tasks.push({
        baseName: taskName,
        fileName: `${taskName}.mp4`,
        bgPath: null, bgSrcUrl: null,
        audioPath: null, srtPath: null,
        segments: [],
        videoPath: null, srcUrl: null,
        overlays: [],
    });
}

// ═══════════════════════════════════════════════════════
// 9a. Folder import (auto-classify + match)
// ═══════════════════════════════════════════════════════

const _BG_EXTS = new Set(['mp4', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'webm', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']);
const _AUDIO_EXTS = new Set(['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'wma']);
const _SRT_EXTS = new Set(['srt']);
const _TXT_EXTS = new Set(['txt']);

/**
 * 读取文件夹 → 自动按类型分类 → 同名配对 → 创建任务行
 */
function _batchImportFolder(files) {
    if (!files || !files.length) return;
    const state = window._reelsState;
    const ReelsOverlay = window.ReelsOverlay;
    if (!state) return;

    // 按类型分桶
    const bgFiles = [];
    const audioFiles = [];
    const srtFiles = [];
    const txtFiles = [];

    for (const f of files) {
        const name = f.name || '';
        // 跳过隐藏文件和系统文件
        if (name.startsWith('.') || name === 'Thumbs.db' || name === 'desktop.ini') continue;
        const ext = name.split('.').pop().toLowerCase();
        if (_BG_EXTS.has(ext)) bgFiles.push(f);
        else if (_AUDIO_EXTS.has(ext)) audioFiles.push(f);
        else if (_SRT_EXTS.has(ext)) srtFiles.push(f);
        else if (_TXT_EXTS.has(ext)) txtFiles.push(f);
    }

    if (!bgFiles.length && !audioFiles.length && !srtFiles.length && !txtFiles.length) {
        alert('文件夹中未找到支持的媒体文件');
        return;
    }

    // 提取基础匹配键（去除扩展名并应用 stopwords 过滤）
    function matchKey(f) {
        if (typeof window._buildAudioSubtitleMatchKey === 'function') {
            return window._buildAudioSubtitleMatchKey(f.name || '');
        }
        // 如果外部函数不可用，回退到基础去头尾处理
        const name = f.name || '';
        const dot = name.lastIndexOf('.');
        return (dot > 0 ? name.substring(0, dot) : name).trim().toLowerCase();
    }

    // 建立同名配对映射: matchKey → { bg, audio, srt, txt }
    const groups = new Map();

    function addToGroup(file, field) {
        const key = matchKey(file);
        if (!groups.has(key)) groups.set(key, { bg: null, audio: null, srt: null, txt: null });
        // 如果已经有该字段，优先保留第一个遇到的以稳定排序
        if (!groups.get(key)[field]) {
            groups.get(key)[field] = file;
        }
    }

    bgFiles.forEach(f => addToGroup(f, 'bg'));
    audioFiles.forEach(f => addToGroup(f, 'audio'));
    srtFiles.forEach(f => addToGroup(f, 'srt'));
    txtFiles.forEach(f => addToGroup(f, 'txt'));

    // 按名称排序
    const sortedKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b));

    let created = 0;
    for (const bn of sortedKeys) {
        const g = groups.get(bn);
        const taskName = bn || `task_${String(state.tasks.length + 1).padStart(3, '0')}`;

        const task = {
            baseName: taskName,
            fileName: `${taskName}.mp4`,
            bgPath: g.bg ? (g.bg.path || g.bg.name) : null,
            bgSrcUrl: null,
            audioPath: g.audio ? (g.audio.path || g.audio.name) : null,
            srtPath: g.srt ? (g.srt.path || g.srt.name) : null,
            txtPath: g.txt ? (g.txt.path || g.txt.name) : null,
            txtContent: null,
            aligned: false,
            segments: [],
            videoPath: g.bg ? (g.bg.path || g.bg.name) : null,
            srcUrl: null,
            overlays: [],
        };

        // 生成预览 URL
        if (g.bg) {
            try { task.bgSrcUrl = URL.createObjectURL(g.bg); } catch (e) { }
        }

        // 读取 SRT 内容
        if (g.srt) {
            _readSrtFileToTask(task, g.srt);
        }

        // 读取 TXT 内容
        if (g.txt) {
            _readTxtFileToTask(task, g.txt);
        }

        state.tasks.push(task);
        created++;
    }

    _renderBatchTable();
    if (typeof _renderTaskList === 'function') _renderTaskList();

    const summary = [];
    if (bgFiles.length) summary.push(`${bgFiles.length} 个背景`);
    if (audioFiles.length) summary.push(`${audioFiles.length} 个音频`);
    if (srtFiles.length) summary.push(`${srtFiles.length} 个字幕`);
    if (txtFiles.length) summary.push(`${txtFiles.length} 个TXT文案`);
    alert(`✅ 从文件夹导入 ${created} 个任务\n检测到: ${summary.join(', ')}\n同名文件已自动配对`);
}

// ═══════════════════════════════════════════════════════
// 9b. File assignment helpers
// ═══════════════════════════════════════════════════════

/**
 * 显示批量分配模式对话框
 */
function _showBatchModeDialog(fileCount, field) {
    const fieldLabel = { bg: '背景素材', audio: '音频', srt: '字幕', txt: 'TXT' }[field] || field;
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;';
        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#1e1e2e;border:1px solid #444;border-radius:12px;padding:24px;min-width:320px;color:#eee;font-size:14px;';
        const isSingle = fileCount === 1;
        dialog.innerHTML = `
            <h3 style="margin:0 0 14px;font-size:16px;">📂 批量${fieldLabel} · ${fileCount} 个文件</h3>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <button data-mode="fill" style="padding:10px 16px;border:1px solid #555;border-radius:8px;background:#2a3a4a;color:#cce;cursor:pointer;text-align:left;font-size:13px;">
                    📥 <b>补全</b> — 填入空位，多余的添加新行
                </button>
                <button data-mode="overwrite" style="padding:10px 16px;border:1px solid #555;border-radius:8px;background:#4a2a2a;color:#ecc;cursor:pointer;text-align:left;font-size:13px;">
                    ✏️ <b>覆盖</b> — 从第1行开始覆盖
                </button>
                <button data-mode="append" style="padding:10px 16px;border:1px solid #555;border-radius:8px;background:#2a4a2a;color:#cec;cursor:pointer;text-align:left;font-size:13px;">
                    ➕ <b>添加新行</b> — 全部作为新行追加
                </button>
                ${isSingle ? `<button data-mode="applyall" style="padding:10px 16px;border:1px solid #7b5aab;border-radius:8px;background:#3a2a5a;color:#d0b0ff;cursor:pointer;text-align:left;font-size:13px;">
                    🔄 <b>应用到全部行</b> — 所有行都用这个文件
                </button>` : ''}
            </div>
            <button data-mode="cancel" style="margin-top:12px;padding:6px 16px;border:1px solid #555;border-radius:6px;background:#333;color:#aaa;cursor:pointer;width:100%;font-size:13px;">取消</button>
        `;
        dialog.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.remove();
                resolve(btn.dataset.mode);
            });
        });
        overlay.appendChild(dialog);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve('cancel'); } });
        document.body.appendChild(overlay);
    });
}

/** 将文件应用到任务 */
function _assignFileToTask(task, file, field) {
    const filePath = file.path || file.name;
    if (field === 'bg') {
        task.bgPath = filePath;
        task.videoPath = filePath;
        try { task.bgSrcUrl = URL.createObjectURL(file); } catch (e) { }
    } else if (field === 'audio') {
        task.audioPath = filePath;
    } else if (field === 'srt') {
        task.srtPath = filePath;
        _readSrtFileToTask(task, file);
    } else if (field === 'txt') {
        task.txtPath = filePath;
        _readTxtFileToTask(task, file);
    }
}

/** 创建空行 */
function _createEmptyTask() {
    const state = window._reelsState;
    const ReelsOverlay = window.ReelsOverlay;
    const taskName = `card_${String((state.tasks || []).length + 1).padStart(3, '0')}`;
    return {
        baseName: taskName,
        fileName: `${taskName}.mp4`,
        bgPath: null, bgSrcUrl: null,
        audioPath: null, srtPath: null,
        segments: [],
        videoPath: null, srcUrl: null,
        overlays: [],
    };
}

/**
 * 批量分配文件到各行 — 支持多种模式
 */
async function _batchAssignFiles(files, field) {
    const state = window._reelsState;
    if (!state || !files || files.length === 0) return;

    files.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const mode = await _showBatchModeDialog(files.length, field);
    if (mode === 'cancel') return;

    if (mode === 'applyall') {
        // 应用单个文件到所有现有行
        const file = files[0];
        for (const task of state.tasks) {
            _assignFileToTask(task, file, field);
        }
    } else if (mode === 'fill') {
        // 补全：填入空位
        let taskIdx = 0;
        for (const file of files) {
            // 找空位
            while (taskIdx < state.tasks.length) {
                const tk = state.tasks[taskIdx];
                let occupied = false;
                if (field === 'bg') occupied = !!(tk.bgPath || tk.videoPath);
                else if (field === 'audio') occupied = !!tk.audioPath;
                else if (field === 'srt') occupied = !!tk.srtPath;
                else if (field === 'txt') occupied = !!tk.txtPath;
                if (!occupied) break;
                taskIdx++;
            }
            if (taskIdx >= state.tasks.length) {
                const newTask = _createEmptyTask();
                state.tasks.push(newTask);
            }
            _assignFileToTask(state.tasks[taskIdx], file, field);
            taskIdx++;
        }
    } else if (mode === 'overwrite') {
        // 覆盖：从第1行开始
        for (let i = 0; i < files.length; i++) {
            if (i >= state.tasks.length) {
                state.tasks.push(_createEmptyTask());
            }
            _assignFileToTask(state.tasks[i], files[i], field);
        }
    } else if (mode === 'append') {
        // 添加新行
        for (const file of files) {
            const newTask = _createEmptyTask();
            _assignFileToTask(newTask, file, field);
            state.tasks.push(newTask);
        }
    }

    _renderBatchTable();
    if (typeof _renderTaskList === 'function') _renderTaskList();
}

/**
 * 批量分配 TXT 文件到各行
 * 1. 先按 matchKey 尝试匹配已有行（同名视频/音频）
 * 2. 没匹配到则顺序找「有背景但还没有 txtContent」的行
 * 3. 还没有就新建行
 */
function _batchAssignTxtFiles(files) {
    const state = window._reelsState;
    if (!state) return;
    const ReelsOverlay = window.ReelsOverlay;

    function getMatchKey(name) {
        if (typeof window._buildAudioSubtitleMatchKey === 'function') {
            return window._buildAudioSubtitleMatchKey(name || '');
        }
        const n = String(name || '');
        const dot = n.lastIndexOf('.');
        return (dot > 0 ? n.substring(0, dot) : n).trim().toLowerCase();
    }

    files.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    let fallbackIdx = 0;
    for (const file of files) {
        const filePath = file.path || file.name;
        const key = getMatchKey(file.name);

        // 尝试按名字匹配已有行（用 matchKey 比较）
        let targetTask = state.tasks.find(t => {
            const bgKey = getMatchKey(t.bgPath || t.videoPath || '');
            const audioKey = getMatchKey(t.audioPath || '');
            const baseKey = getMatchKey(t.baseName || '');
            return (bgKey && bgKey === key) || (audioKey && audioKey === key) || (baseKey && baseKey === key);
        });

        // 没匹配到：顺序找「有背景但还没有 txtContent」的行
        if (!targetTask) {
            while (fallbackIdx < state.tasks.length) {
                const tk = state.tasks[fallbackIdx];
                if (!tk.txtContent && !tk.srtPath) {
                    targetTask = tk;
                    break;
                }
                fallbackIdx++;
            }
        }

        // 还没找到则新建行
        if (!targetTask) {
            const baseName = key || `card_${String(state.tasks.length + 1).padStart(3, '0')}`;
            targetTask = {
                baseName: baseName,
                fileName: `${baseName}.mp4`,
                bgPath: null, bgSrcUrl: null,
                audioPath: null, srtPath: null,
                segments: [],
                videoPath: null, srcUrl: null,
                overlays: [],
            };
            state.tasks.push(targetTask);
            fallbackIdx = state.tasks.length;
        }

        targetTask.txtPath = filePath;
        targetTask.aligned = false;

        // 异步读取文件内容
        _readTxtFileToTask(targetTask, file);

        fallbackIdx++;
    }

    _renderBatchTable();
    if (typeof _renderTaskList === 'function') _renderTaskList();
    alert(`✅ 已分配 ${files.length} 个 TXT 文案文件`);
}

/**
 * 点击单元格 → 选择一个文件
 */
function _pickSingleFile(idx, field) {
    const container = _batchTableState.container;
    if (!container) return;
    const fileInput = container.querySelector('#rbt-file-single');
    if (!fileInput) return;

    // 根据字段设置 accept
    if (field === 'bg') {
        fileInput.accept = '.mp4,.mov,.mkv,.avi,.wmv,.flv,.webm,.jpg,.jpeg,.png,.webp';
    } else if (field === 'audio') {
        fileInput.accept = '.mp3,.wav,.m4a,.aac,.flac,.ogg';
    } else if (field === 'srt') {
        fileInput.accept = '.srt';
    } else if (field === 'txt') {
        fileInput.accept = '.txt';
    }

    _batchTableState._pendingSingle = { idx, field };
    fileInput.click();
}

/**
 * 分配单个文件到指定行
 */
function _assignSingleFile(idx, field, file) {
    const state = window._reelsState;
    if (!state || !state.tasks[idx]) return;
    const task = state.tasks[idx];
    const filePath = file.path || file.name;

    if (field === 'bg') {
        task.bgPath = filePath;
        task.videoPath = filePath;
        try { task.bgSrcUrl = URL.createObjectURL(file); } catch (e) { }
    } else if (field === 'audio') {
        task.audioPath = filePath;
    } else if (field === 'srt') {
        task.srtPath = filePath;
        _readSrtFileToTask(task, file);
    } else if (field === 'txt') {
        task.txtPath = filePath;
        _readTxtFileToTask(task, file);
    }

    _renderBatchTable();
    if (typeof _renderTaskList === 'function') _renderTaskList();
}

/**
 * 读取 SRT 文件内容到 task.segments
 */
function _readSrtFileToTask(task, file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const content = ev.target.result;
        if (typeof _parseSrt === 'function') {
            task.segments = _parseSrt(content);
        } else {
            // 简单解析
            task.segments = [];
        }
    };
    reader.readAsText(file);
}

/**
 * 读取 TXT 文件内容到 task.txtContent
 */
function _readTxtFileToTask(task, file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        task.txtContent = ev.target.result || '';
        task.aligned = false;
        // 刷新表格显示加载的文案
        if (_batchTableState.visible) _renderBatchTable();
    };
    reader.readAsText(file);
}

/**
 * 智能断行 (批量表格内用)
 * 英文 ~5 词/行，中文 ~16 字/行，已有换行保留
 */
function _rbtSmartLineBreak(text) {
    if (!text || typeof text !== 'string') return text;
    // 按行处理，保留已有换行
    const lines = text.split('\n');
    const result = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length <= 10) { result.push(trimmed); continue; }

        const cjkCount = (trimmed.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
        const isCJK = cjkCount / trimmed.length > 0.3;

        if (isCJK) {
            const maxChars = 16;
            let pos = 0;
            while (pos < trimmed.length) {
                let end = Math.min(pos + maxChars, trimmed.length);
                if (end < trimmed.length) {
                    const chunk = trimmed.slice(pos, end + 4);
                    const breakAt = chunk.search(/[，。！？；、\s,\.!?;]/g);
                    if (breakAt > maxChars * 0.5) end = pos + breakAt + 1;
                }
                result.push(trimmed.slice(pos, end).trim());
                pos = end;
                while (pos < trimmed.length && trimmed[pos] === ' ') pos++;
            }
        } else {
            const words = trimmed.split(/\s+/);
            if (words.length <= 5) { result.push(trimmed); continue; }
            for (let i = 0; i < words.length; i += 5) {
                result.push(words.slice(i, i + 5).join(' '));
            }
        }
    }
    return result.filter(l => l).join('\n');
}

// ═══════════════════════════════════════════════════════
// 10. Batch Alignment (对齐字幕)
// ═══════════════════════════════════════════════════════

async function _batchAlignAllTasks() {
    // 先同步表格输入到 task
    _applyBatchTableChanges();

    const state = window._reelsState;
    if (!state) return;

    const alignSource = document.getElementById('rbt-align-source')?.value || 'audio';
    const forceRealign = document.getElementById('rbt-force-realign')?.checked || false;

    // 筛选需要对齐的任务: 有文案内容 + 有音频源 + (未对齐 或 强制)
    const tasksToAlign = state.tasks.filter(t => {
        if (!t.txtContent || !t.txtContent.trim()) return false;
        if (t.aligned && !forceRealign) return false;
        const hasAudio = alignSource === 'video'
            ? (t.bgPath || t.videoPath)
            : t.audioPath;
        return !!hasAudio;
    });

    if (tasksToAlign.length === 0) {
        alert('没有需要对齐的任务。\n请确认：\n1. 文案内容列有文案\n2. 有音频/视频文件\n3. 尚未对齐');
        return;
    }

    const progressEl = document.getElementById('rbt-align-progress');
    const alignBtn = document.getElementById('rbt-align-all-btn');
    if (alignBtn) { alignBtn.disabled = true; alignBtn.textContent = '⏳ 对齐中...'; }

    let ok = 0, fail = 0;
    const failDetails = [];
    const language = document.getElementById('rbt-align-lang')?.value || '英语';

    for (let i = 0; i < tasksToAlign.length; i++) {
        const task = tasksToAlign[i];
        const taskName = task.baseName || task.fileName || `任务${i + 1}`;
        if (progressEl) progressEl.textContent = `🔗 对齐 ${i + 1}/${tasksToAlign.length}: ${taskName}`;

        try {
            // 确定音频路径
            const audioPath = alignSource === 'video'
                ? (task.bgPath || task.videoPath)
                : task.audioPath;

            if (!audioPath) throw new Error('没有音频文件');

            // 自动断行文案
            task.txtContent = _rbtSmartLineBreak(task.txtContent);

            // 调用对齐API（使用 apiFetch + API_BASE）
            const audioDir = audioPath.replace(/[\\/][^\\/]+$/, '');
            const resp = await apiFetch(`${API_BASE}/subtitle/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio_path: audioPath,
                    source_text: task.txtContent,
                    language: language,
                    audio_cut_length: 5.0,
                    output_dir: audioDir,
                    force: task.aligned ? true : false,  // 已对齐过则强制重新转录
                }),
            });

            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error || '对齐失败');
            }

            const data = await resp.json();

            // 保存 SRT 路径并解析 segments
            if (data.files && data.files.length > 0) {
                const srtFile = data.files.find(f => f.endsWith('_source.srt')) || data.files[0];
                task.srtPath = srtFile;

                if (window.electronAPI && window.electronAPI.readFileText) {
                    const srtContent = await window.electronAPI.readFileText(srtFile);
                    const rawSegs = (typeof parseSRT === 'function' ? parseSRT(srtContent) : []).map(seg => ({ ...seg, _timeUnit: 'sec' }));
                    task.segments = window.ReelsSubtitleProcessor
                        ? ReelsSubtitleProcessor.srtToSegmentsWithWords(rawSegs)
                        : rawSegs;
                }
            }

            task.aligned = true;
            ok++;
        } catch (err) {
            console.error('[BatchAlign] Failed:', taskName, err);
            failDetails.push(`${taskName}: ${err.message}`);
            fail++;
        }
    }

    // 完成
    if (alignBtn) { alignBtn.disabled = false; alignBtn.textContent = '🔗 对齐字幕'; }
    if (progressEl) {
        progressEl.textContent = fail > 0
            ? `⚠️ 对齐完成 ${ok}/${tasksToAlign.length}，失败 ${fail}`
            : `✅ 全部对齐完成 (${ok}个)`;
        setTimeout(() => { if (progressEl) progressEl.textContent = ''; }, 8000);
    }

    _renderBatchTable();
    if (typeof _renderTaskList === 'function') _renderTaskList();

    if (fail > 0) {
        alert(`对齐完成 ${ok}/${tasksToAlign.length}\n\n失败:\n${failDetails.slice(0, 5).join('\n')}`);
    } else {
        alert(`✅ 字幕对齐完成 ${ok} 个任务\nSRT 文件已自动保存到音频文件所在目录`);
    }
}

// ═══════════════════════════════════════════════════════
// 11. Utility
// ═══════════════════════════════════════════════════════

function _shortName(path) {
    if (!path) return '';
    const parts = path.replace(/\\/g, '/').split('/');
    const name = parts[parts.length - 1] || '';
    return name.length > 20 ? name.slice(0, 18) + '…' : name;
}

function _escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════════════════════
// 11. CSS injection
// ═══════════════════════════════════════════════════════

let _batchTableCSSInjected = false;
function _injectBatchTableCSS() {
    if (_batchTableCSSInjected) return;
    _batchTableCSSInjected = true;
    const style = document.createElement('style');
    style.textContent = `
        .rbt-panel {
            display:flex; flex-direction:column; width:95vw; max-width:1600px; height:90vh;
            background:#0d0d2b; border:1px solid #1a1a4a; border-radius:16px;
            box-shadow:0 30px 80px rgba(0,0,0,0.7); margin:auto; overflow:hidden;
        }
        .rbt-header {
            display:flex; justify-content:space-between; align-items:center;
            padding:16px 24px; border-bottom:1px solid #1a1a4a; background:#12123a;
        }
        .rbt-header h2 { margin:0; font-size:18px; color:#00D4FF; }
        .rbt-actions { display:flex; gap:8px; }
        .rbt-btn {
            padding:6px 14px; border-radius:6px; border:1px solid #333; background:#222;
            color:#ccc; font-size:12px; cursor:pointer; transition:all .15s;
        }
        .rbt-btn:hover { background:#333; color:#fff; }
        .rbt-btn-accent { background:#00D4FF; color:#000; border-color:#00D4FF; font-weight:bold; }
        .rbt-btn-accent:hover { background:#00BBDD; }
        .rbt-btn-primary { background:#00D4FF; color:#000; border:none; font-weight:bold; padding:8px 24px; font-size:14px; }
        .rbt-btn-primary:hover { background:#00BBDD; }
        .rbt-btn-danger { border-color:#f44; color:#f44; }
        .rbt-btn-danger:hover { background:#f44; color:#fff; }
        .rbt-btn-folder { background:#2a6b3a; color:#8f8; border-color:#3a8b4a; font-weight:600; }
        .rbt-btn-folder:hover { background:#3a8b4a; color:#fff; }
        .rbt-table-wrap {
            flex:1; overflow:auto; padding:0;
        }
        .rbt-table {
            width:100%; border-collapse:collapse; font-size:12px;
        }
        .rbt-table thead { position:sticky; top:0; z-index:2; }
        .rbt-table th {
            padding:10px 8px; background:#1a1a4a; color:#aaa; font-weight:600;
            text-align:left; border-bottom:2px solid #2a2a6a; white-space:nowrap;
        }
        .rbt-table td {
            padding:6px 8px; border-bottom:1px solid #1a1a3a; vertical-align:top;
        }
        .rbt-row:hover { background:rgba(0,212,255,0.05); }
        .rbt-row-selected { background:rgba(0,212,255,0.1) !important; }
        .rbt-col-num { width:40px; text-align:center; color:#666; font-weight:bold; }
        .rbt-col-bg { width:140px; }
        .rbt-col-audio { width:120px; }
        .rbt-col-srt { width:120px; }
        .rbt-col-txtcontent { min-width:180px; max-width:280px; }
        .rbt-col-bgm { width:140px; }
        .rbt-col-title { width:200px; }
        .rbt-col-body { min-width:250px; }
        .rbt-col-footer { min-width:180px; }
        .rbt-col-dur { width:70px; text-align:center; }
        .rbt-col-tpl { width:120px; }
        .rbt-col-act { width:70px; white-space:nowrap; }
        .rbt-file-name {
            display:block; padding:4px 6px; background:#12122a; border:1px dashed #2a2a4a;
            border-radius:4px; color:#8888cc; font-size:11px; min-height:28px;
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:default;
        }
        .rbt-placeholder { color:#444; font-style:italic; }
        .rbt-textarea {
            width:100%; padding:4px 6px; background:#12122a; border:1px solid #2a2a4a;
            border-radius:4px; color:#ddd; font-size:12px; resize:vertical; min-height:40px;
            font-family:inherit;
        }
        .rbt-textarea:focus { border-color:#00D4FF; outline:none; }
        .rbt-select {
            width:100%; padding:4px; background:#12122a; border:1px solid #2a2a4a;
            border-radius:4px; color:#ddd; font-size:11px;
        }
        .rbt-row-btn {
            padding:2px 6px; background:none; border:1px solid transparent;
            cursor:pointer; font-size:14px; border-radius:4px;
        }
        .rbt-row-btn:hover { background:rgba(255,255,255,0.1); }
        .rbt-field-clear {
            background:none; border:none; color:#888; cursor:pointer;
            font-size:11px; padding:1px 4px; border-radius:3px; line-height:1;
            flex-shrink:0; opacity:0.6; transition:all 0.15s;
        }
        .rbt-field-clear:hover { color:#ff6b6b; opacity:1; background:rgba(255,107,107,0.15); }
        .rbt-footer {
            display:flex; justify-content:space-between; align-items:center;
            padding:12px 24px; border-top:1px solid #1a1a4a; background:#12123a;
        }
        #rbt-count { color:#888; font-size:13px; }
        .rbt-droppable.rbt-drag-over {
            border-color:#00D4FF !important; background:rgba(0,212,255,0.1) !important;
        }
        .rbt-hidden-input { display:none !important; }
        .rbt-sep {
            display:inline-block; width:1px; height:20px; background:#333; margin:0 4px;
        }
        .rbt-file-name { cursor:pointer !important; }
        .rbt-file-name:hover { border-color:#00D4FF !important; color:#00D4FF !important; }
        .rbt-footer-hint { font-size:11px; color:#555; }
    `;
    document.head.appendChild(style);
}

// ═══════════════════════════════════════════════════════
// 12. Config Save / Load / Auto-save
// ═══════════════════════════════════════════════════════

const BATCH_CONFIG_KEY = 'reels_batch_config_autosave';

/** 序列化任务数据（去掉不可序列化的部分） */
function _serializeTasks(tasks) {
    return (tasks || []).map(t => {
        const o = { ...t };
        // 去掉 DOM / Video 等不可序列化的引用
        delete o._video;
        delete o._bgThumb;
        // 去掉 blob: URL（页面刷新后失效，渲染时会从 bgPath 重新生成 file:// URL）
        if (o.bgSrcUrl && String(o.bgSrcUrl).startsWith('blob:')) o.bgSrcUrl = null;
        if (o.srcUrl && String(o.srcUrl).startsWith('blob:')) o.srcUrl = null;
        return o;
    });
}

/** 自动保存到 localStorage */
function _batchAutoSave() {
    try {
        const data = {
            timestamp: new Date().toISOString(),
            tasks: _serializeTasks(window._reelsState.tasks),
        };
        localStorage.setItem(BATCH_CONFIG_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('[BatchTable] Auto-save failed:', e.message);
    }
}

/** 自动恢复 */
function _batchAutoRestore() {
    try {
        const raw = localStorage.getItem(BATCH_CONFIG_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.tasks && data.tasks.length > 0) {
            const existing = window._reelsState.tasks || [];
            if (existing.length === 0) {
                window._reelsState.tasks = data.tasks;
                console.log(`[BatchTable] Auto-restored ${data.tasks.length} tasks from ${data.timestamp}`);
            }
        }
    } catch (e) {
        console.warn('[BatchTable] Auto-restore failed:', e.message);
    }
}

/** 导出配置为 JSON 文件 */
function _batchExportConfig() {
    const tasks = window._reelsState.tasks || [];
    if (tasks.length === 0) {
        alert('没有任务可以保存');
        return;
    }
    const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        tasks: _serializeTasks(tasks),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`[BatchTable] Exported ${tasks.length} tasks`);
}

/** 从 JSON 文件导入配置 */
function _batchImportConfig(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const tasks = data.tasks;
            if (!Array.isArray(tasks) || tasks.length === 0) {
                alert('配置文件中没有任务数据');
                return;
            }
            const mode = (window._reelsState.tasks || []).length > 0
                ? confirm(`当前有 ${window._reelsState.tasks.length} 个任务。\n\n确定 = 替换全部\n取消 = 追加到末尾`)
                    ? 'replace'
                    : 'append'
                : 'replace';

            if (mode === 'replace') {
                window._reelsState.tasks = tasks;
            } else {
                window._reelsState.tasks = (window._reelsState.tasks || []).concat(tasks);
            }
            _renderBatchTable();
            alert(`成功加载 ${tasks.length} 个任务 (${data.timestamp || ''})`);
        } catch (err) {
            alert(`配置文件解析失败: ${err.message}`);
        }
    };
    reader.readAsText(file);
}

// ═══════════════════════════════════════════════════════
// 13. Auto-initialize
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    _batchAutoRestore();
    _initBatchTable();

    // 每30秒自动保存一次（安全网）
    setInterval(() => {
        if (window._reelsState && (window._reelsState.tasks || []).length > 0) {
            _batchAutoSave();
        }
    }, 30000);
});

// 关闭/刷新前保存
window.addEventListener('beforeunload', () => {
    if (window._reelsState && (window._reelsState.tasks || []).length > 0) {
        _batchAutoSave();
    }
});

// Expose
window.reelsToggleBatchTable = reelsToggleBatchTable;
