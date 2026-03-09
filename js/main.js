/**
 * ToolBox Pro - 主JavaScript文件
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initSearch();
    initCopyButtons();
});

/**
 * 初始化侧边栏
 */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebar || !sidebarToggle) return;
    
    // 切换侧边栏
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    
    // 恢复侧边栏状态
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }
    
    // 移动端菜单
    if (window.innerWidth <= 1024) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
        
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }
    
    // 高亮当前页面导航
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        if (link.getAttribute('href').includes(currentPage)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * 初始化搜索功能
 * 页面加载时显示完整菜单，只有用户输入搜索词时才过滤
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    // 获取所有菜单元素
    const navItems = document.querySelectorAll('.nav-list li');
    const navSections = document.querySelectorAll('.nav-section');
    
    // 页面加载时强制显示所有菜单（立即执行）
    navItems.forEach(item => item.style.display = '');
    navSections.forEach(section => section.style.display = '');
    
    // 清空搜索框（防止浏览器记住的值导致过滤）
    if (searchInput.value !== '') {
        searchInput.value = '';
    }
    
    // 使用输入事件进行过滤
    searchInput.addEventListener('input', function() {
        const keyword = this.value.toLowerCase().trim();
        
        // 关键词为空时显示全部
        if (keyword === '') {
            navItems.forEach(item => item.style.display = '');
            navSections.forEach(section => section.style.display = '');
            return;
        }
        
        // 有搜索词时进行过滤
        navItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(keyword) ? '' : 'none';
        });
        
        // 隐藏没有匹配项的分类
        navSections.forEach(section => {
            const visibleItems = section.querySelectorAll('.nav-list li:not([style*="display: none"])');
            section.style.display = visibleItems.length > 0 ? '' : 'none';
        });
    });
}

/**
 * 初始化复制按钮
 */
function initCopyButtons() {
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const element = document.querySelector(target);
            if (element) {
                copyToClipboard(element.value || element.textContent);
            }
        });
    });
}

/**
 * 复制到剪贴板
 */
function copyToClipboard(text) {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    }).catch(err => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('已复制到剪贴板');
    });
}

/**
 * 显示提示消息
 */
