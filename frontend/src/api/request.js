/**
 * Модуль для работы с API запросами
 * Здесь централизована логика общения с сервером
 */
export class ApiService {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Универсальный метод для отправки запросов
     * @param {string} endpoint - путь к ресурсу
     * @param {Object} options - параметры fetch
     */
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            const response = await fetch(url, { ...options, headers });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    /**
     * Отправка формы обратной связи в CRM
     * @param {Object} data - данные формы
     */
    async sendLead(data) {
        // Пример отправки данных во внешнюю CRM или на свой бэкенд
        // В реальном проекте заменить URL на актуальный endpoint
        console.log('Sending lead to CRM:', data);
        
        // Симуляция успешного запроса для демо
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
        
        // return this.request('/leads', {
        //     method: 'POST',
        //     body: JSON.stringify(data)
        // });
    }

    /**
     * Получение списка яхт (например, из каталога)
     */
    async getYachts() {
        // Симуляция ответа сервера
        return [
            {
                id: 1,
                name: 'Princess 50',
                price: '25 000 ₽/час',
                image: '/src/assets/images/yacht1.jpg',
                capacity: '10 чел.'
            },
            {
                id: 2,
                name: 'Azimut 55',
                price: '30 000 ₽/час',
                image: '/src/assets/images/yacht2.jpg',
                capacity: '12 чел.'
            },
            {
                id: 3,
                name: 'Sunseeker Predator',
                price: '45 000 ₽/час',
                image: '/src/assets/images/yacht3.jpg',
                capacity: '8 чел.'
            }
        ];
    }
}

export const api = new ApiService();
