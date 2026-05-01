/* ============================================
   Local Storage Module - Offline Cache
   ============================================ */

class StorageManager {
    constructor() {
        this.prefix = 'cutlog_';
    }

    /**
     * Set item in localStorage
     */
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
        } catch (error) {
            console.error(`Storage error setting ${key}:`, error);
        }
    }

    /**
     * Get item from localStorage
     */
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error(`Storage error getting ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
        } catch (error) {
            console.error(`Storage error removing ${key}:`, error);
        }
    }

    /**
     * Clear all app data
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Storage error clearing data:', error);
        }
    }

    /**
     * Get storage size
     */
    getSize() {
        let size = 0;
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    size += localStorage.getItem(key).length;
                }
            });
        } catch (error) {
            console.error('Storage error calculating size:', error);
        }
        return size;
    }

    /* ============================================
       Cache Operations
       ============================================ */

    /**
     * Cache food items
     */
    cacheFoodItems(items) {
        this.set('food_items', items);
        this.set('food_items_timestamp', Date.now());
    }

    getCachedFoodItems() {
        return this.get('food_items', []);
    }

    /**
     * Cache food logs
     */
    cacheFoodLogs(logs) {
        this.set('food_logs', logs);
        this.set('food_logs_timestamp', Date.now());
    }

    getCachedFoodLogs() {
        return this.get('food_logs', []);
    }

    /**
     * Cache workout logs
     */
    cacheWorkoutLogs(logs) {
        this.set('workout_logs', logs);
        this.set('workout_logs_timestamp', Date.now());
    }

    getCachedWorkoutLogs() {
        return this.get('workout_logs', []);
    }

    /**
     * Cache body metrics
     */
    cacheBodyMetrics(metrics) {
        this.set('body_metrics', metrics);
        this.set('body_metrics_timestamp', Date.now());
    }

    getCachedBodyMetrics() {
        return this.get('body_metrics', []);
    }

    /**
     * Cache profile
     */
    cacheProfile(profile) {
        this.set('profile', profile);
        this.set('profile_timestamp', Date.now());
    }

    getCachedProfile() {
        return this.get('profile', null);
    }

    /* ============================================
       Sync Queue (for offline-first)
       ============================================ */

    /**
     * Add action to sync queue
     */
    queueAction(action) {
        const queue = this.get('sync_queue', []);
        queue.push({
            ...action,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        this.set('sync_queue', queue);
    }

    /**
     * Get all queued actions
     */
    getSyncQueue() {
        return this.get('sync_queue', []);
    }

    /**
     * Remove action from queue
     */
    removeFromQueue(actionId) {
        const queue = this.get('sync_queue', []);
        const filtered = queue.filter(a => a.id !== actionId);
        this.set('sync_queue', filtered);
    }

    /**
     * Clear sync queue
     */
    clearSyncQueue() {
        this.set('sync_queue', []);
    }

    /**
     * Get pending changes count
     */
    getPendingChangesCount() {
        return this.getSyncQueue().length;
    }

    /* ============================================
       Sync Metadata
       ============================================ */

    setLastSync(table) {
        this.set(`last_sync_${table}`, Date.now());
    }

    getLastSync(table) {
        return this.get(`last_sync_${table}`, 0);
    }

    setLastSyncAll() {
        this.set('last_sync_all', Date.now());
    }

    getLastSyncAll() {
        return this.get('last_sync_all', 0);
    }

    /**
     * Check if cache is stale
     */
    isCacheStale(table, maxAge = 5 * 60 * 1000) { // 5 minutes default
        const lastSync = this.getLastSync(table);
        return Date.now() - lastSync > maxAge;
    }

    /* ============================================
       Data Export/Import
       ============================================ */

    /**
     * Export all data as JSON
     */
    exportToJSON() {
        const data = {
            profile: this.getCachedProfile(),
            foodItems: this.getCachedFoodItems(),
            foodLogs: this.getCachedFoodLogs(),
            workoutLogs: this.getCachedWorkoutLogs(),
            bodyMetrics: this.getCachedBodyMetrics(),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON
     */
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.profile) this.cacheProfile(data.profile);
            if (data.foodItems) this.cacheFoodItems(data.foodItems);
            if (data.foodLogs) this.cacheFoodLogs(data.foodLogs);
            if (data.workoutLogs) this.cacheWorkoutLogs(data.workoutLogs);
            if (data.bodyMetrics) this.cacheBodyMetrics(data.bodyMetrics);
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }

    /**
     * Export data as CSV
     */
    exportToCSV() {
        const csvData = [];
        
        // Food logs
        csvData.push('Food Logs');
        csvData.push('Date,Meal Type,Food Name,Quantity,Calories,Protein,Carbs,Fat');
        const foodLogs = this.getCachedFoodLogs();
        foodLogs.forEach(log => {
            csvData.push(`${log.date},${log.meal_type},${log.food_name || ''},${log.quantity},${log.calories},${log.protein},${log.carbs},${log.fat}`);
        });

        csvData.push('');
        csvData.push('Workout Logs');
        csvData.push('Date,Type,Subtype,Duration (min),Calories,Notes');
        const workoutLogs = this.getCachedWorkoutLogs();
        workoutLogs.forEach(log => {
            csvData.push(`${log.date},${log.workout_type},${log.subtype || ''},${log.duration},${log.calories_burned},${log.notes || ''}`);
        });

        csvData.push('');
        csvData.push('Body Metrics');
        csvData.push('Date,Weight (kg),Waist (cm)');
        const metrics = this.getCachedBodyMetrics();
        metrics.forEach(metric => {
            csvData.push(`${metric.date},${metric.weight || ''},${metric.waist || ''}`);
        });

        return csvData.join('\n');
    }
}

// Export singleton instance
const storage = new StorageManager();
