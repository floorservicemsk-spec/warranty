/**
 * Виджет активации гарантии
 * Универсальный скрипт для встраивания на любой сайт
 */

(function() {
    'use strict';
    
    // Конфигурация виджета
    const config = {
        // URL страницы с формой гарантии
        formUrl: 'widget-form.html', // Измените на полный URL если форма на другом домене
        
        // Позиция кнопки: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
        position: 'bottom-right',
        
        // Отступ от края экрана (в пикселях)
        offset: 20,
        
        // Цвет кнопки
        buttonColor: '#c3202e',
        
        // Текст на кнопке
        buttonText: 'Активировать гарантию',
        
        // Показывать как: 'modal' (модальное окно) или 'newpage' (новая страница)
        displayMode: 'modal',
        
        // Автоматически показывать кнопку через N секунд (0 = сразу)
        showDelay: 0
    };
    
    // Проверка, что скрипт не загружен дважды
    if (window.warrantyWidgetLoaded) {
        return;
    }
    window.warrantyWidgetLoaded = true;
    
    // Создание стилей виджета
    const styles = `
        .warranty-widget-button {
            position: fixed;
            z-index: 999999;
            padding: 16px 24px;
            background: ${config.buttonColor};
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(195, 32, 46, 0.4);
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s ease forwards;
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .warranty-widget-button:hover {
            background: #a00620;
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(195, 32, 46, 0.5);
        }
        
        .warranty-widget-button:active {
            transform: translateY(0);
        }
        
        .warranty-widget-button svg {
            width: 20px;
            height: 20px;
            fill: white;
        }
        
        /* Позиционирование */
        .warranty-widget-button.bottom-right {
            bottom: ${config.offset}px;
            right: ${config.offset}px;
        }
        
        .warranty-widget-button.bottom-left {
            bottom: ${config.offset}px;
            left: ${config.offset}px;
        }
        
        .warranty-widget-button.top-right {
            top: ${config.offset}px;
            right: ${config.offset}px;
        }
        
        .warranty-widget-button.top-left {
            top: ${config.offset}px;
            left: ${config.offset}px;
        }
        
        /* Модальное окно */
        .warranty-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(5px);
        }
        
        .warranty-modal-overlay.active {
            opacity: 1;
        }
        
        .warranty-modal-content {
            position: relative;
            width: 95%;
            max-width: 1000px;
            height: 90vh;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .warranty-modal-overlay.active .warranty-modal-content {
            transform: scale(1);
        }
        
        .warranty-modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.5);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .warranty-modal-close:hover {
            background: rgba(0, 0, 0, 0.7);
            transform: rotate(90deg);
        }
        
        .warranty-modal-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        /* Адаптив */
        @media (max-width: 768px) {
            .warranty-widget-button {
                padding: 12px 20px;
                font-size: 14px;
                bottom: ${config.offset}px !important;
                right: ${config.offset}px !important;
                left: auto !important;
                top: auto !important;
            }
            
            .warranty-widget-button span {
                display: none;
            }
            
            .warranty-modal-content {
                width: 100%;
                height: 100vh;
                max-width: 100%;
                border-radius: 0;
            }
        }
    `;
    
    // Добавление стилей на страницу
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Создание кнопки виджета
    function createButton() {
        const button = document.createElement('button');
        button.className = `warranty-widget-button ${config.position}`;
        button.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <span>${config.buttonText}</span>
        `;
        
        button.addEventListener('click', openWarrantyForm);
        
        setTimeout(() => {
            document.body.appendChild(button);
        }, config.showDelay);
    }
    
    // Создание модального окна
    function createModal() {
        const modal = document.createElement('div');
        modal.className = 'warranty-modal-overlay';
        modal.innerHTML = `
            <div class="warranty-modal-content">
                <button class="warranty-modal-close" aria-label="Закрыть">×</button>
                <iframe class="warranty-modal-iframe" src="${config.formUrl}" title="Активация гарантии"></iframe>
            </div>
        `;
        
        // Закрытие по клику на overlay
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Закрытие по кнопке
        const closeBtn = modal.querySelector('.warranty-modal-close');
        closeBtn.addEventListener('click', closeModal);
        
        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
        
        document.body.appendChild(modal);
        return modal;
    }
    
    // Открытие формы гарантии
    function openWarrantyForm() {
        if (config.displayMode === 'modal') {
            let modal = document.querySelector('.warranty-modal-overlay');
            if (!modal) {
                modal = createModal();
            }
            
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            
            // Блокировка скролла body
            document.body.style.overflow = 'hidden';
            
        } else {
            // Открытие в новой вкладке
            window.open(config.formUrl, '_blank');
        }
    }
    
    // Закрытие модального окна
    function closeModal() {
        const modal = document.querySelector('.warranty-modal-overlay');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        // Возврат скролла body
        document.body.style.overflow = '';
    }
    
    // Инициализация виджета после загрузки страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
    
    // Публичный API для управления виджетом
    window.WarrantyWidget = {
        open: openWarrantyForm,
        close: closeModal,
        updateConfig: function(newConfig) {
            Object.assign(config, newConfig);
        }
    };
    
})();

