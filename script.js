// Обработчик кликов для заголовков
document.querySelectorAll('h2').forEach(header => {
    header.addEventListener('click', () => {
        header.classList.toggle('collapsed');
        const content = header.nextElementSibling;
        content.classList.toggle('collapsed');
        // Сохраняем состояние в localStorage
        const id = header.id;
        if (id) {
            localStorage.setItem(
                `${id}-collapsed`, 
                header.classList.contains('collapsed')
            );
        }
    });
});
// Кнопка "Свернуть/развернуть все"
document.querySelector('.toggle-all').addEventListener('click', () => {
    const headers = document.querySelectorAll('h2');
    const isCollapsed = headers[0].classList.contains('collapsed');
    headers.forEach(header => {
        if (isCollapsed) {
            header.classList.remove('collapsed');
            header.nextElementSibling.classList.remove('collapsed');
        } else {
            header.classList.add('collapsed');
            header.nextElementSibling.classList.add('collapsed');
        }
        // Сохраняем состояние в localStorage
        const id = header.id;
        if (id) {
            localStorage.setItem(
                `${id}-collapsed`, 
                header.classList.contains('collapsed')
            );
        }
    });
});
// Восстановление состояния из localStorage при загрузке
document.querySelectorAll('h2').forEach(header => {
    const id = header.id;
    if (id) {
        const savedState = localStorage.getItem(`${id}-collapsed`);
        if (savedState === 'true') {
            header.classList.add('collapsed');
            header.nextElementSibling.classList.add('collapsed');
        }
    }
});
// Поиск по содержимому
const searchInput = document.getElementById('search-input');
const searchCount = document.getElementById('search-count');
let currentSearchTerm = '';
let currentFilter = '';
// Быстрые фильтры
const quickFilters = document.querySelectorAll('.quick-filter');
quickFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        quickFilters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        currentFilter = filter.dataset.filter;
        performSearch(currentSearchTerm, currentFilter);
    });
});
// Функция поиска
function performSearch(term, filter = '') {
    currentSearchTerm = term;
    currentFilter = filter;
    if (!term.trim()) {
        // Если поисковая строка пуста, сбрасываем подсветку
        document.querySelectorAll('.highlight').forEach(el => {
            el.outerHTML = el.innerHTML;
        });
        searchCount.textContent = '0';
        return;
    }
    let totalMatches = 0;
    const regex = new RegExp(term, 'gi');
    // Ищем во всех cheatsheet блоках
    document.querySelectorAll('.cheatsheet').forEach(sheet => {
        const section = sheet.dataset.section;
        // Применяем фильтр
        if (filter && section !== filter) {
            sheet.style.display = 'none';
            return;
        } else {
            sheet.style.display = 'block';
        }
        let sectionMatches = 0;
        // Ищем в тексте и коде
        const elements = sheet.querySelectorAll('p, pre, code, .comment, h3');
        elements.forEach(el => {
            const originalContent = el.textContent;
            const highlightedContent = originalContent.replace(regex, match => {
                sectionMatches++;
                return `<span class="highlight">${match}</span>`;
            });
            if (highlightedContent !== originalContent) {
                el.innerHTML = highlightedContent;
            }
        });
        // Показываем количество совпадений в заголовке раздела
        const header = sheet.querySelector('h2');
        let countSpan = header.querySelector('.results-count');
        if (sectionMatches > 0) {
            totalMatches += sectionMatches;
            if (!countSpan) {
                countSpan = document.createElement('span');
                countSpan.className = 'results-count';
                header.appendChild(countSpan);
            }
            countSpan.textContent = sectionMatches;
            // Разворачиваем раздел с результатами
            header.classList.remove('collapsed');
            header.nextElementSibling.classList.remove('collapsed');
        } else if (countSpan) {
            countSpan.remove();
            // Сворачиваем раздел без результатов
            if (filter) {
                header.classList.add('collapsed');
                header.nextElementSibling.classList.add('collapsed');
            }
        }
    });
    searchCount.textContent = totalMatches;
}
// Обработчик ввода в поисковую строку
searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value, currentFilter);
});
// Обработчик нажатия клавиш
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchInput.value = '';
        performSearch('', currentFilter);
    }
});
// Восстановление состояния поиска при загрузке (если есть hash)
window.addEventListener('load', () => {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const searchParams = new URLSearchParams(hash);
        const searchTerm = searchParams.get('q');
        const filter = searchParams.get('filter');
        if (searchTerm) {
            searchInput.value = searchTerm;
            if (filter) {
                const filterElement = document.querySelector(`.quick-filter[data-filter="${filter}"]`);
                if (filterElement) {
                    quickFilters.forEach(f => f.classList.remove('active'));
                    filterElement.classList.add('active');
                    currentFilter = filter;
                }
            }
            performSearch(searchTerm, filter);
        }
    }
});
// Сохранение состояния поиска в URL
searchInput.addEventListener('input', debounce(() => {
    const searchParams = new URLSearchParams();
    if (currentSearchTerm) searchParams.set('q', currentSearchTerm);
    if (currentFilter) searchParams.set('filter', currentFilter);
    window.history.replaceState(
        null,
        '',
        searchParams.toString() ? `#${searchParams.toString()}` : window.location.pathname
    );
}, 300));
// Функция для дебаунса
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}
// Кнопка "Наверх" с задержкой появления
const scrollToTopBtn = document.getElementById('scroll-to-top');
let showTimeout = null;
window.addEventListener('scroll', function() {
    if (window.scrollY > 200) {
        if (!scrollToTopBtn.classList.contains('show')) {
            clearTimeout(showTimeout);
            showTimeout = setTimeout(() => {
                scrollToTopBtn.classList.add('show');
            }, 400);
        }
    } else {
        clearTimeout(showTimeout);
        scrollToTopBtn.classList.remove('show');
    }
}); 