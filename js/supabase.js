/* ============================================
   Supabase Module - Data Layer
   ============================================ */

class SupabaseClient {
    constructor() {
        this.url = localStorage.getItem('SUPABASE_URL') || '';
        this.key = localStorage.getItem('SUPABASE_KEY') || '';
        this.headers = {
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'apikey': this.key
        };
    }

    /**
     * Initialize Supabase connection
     */
    async initialize(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'apikey': key
        };
        localStorage.setItem('SUPABASE_URL', url);
        localStorage.setItem('SUPABASE_KEY', key);
    }

    /**
     * Generic API request
     */
    async request(method, path, data = null) {
        try {
            const options = {
                method,
                headers: this.headers
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.url}/rest/v1${path}`, options);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }

            if (method === 'DELETE') {
                return { success: true };
            }

            return await response.json();
        } catch (error) {
            console.error('Supabase request error:', error);
            throw error;
        }
    }

    /**
     * Create query string from filters
     */
    buildQuery(filters) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filters)) {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        }
        return params.toString();
    }

    /* ============================================
       Food Items
       ============================================ */

    async getFoodItems(filters = {}) {
        try {
            const query = this.buildQuery(filters);
            const path = `/food_items?${query}&order=name.asc`;
            return await this.request('GET', path);
        } catch (error) {
            console.error('Error fetching food items:', error);
            return [];
        }
    }

    async searchFoodItems(searchTerm) {
        try {
            const path = `/food_items?or=(name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%)&order=name.asc`;
            return await this.request('GET', path);
        } catch (error) {
            console.error('Error searching food items:', error);
            return [];
        }
    }

    async addFoodItem(food) {
        try {
            return await this.request('POST', '/food_items', {
                ...food,
                created_by_user: true,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error adding food item:', error);
            throw error;
        }
    }

    async updateFoodItem(id, updates) {
        try {
            return await this.request('PATCH', `/food_items?id=eq.${id}`, updates);
        } catch (error) {
            console.error('Error updating food item:', error);
            throw error;
        }
    }

    async deleteFoodItem(id) {
        try {
            return await this.request('DELETE', `/food_items?id=eq.${id}`);
        } catch (error) {
            console.error('Error deleting food item:', error);
            throw error;
        }
    }

    async bulkInsertFoodItems(foods) {
        try {
            const result = await this.request('POST', '/food_items', foods);
            return result;
        } catch (error) {
            console.error('Error bulk inserting food items:', error);
            throw error;
        }
    }

    /* ============================================
       Food Logs
       ============================================ */

    async getFoodLogs(filters = {}) {
        try {
            const query = this.buildQuery(filters);
            const path = `/food_logs?${query}&order=date.desc,created_at.desc`;
            return await this.request('GET', path);
        } catch (error) {
            console.error('Error fetching food logs:', error);
            return [];
        }
    }

    async getFoodLogsForDate(date) {
        try {
            const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
            const path = `/food_logs?date=eq.${dateStr}&order=meal_type,created_at`;
            return await this.request('GET', path);
        } catch (error) {
            console.error('Error fetching food logs for date:', error);
            return [];
        }
    }

    async addFoodLog(log) {
        try {
            return await this.request('POST', '/food_logs', {
                ...log,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error adding food log:', error);
            throw error;
        }
    }

    async updateFoodLog(id, updates) {
        try {
            return await this.request('PATCH', `/food_logs?id=eq.${id}`, updates);
        } catch (error) {
            console.error('Error updating food log:', error);
            throw error;
        }
    }

    async deleteFoodLog(id) {
        try {
            return await this.request('DELETE', `/food_logs?id=eq.${id}`);
        } catch (error) {
            console.error('Error deleting food log:', error);
            throw error;
        }
    }

    /* ============================================
       Workout Logs
       ============================================ */

    async getWorkoutLogs(filters = {}) {
        try {
            const query = this.buildQuery(filters);
            const path = `/workout_logs?${query}&order=date.desc,created_at.desc`;
            return await this.request('GET', path);
        } catch (error) {
            console.error('Error fetching workout logs:', error);
            return [];
        }
    }

    async getWorkoutLogsForDate(date) {
        try {
            const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
            const path = `/workout_logs?date=eq.${dateStr}&order=created_at`;
            return await this.request('GET', path);
        } catch (error) {
            console.error('Error fetching workout logs for date:', error);
            return [];
        }
    }

    async addWorkoutLog(log) {
        try {
            return await this.request('POST', '/workout_logs', {
                ...log,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error adding workout log:', error);
            throw error;
        }
    }

    async updateWorkoutLog(id, updates) {
        try {
            return await this.request('PATCH', `/workout_logs?id=eq.${id}`, updates);
        } catch (error) {
            console.error('Error updating workout log:', error);
            throw error;
        }
    }

    async deleteWorkoutLog(id) {
        try {
            return await this.request('DELETE', `/workout_logs?id=eq.${id}`);
        } catch (error) {
            console.error('Error deleting workout log:', error);
            throw error;
        }
    }

    /* ============================================
       Body Metrics
       ============================================ */

    async getBodyMetrics(filters = {}) {
        try {
            const query = this.buildQuery(filters);
            const path = `/body_metrics?${query}&order=date.desc`;
            return await this.request('GET', path);
        } catch (error) {
            console.error('Error fetching body metrics:', error);
            return [];
        }
    }

    async addBodyMetric(metric) {
        try {
            return await this.request('POST', '/body_metrics', {
                ...metric,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error adding body metric:', error);
            throw error;
        }
    }

    async updateBodyMetric(id, updates) {
        try {
            return await this.request('PATCH', `/body_metrics?id=eq.${id}`, updates);
        } catch (error) {
            console.error('Error updating body metric:', error);
            throw error;
        }
    }

    async deleteBodyMetric(id) {
        try {
            return await this.request('DELETE', `/body_metrics?id=eq.${id}`);
        } catch (error) {
            console.error('Error deleting body metric:', error);
            throw error;
        }
    }

    /* ============================================
       Profile
       ============================================ */

    async getProfile() {
        try {
            const path = '/profiles?limit=1';
            const result = await this.request('GET', path);
            return result && result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    async updateProfile(profile) {
        try {
            const existing = await this.getProfile();
            if (existing) {
                return await this.request('PATCH', `/profiles?id=eq.${existing.id}`, profile);
            } else {
                return await this.request('POST', '/profiles', {
                    ...profile,
                    created_at: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /* ============================================
       Health Checks
       ============================================ */

    async isConnected() {
        try {
            const response = await fetch(`${this.url}/rest/v1/food_items?limit=1`, {
                method: 'GET',
                headers: this.headers
            });
            return response.ok;
        } catch (error) {
            console.error('Connection check failed:', error);
            return false;
        }
    }
}

// Export singleton instance
const supabase = new SupabaseClient();