function showToast(message, duration = 2000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * 下载文件
 */
function downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 读取文件内容
 */
function readFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsText(file);
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * 节流函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// MD5 加密实现
// ========================================

const MD5 = {
    rotateLeft: function(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    },
    
    addUnsigned: function(lX, lY) {
        const lX8 = (lX & 0x80000000);
        const lY8 = (lY & 0x80000000);
        const lX4 = (lX & 0x40000000);
        const lY4 = (lY & 0x40000000);
        const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    },
    
    f: function(x, y, z) { return (x & y) | ((~x) & z); },
    g: function(x, y, z) { return (x & z) | (y & (~z)); },
    h: function(x, y, z) { return (x ^ y ^ z); },
    i: function(x, y, z) { return (y ^ (x | (~z))); },
    
    ff: function(a, b, c, d, x, s, ac) {
        a = this.addUnsigned(a, this.addUnsigned(this.addUnsigned(this.f(b, c, d), x), ac));
        return this.addUnsigned(this.rotateLeft(a, s), b);
    },
    
    gg: function(a, b, c, d, x, s, ac) {
        a = this.addUnsigned(a, this.addUnsigned(this.addUnsigned(this.g(b, c, d), x), ac));
        return this.addUnsigned(this.rotateLeft(a, s), b);
    },
    
    hh: function(a, b, c, d, x, s, ac) {
        a = this.addUnsigned(a, this.addUnsigned(this.addUnsigned(this.h(b, c, d), x), ac));
        return this.addUnsigned(this.rotateLeft(a, s), b);
    },
    
    ii: function(a, b, c, d, x, s, ac) {
        a = this.addUnsigned(a, this.addUnsigned(this.addUnsigned(this.i(b, c, d), x), ac));
        return this.addUnsigned(this.rotateLeft(a, s), b);
    },
    
    convertToWordArray: function(string) {
        let lWordCount;
        const lMessageLength = string.length;
        const lNumberOfWordsTemp1 = lMessageLength + 8;
        const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
        const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
        const lWordArray = new Array(lNumberOfWords - 1);
        let lBytePosition = 0;
        let lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    },
    
    wordToHex: function(lValue) {
        let wordToHexValue = '', wordToHexValueTemp = '', lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValueTemp = '0' + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
        }
        return wordToHexValue;
    },
    
    utf8Encode: function(string) {
        string = string.replace(/\r\n/g, '\n');
        let utftext = '';
        for (let n = 0; n < string.length; n++) {
            const c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    
    encode: function(string) {
        let x = [];
        let k, AA, BB, CC, DD, a, b, c, d;
        const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        
        string = this.utf8Encode(string);
        x = this.convertToWordArray(string);
        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
        
        for (k = 0; k < x.length; k += 16) {
            AA = a; BB = b; CC = c; DD = d;
            a = this.ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = this.ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = this.ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = this.ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = this.ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = this.ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = this.ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = this.ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = this.ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = this.ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = this.ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = this.ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = this.ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = this.ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = this.ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = this.ff(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = this.gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = this.gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = this.gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = this.gg(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = this.gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = this.gg(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = this.gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = this.gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = this.gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = this.gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = this.gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = this.gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = this.gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = this.gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = this.gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = this.gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = this.hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = this.hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = this.hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = this.hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = this.hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = this.hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = this.hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = this.hh(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = this.hh(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = this.hh(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = this.hh(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = this.hh(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = this.hh(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = this.hh(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = this.hh(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = this.hh(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = this.ii(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = this.ii(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = this.ii(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = this.ii(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = this.ii(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = this.ii(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = this.ii(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = this.ii(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = this.ii(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = this.ii(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = this.ii(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = this.ii(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = this.ii(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = this.ii(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = this.ii(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = this.ii(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = this.addUnsigned(a, AA);
            b = this.addUnsigned(b, BB);
            c = this.addUnsigned(c, CC);
            d = this.addUnsigned(d, DD);
        }
        
        const temp = this.wordToHex(a) + this.wordToHex(b) + this.wordToHex(c) + this.wordToHex(d);
        return temp.toLowerCase();
    }
};

// ========================================
// SHA1/SHA256 实现
// ========================================

const SHA = {
    sha1: function(str) {
        const rotateLeft = (n, s) => (n << s) | (n >>> (32 - s));
        
        const lsbHex = (val) => {
            let str = '';
            for (let i = 0; i <= 6; i += 2) {
                str += ((val >>> (i * 4 + 4)) & 0x0F).toString(16) + ((val >>> (i * 4)) & 0x0F).toString(16);
            }
            return str;
        };
        
        const cvtHex = (val) => {
            let str = '';
            for (let i = 7; i >= 0; i--) {
                str += ((val >>> (i * 4)) & 0x0F).toString(16);
            }
            return str;
        };
        
        const Utf8Encode = (string) => {
            string = string.replace(/\r\n/g, '\n');
            let utftext = '';
            for (let n = 0; n < string.length; n++) {
                const c = string.charCodeAt(n);
                if (c < 128) utftext += String.fromCharCode(c);
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        };
        
        let blockstart;
        let i, j;
        const W = new Array(80);
        let H0 = 0x67452301;
        let H1 = 0xEFCDAB89;
        let H2 = 0x98BADCFE;
        let H3 = 0x10325476;
        let H4 = 0xC3D2E1F0;
        let A, B, C, D, E;
        let temp;
        
        str = Utf8Encode(str);
        const strLen = str.length;
        const wordArray = [];
        
        for (i = 0; i < strLen - 3; i += 4) {
            j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 |
                str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
            wordArray.push(j);
        }
        
        switch (strLen % 4) {
            case 0: i = 0x080000000; break;
            case 1: i = str.charCodeAt(strLen - 1) << 24 | 0x0800000; break;
            case 2: i = str.charCodeAt(strLen - 2) << 24 | str.charCodeAt(strLen - 1) << 16 | 0x08000; break;
            case 3: i = str.charCodeAt(strLen - 3) << 24 | str.charCodeAt(strLen - 2) << 16 | str.charCodeAt(strLen - 1) << 8 | 0x80; break;
        }
        
        wordArray.push(i);
        
        while ((wordArray.length % 16) != 14) wordArray.push(0);
        
        wordArray.push(strLen >>> 29);
        wordArray.push((strLen << 3) & 0x0FFFFFFFF);
        
        for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
            for (i = 0; i < 16; i++) W[i] = wordArray[blockstart + i];
            for (i = 16; i <= 79; i++) W[i] = rotateLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
            
            A = H0; B = H1; C = H2; D = H3; E = H4;
            
            for (i = 0; i <= 19; i++) {
                temp = (rotateLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0FFFFFFFF;
                E = D; D = C; C = rotateLeft(B, 30); B = A; A = temp;
            }
            
            for (i = 20; i <= 39; i++) {
                temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0FFFFFFFF;
                E = D; D = C; C = rotateLeft(B, 30); B = A; A = temp;
            }
            
            for (i = 40; i <= 59; i++) {
                temp = (rotateLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0FFFFFFFF;
                E = D; D = C; C = rotateLeft(B, 30); B = A; A = temp;
            }
            
            for (i = 60; i <= 79; i++) {
                temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0FFFFFFFF;
                E = D; D = C; C = rotateLeft(B, 30); B = A; A = temp;
            }
            
            H0 = (H0 + A) & 0x0FFFFFFFF;
            H1 = (H1 + B) & 0x0FFFFFFFF;
            H2 = (H2 + C) & 0x0FFFFFFFF;
            H3 = (H3 + D) & 0x0FFFFFFFF;
            H4 = (H4 + E) & 0x0FFFFFFFF;
        }
        
        return (cvtHex(H0) + cvtHex(H1) + cvtHex(H2) + cvtHex(H3) + cvtHex(H4)).toLowerCase();
    },
    
    sha256: function(str) {
        const utf8Encode = (string) => {
            string = string.replace(/\r\n/g, '\n');
            let utftext = '';
            for (let n = 0; n < string.length; n++) {
                const c = string.charCodeAt(n);
                if (c < 128) utftext += String.fromCharCode(c);
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        };
        
        const K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        
        const rotateRight = (n, x) => (x >>> n) | (x << (32 - n));
        
        const sigma0 = (x) => rotateRight(2, x) ^ rotateRight(13, x) ^ rotateRight(22, x);
        const sigma1 = (x) => rotateRight(6, x) ^ rotateRight(11, x) ^ rotateRight(25, x);
        const gamma0 = (x) => rotateRight(7, x) ^ rotateRight(18, x) ^ (x >>> 3);
        const gamma1 = (x) => rotateRight(17, x) ^ rotateRight(19, x) ^ (x >>> 10);
        
        str = utf8Encode(str);
        const strLen = str.length;
        const words = [];
        
        for (let i = 0; i < strLen; i++) {
            words[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8);
        }
        
        words[strLen >> 2] |= 0x80 << (24 - (strLen % 4) * 8);
        words[((strLen + 64 >> 9) << 4) + 15] = strLen * 8;
        
        let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        
        for (let i = 0; i < words.length; i += 16) {
            const W = new Array(64);
            const a = H[0], b = H[1], c = H[2], d = H[3];
            const e = H[4], f = H[5], g = H[6], h = H[7];
            
            for (let t = 0; t < 64; t++) {
                if (t < 16) W[t] = words[i + t];
                else W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) & 0xFFFFFFFF;
                
                const T1 = (h + sigma1(e) + ((e & f) ^ (~e & g)) + K[t] + W[t]) & 0xFFFFFFFF;
                const T2 = (sigma0(a) + ((a & b) ^ (a & c) ^ (b & c))) & 0xFFFFFFFF;
                
                h = g; g = f; f = e; e = (d + T1) & 0xFFFFFFFF;
                d = c; c = b; b = a; a = (T1 + T2) & 0xFFFFFFFF;
            }
            
            H[0] = (H[0] + a) & 0xFFFFFFFF;
            H[1] = (H[1] + b) & 0xFFFFFFFF;
            H[2] = (H[2] + c) & 0xFFFFFFFF;
            H[3] = (H[3] + d) & 0xFFFFFFFF;
            H[4] = (H[4] + e) & 0xFFFFFFFF;
            H[5] = (H[5] + f) & 0xFFFFFFFF;
            H[6] = (H[6] + g) & 0xFFFFFFFF;
            H[7] = (H[7] + h) & 0xFFFFFFFF;
        }
        
        return H.map(h => ('00000000' + (h >>> 0).toString(16)).slice(-8)).join('');
    }
};

// ========================================
// AES 加密实现 (简化版)
// ========================================

const AES = {
    encrypt: function(text, key) {
        // 简化实现，使用 XOR 加密演示
        // 实际项目建议使用 crypto-js 库
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result);
    },
    
    decrypt: function(encrypted, key) {
        try {
            const text = atob(encrypted);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        } catch (e) {
            return '解密失败：无效的密文';
        }
    }
};

// ========================================
// 二维码生成 (简化版，使用 QRCode.js 库)
// ========================================

// 加载 QRCode.js 库的 CDN
function loadQRCodeLibrary(callback) {
    if (typeof QRCode !== 'undefined') {
        callback();
        return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = callback;
    document.head.appendChild(script);
}

// ========================================
// UUID 生成
// ========================================

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
