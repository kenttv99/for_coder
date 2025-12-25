// Callback Popup Manager - Управление попапом обратного звонка
class CallbackPopup {
  constructor() {
    this.overlay = null;
    this.popup = null;
    this.form = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    console.log('[CallbackPopup] Инициализация попапа...');
    this.createPopup();
    this.bindEvents();
    this.setupFormValidation();
    console.log('[CallbackPopup] Попап инициализирован');
  }

  createPopup() {
    console.log('[CallbackPopup] Создание попапа...');
    
    // Создаем overlay и popup
    const overlay = document.createElement('div');
    overlay.className = 'callback-popup-overlay';
    overlay.id = 'callback-popup-overlay';

    // Создаем попап напрямую
    overlay.innerHTML = this.getPopupHTML();
    document.body.appendChild(overlay);
    
    this.overlay = overlay;
    this.popup = overlay.querySelector('.callback-popup');
    this.form = overlay.querySelector('#callback-form');
    
    console.log('[CallbackPopup] Элементы созданы:', {
      overlay: !!this.overlay,
      popup: !!this.popup,
      form: !!this.form
    });
    
    // Настраиваем маску для телефона
    this.setupPhoneMask();
    
    // Проверяем стили
    setTimeout(() => {
      console.log('[CallbackPopup] Проверка стилей:', {
        overlayVisible: getComputedStyle(this.overlay).display,
        popupVisible: getComputedStyle(this.popup).display,
        overlayOpacity: getComputedStyle(this.overlay).opacity,
        popupTransform: getComputedStyle(this.popup).transform
      });
    }, 100);
  }

  getPopupHTML() {
    return `
      <div class="callback-popup">
        <!-- Декоративные волны -->
        <div class="popup-waves">
          <svg class="wave wave-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
        
        <!-- Кнопка закрытия -->
        <button class="popup-close" id="popup-close" aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <!-- Контент попапа -->
        <div class="popup-content">
          <!-- Заголовок с иконкой -->
          <div class="popup-header">
            <div class="popup-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h2 class="popup-title">Забронировать яхту</h2>
            <p class="popup-subtitle">Оставьте свои контакты и наш менеджер свяжется с вами в течение 15 минут</p>
          </div>
          
          <!-- Форма -->
          <form class="callback-form" id="callback-form">
            <div class="form-group">
              <div class="input-wrapper">
                <input type="text" id="name" name="name" placeholder="Ваше имя" required>
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <div class="input-wrapper">
                <input type="tel" id="phone" name="phone" placeholder="+7 (___) ___-__-__" required>
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <div class="input-wrapper">
                <textarea id="message" name="message" placeholder="Комментарий (необязательно)" rows="3"></textarea>
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Скрытое поле для яхты -->
            <input type="hidden" id="yacht-name" name="yacht-name" value="">
            
            <button type="submit" class="submit-btn">
              <span class="btn-text">Отправить заявку</span>
              <div class="btn-wave"></div>
            </button>
            
            <p class="privacy-notice">
              Нажимая кнопку, вы соглашаетесь с 
              <a href="#" class="privacy-link">политикой конфиденциальности</a>
            </p>
          </form>
        </div>
        
        <!-- Декоративные элементы -->
        <div class="popup-decorations">
          <div class="sun-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  createFallbackPopup() {
    const fallbackHtml = `
      <div class="callback-popup">
        <button class="popup-close" id="popup-close" aria-label="Закрыть">×</button>
        <div class="popup-content">
          <div class="popup-header">
            <h2 class="popup-title">Заказать обратный звонок</h2>
            <p class="popup-subtitle">Оставьте свои контакты и наш менеджер свяжется с вами</p>
          </div>
          <form class="callback-form" id="callback-form">
            <div class="form-group">
              <input type="text" id="name" name="name" placeholder="Ваше имя" required>
            </div>
            <div class="form-group">
              <input type="tel" id="phone" name="phone" placeholder="+7 (___) ___-__-__" required>
            </div>
            <div class="form-group">
              <textarea id="message" name="message" placeholder="Комментарий" rows="3"></textarea>
            </div>
            <input type="hidden" id="yacht-name" name="yacht-name" value="">
            <button type="submit" class="submit-btn">Отправить заявку</button>
          </form>
        </div>
      </div>
    `;

    this.overlay.innerHTML = fallbackHtml;
    this.popup = this.overlay.querySelector('.callback-popup');
    this.form = this.overlay.querySelector('#callback-form');
    this.setupPhoneMask();
  }

  bindEvents() {
    // Делегирование событий для динамически созданных элементов
    document.addEventListener('click', (e) => {
      // Открытие попапа
      if (e.target.matches('.yacht-btn') || e.target.closest('.yacht-btn')) {
        e.preventDefault();
        const card = e.target.closest('.yacht-card');
        const yachtName = card?.querySelector('.yacht-title')?.textContent?.trim() || '';
        this.open(yachtName);
      }

      // Закрытие попапа
      if (e.target.matches('#popup-close') || e.target.closest('#popup-close')) {
        this.close();
      }

      // Закрытие по клику на overlay
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Отправка формы
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }

  setupPhoneMask() {
    const phoneInput = this.overlay?.querySelector('#phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.startsWith('8')) {
        value = '7' + value.slice(1);
      }
      if (!value.startsWith('7')) {
        value = '7' + value;
      }

      value = value.slice(0, 11);

      const formatted = this.formatPhone(value);
      e.target.value = formatted;
    });
  }

  formatPhone(value) {
    const phone = value.replace(/\D/g, '');
    if (phone.length === 0) return '';
    if (phone.length <= 1) return '+7';
    if (phone.length <= 4) return `+7 (${phone.slice(1)}`;
    if (phone.length <= 7) return `+7 (${phone.slice(1, 4)}) ${phone.slice(4)}`;
    if (phone.length <= 9) return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7)}`;
    return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9, 11)}`;
  }

  setupFormValidation() {
    if (!this.form) return;

    const inputs = this.form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      // Валидация только при отправке, при вводе только очистка ошибок
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    switch (field.type) {
      case 'tel':
        const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        isValid = phoneRegex.test(value);
        message = 'Введите корректный номер телефона';
        break;
      case 'text':
        isValid = value.length >= 2;
        message = 'Имя должно содержать минимум 2 символа';
        break;
    }

    if (!isValid) {
      this.showFieldError(field, message);
    } else {
      this.clearFieldError(field);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    // Ищем контейнер form-group (родитель input-wrapper)
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    let errorElement = formGroup.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  clearFieldError(field) {
    field.classList.remove('error');
    
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  open(yachtName = '') {
    if (!this.overlay) return;

    // Устанавливаем название яхты
    const yachtInput = this.overlay.querySelector('#yacht-name');
    if (yachtInput) {
      yachtInput.value = yachtName;
    }

    // Показываем попап
    this.overlay.classList.add('active');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';

    // Фокус на первое поле
    setTimeout(() => {
      const firstInput = this.overlay.querySelector('#name');
      if (firstInput) firstInput.focus();
    }, 300);
  }

  close() {
    if (!this.overlay) return;

    this.overlay.classList.remove('active');
    this.isOpen = false;
    document.body.style.overflow = '';

    // Сброс формы через небольшую задержку
    setTimeout(() => {
      if (this.form) {
        this.form.reset();
        this.clearAllErrors();
      }
    }, 300);
  }

  clearAllErrors() {
    if (!this.form) return;
    
    const errorElements = this.form.querySelectorAll('.field-error');
    errorElements.forEach(el => el.remove());
    
    const errorFields = this.form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
  }

  async handleSubmit() {
    if (!this.form) return;

    // Валидация всех полей
    const inputs = this.form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      this.showMessage('Пожалуйста, исправьте ошибки в форме', 'error');
      return;
    }

    // Показываем состояние загрузки
    this.popup?.classList.add('loading');

    try {
      // Собираем данные формы
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);

      // Добавляем метаданные
      data.timestamp = new Date().toISOString();
      data.userAgent = navigator.userAgent;
      data.page = window.location.href;

      console.log('Отправка данных обратного звонка:', data);

      // Имитация отправки (замените на реальный API)
      await this.simulateSubmit(data);

      // Показываем успех
      this.popup?.classList.remove('loading');
      this.popup?.classList.add('success');
      
      this.showMessage('Заявка отправлена! Мы свяжемся с вами в течение 15 минут.', 'success');

      // Закрываем попап через 3 секунды
      setTimeout(() => {
        this.close();
        this.popup?.classList.remove('success');
      }, 3000);

    } catch (error) {
      console.error('Ошибка отправки:', error);
      
      this.popup?.classList.remove('loading');
      this.showMessage('Произошла ошибка. Попробуйте еще раз или позвоните нам.', 'error');
    }
  }

  async simulateSubmit(data) {
    // Имитация API запроса
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90% успешных отправок
        if (Math.random() > 0.1) {
          resolve({ success: true, id: Date.now() });
        } else {
          reject(new Error('Случайная ошибка'));
        }
      }, 2000);
    });
  }

  showMessage(text, type = 'info') {
    // Создаем элемент сообщения
    const messageEl = document.createElement('div');
    messageEl.className = `popup-message ${type}`;
    messageEl.textContent = text;

    // Стили для сообщения
    Object.assign(messageEl.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '600',
      zIndex: '10001',
      transform: 'translateX(400px)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    });

    // Цвета для разных типов
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8'
    };
    messageEl.style.background = colors[type] || colors.info;

    document.body.appendChild(messageEl);

    // Анимация появления
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);

    // Автоматическое скрытие
    setTimeout(() => {
      messageEl.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 4000);
  }
}

// Инициализация попапа при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  window.callbackPopup = new CallbackPopup();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CallbackPopup;
}
