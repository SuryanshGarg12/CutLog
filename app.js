/* ============================================
   CutLog Main App
   ============================================ */

class CutLogApp {
    constructor() {
        this.currentDate = new Date();
        this.currentProfile = null;
        this.selectedFood = null;
        this.foodCategories = new Set();
    }

    /**
     * Initialize app
     */
    async init() {
        try {
            // Check if Supabase is configured
            const url = localStorage.getItem('SUPABASE_URL');
            const key = localStorage.getItem('SUPABASE_KEY');

            if (!url || !key) {
                this.showSetupModal();
                return;
            }

            await supabase.initialize(url, key);

            // Setup UI event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadAllData();

            // Render today's page
            this.renderTodayPage();

            // Check for sync periodically
            this.setupAutoSync();

            // Request notification permission
            this.requestNotificationPermission();

            notify.success('CutLog ready!', 1500);
        } catch (error) {
            console.error('Init error:', error);
            notify.error('Failed to initialize app');
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.navigateTo(e.target.closest('.nav-btn').dataset.page));
        });

        // Sync button
        document.getElementById('sync-btn').addEventListener('click', () => this.syncData());

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });

        // Workout type change
        document.getElementById('log-workout-type').addEventListener('change', (e) => {
            this.updateWorkoutTypeFields(e.target.value);
        });

        // Food search modal
        document.getElementById('food-search-btn').addEventListener('click', () => this.openFoodSearchModal());
        document.getElementById('add-food-btn').addEventListener('click', () => this.openFoodSearchModal());

        // Modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Modal backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Forms
        document.getElementById('food-log-form').addEventListener('submit', (e) => this.submitFoodLog(e));
        document.getElementById('workout-log-form').addEventListener('submit', (e) => this.submitWorkoutLog(e));
        document.getElementById('profile-form').addEventListener('submit', (e) => this.submitProfile(e));
        document.getElementById('goals-form').addEventListener('submit', (e) => this.submitGoals(e));
        document.getElementById('add-food-form').addEventListener('submit', (e) => this.submitAddFood(e));
        document.getElementById('edit-food-form').addEventListener('submit', (e) => this.submitEditFood(e));

        // Food library
        document.getElementById('food-search').addEventListener('input', (e) => this.searchFoodLibrary(e.target.value));
        document.getElementById('food-category-filter').addEventListener('change', () => this.loadFoodLibrary());
        document.getElementById('add-food-item-btn').addEventListener('click', () => this.openAddFoodModal());
        document.getElementById('import-csv-btn').addEventListener('click', () => this.openImportCsvModal());

        // Modal food search
        document.getElementById('modal-food-search').addEventListener('input', (e) => this.searchFoodInModal(e.target.value));
        document.getElementById('modal-food-category').addEventListener('change', () => this.loadFoodInModal());

        // CSV import
        document.getElementById('csv-file-input').addEventListener('change', (e) => this.previewCsv(e));
        document.getElementById('csv-import-btn').addEventListener('click', () => this.importCsv());

        // Weight/Waist tracking
        document.getElementById('log-weight-btn').addEventListener('click', () => this.logWeight());
        document.getElementById('log-waist-btn').addEventListener('click', () => this.logWaist());

        // Export/Import
        document.getElementById('export-json-btn').addEventListener('click', () => this.exportJSON());
        document.getElementById('export-csv-btn').addEventListener('click', () => this.exportCSV());
        document.getElementById('clear-data-btn').addEventListener('click', () => this.clearAllData());

        // Set today's date in log forms
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('log-food-date').value = today;
        document.getElementById('log-workout-date').value = today;
        document.getElementById('weight-date').value = today;
        document.getElementById('waist-date').value = today;
    }

    /**
     * Navigate to page
     */
    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Show selected page
        const pageEl = document.getElementById(`${page}-page`);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Load page-specific data
        switch (page) {
            case 'today':
                this.renderTodayPage();
                break;
            case 'food':
                this.loadFoodLibrary();
                break;
            case 'workouts':
                this.loadWorkoutHistory();
                break;
            case 'progress':
                this.renderProgressPage();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    /**
     * Switch tab
     */
    switchTab(btn) {
        const tabName = btn.dataset.tab;
        const container = btn.closest('.tabs') || btn.closest('.log-tabs');
        
        // Remove active from siblings
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Hide all tab content
        const parent = container.closest('section') || container.parentElement;
        parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Show selected tab
        const tab = parent.querySelector(`#${tabName}`);
        if (tab) {
            tab.classList.add('active');
        }
    }

    /**
     * Load all data from Supabase (with cache fallback)
     */
    async loadAllData() {
        try {
            const isOnline = await supabase.isConnected();

            if (isOnline) {
                // Load from Supabase
                const [foods, foodLogs, workouts, metrics, profile] = await Promise.all([
                    supabase.getFoodItems(),
                    supabase.getFoodLogs(),
                    supabase.getWorkoutLogs(),
                    supabase.getBodyMetrics(),
                    supabase.getProfile()
                ]);

                // Cache locally
                storage.cacheFoodItems(foods);
                storage.cacheFoodLogs(foodLogs);
                storage.cacheWorkoutLogs(workouts);
                storage.cacheBodyMetrics(metrics);
                if (profile) storage.cacheProfile(profile);

                storage.setLastSyncAll();
            } else {
                // Use cached data
                notify.warning('Offline mode - using cached data');
            }

            this.currentProfile = storage.getCachedProfile();
            this.updateFoodCategories();
        } catch (error) {
            console.error('Load data error:', error);
            notify.error('Failed to load data');
        }
    }

    /**
     * Sync data with Supabase
     */
    async syncData() {
        try {
            const btn = document.getElementById('sync-btn');
            btn.classList.add('syncing');

            // Sync queued actions first
            await this.processSyncQueue();

            // Then reload all data
            await this.loadAllData();

            btn.classList.remove('syncing');
            notify.success('Synced successfully');

            // Update last sync time
            const now = new Date().toLocaleTimeString();
            document.getElementById('last-sync-time').textContent = now;
        } catch (error) {
            console.error('Sync error:', error);
            document.getElementById('sync-btn').classList.remove('syncing');
            notify.error('Sync failed');
        }
    }

    /**
     * Process sync queue (offline changes)
     */
    async processSyncQueue() {
        const queue = storage.getSyncQueue();
        for (const action of queue) {
            try {
                // Process action based on type
                // Implementation depends on action structure
                storage.removeFromQueue(action.id);
            } catch (error) {
                console.error('Queue action error:', error);
            }
        }
    }

    /**
     * Setup auto-sync
     */
    setupAutoSync() {
        setInterval(() => {
            if (navigator.onLine) {
                this.syncData().catch(console.error);
            }
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    /* ============================================
       TODAY PAGE
       ============================================ */

    async renderTodayPage() {
        try {
            const dateStr = this.currentDate.toISOString().split('T')[0];
            const formattedDate = this.currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });

            document.getElementById('today-date').textContent = formattedDate;

            // Get today's logs
            const foodLogs = storage.getCachedFoodLogs().filter(log => log.date === dateStr);
            const workoutLogs = storage.getCachedWorkoutLogs().filter(log => log.date === dateStr);

            // Calculate totals
            const foodTotals = this.calculateFoodTotals(foodLogs);
            const workoutTotals = this.calculateWorkoutTotals(workoutLogs);

            // Update calorie ring
            const profile = this.currentProfile;
            const goals = storage.get('goals') || { calorie: 2000, protein: 150, carbs: 250, fat: 65 };

            const consumed = foodTotals.calories;
            const burned = workoutTotals.calories;
            const net = consumed - burned;
            const remaining = Math.max(0, goals.calorie - net);

            document.getElementById('ring-consumed').textContent = Math.round(consumed);
            document.getElementById('ring-goal').textContent = goals.calorie;
            document.getElementById('calories-burned').textContent = Math.round(burned);
            document.getElementById('net-calories').textContent = Math.round(net);
            document.getElementById('remaining-calories').textContent = Math.round(remaining);

            // Update calorie ring SVG
            const percentage = Math.min(consumed / goals.calorie, 1);
            this.updateCalorieRing(percentage);

            // Update macros
            this.updateMacroDisplay(foodTotals, goals);

            // Render food logs
            this.renderFoodLogs(foodLogs);

            // Render workout logs
            this.renderWorkoutLogs(workoutLogs);
        } catch (error) {
            console.error('Render today error:', error);
        }
    }

    updateCalorieRing(percentage) {
        const ring = document.getElementById('calorie-ring-fill');
        const circumference = 2 * Math.PI * 50; // radius 50
        const offset = circumference * (1 - percentage);
        ring.style.strokeDashoffset = offset;
    }

    updateMacroDisplay(totals, goals) {
        // Protein
        const proteinPercent = Math.min((totals.protein / goals.protein) * 100, 100);
        document.getElementById('protein-bar').style.width = `${proteinPercent}%`;
        document.getElementById('protein-current').textContent = Math.round(totals.protein);
        document.getElementById('protein-goal').textContent = goals.protein;

        // Carbs
        const carbsPercent = Math.min((totals.carbs / goals.carbs) * 100, 100);
        document.getElementById('carbs-bar').style.width = `${carbsPercent}%`;
        document.getElementById('carbs-current').textContent = Math.round(totals.carbs);
        document.getElementById('carbs-goal').textContent = goals.carbs;

        // Fat
        const fatPercent = Math.min((totals.fat / goals.fat) * 100, 100);
        document.getElementById('fat-bar').style.width = `${fatPercent}%`;
        document.getElementById('fat-current').textContent = Math.round(totals.fat);
        document.getElementById('fat-goal').textContent = goals.fat;
    }

    calculateFoodTotals(logs) {
        return logs.reduce((acc, log) => ({
            calories: acc.calories + (log.calories || 0),
            protein: acc.protein + (log.protein || 0),
            carbs: acc.carbs + (log.carbs || 0),
            fat: acc.fat + (log.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    calculateWorkoutTotals(logs) {
        return logs.reduce((acc, log) => ({
            calories: acc.calories + (log.calories_burned || 0),
            duration: acc.duration + (log.duration || 0)
        }), { calories: 0, duration: 0 });
    }

    renderFoodLogs(logs) {
        const container = document.getElementById('food-logs-container');

        if (logs.length === 0) {
            container.innerHTML = '<p class="empty-state">No food logged yet</p>';
            return;
        }

        // Group by meal type
        const grouped = {};
        logs.forEach(log => {
            if (!grouped[log.meal_type]) grouped[log.meal_type] = [];
            grouped[log.meal_type].push(log);
        });

        const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];
        let html = '';

        mealOrder.forEach(mealType => {
            if (grouped[mealType]) {
                html += `<div style="margin-bottom: 16px;">`;
                html += `<h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px; text-transform: capitalize;">${mealType}</h3>`;

                grouped[mealType].forEach(log => {
                    html += `
                        <div class="log-item food-log">
                            <div class="log-item-main">
                                <div class="log-item-title">${this.escapeHtml(log.food_name || 'Unknown')}</div>
                                <div class="log-item-detail">${log.quantity}${log.unit || 'g'}</div>
                            </div>
                            <div class="log-item-meta">
                                <div class="log-item-value">${Math.round(log.calories)}</div>
                                <div class="log-item-actions">
                                    <button class="btn-icon" onclick="app.deleteFoodLog(${log.id})">🗑️</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
        });

        container.innerHTML = html;
    }

    renderWorkoutLogs(logs) {
        const container = document.getElementById('workout-logs-container');

        if (logs.length === 0) {
            container.innerHTML = '<p class="empty-state">No workouts logged yet</p>';
            return;
        }

        let html = logs.map(log => `
            <div class="log-item workout-log">
                <div class="log-item-main">
                    <div class="log-item-title" style="text-transform: capitalize;">${log.workout_type}${log.subtype ? ` - ${log.subtype}` : ''}</div>
                    <div class="log-item-detail">${log.duration} min</div>
                </div>
                <div class="log-item-meta">
                    <div class="log-item-value">${Math.round(log.calories_burned)}</div>
                    <div class="log-item-actions">
                        <button class="btn-icon" onclick="app.deleteWorkoutLog(${log.id})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    async deleteFoodLog(id) {
        if (!confirm('Delete this food log?')) return;

        try {
            await supabase.deleteFoodLog(id);
            const logs = storage.getCachedFoodLogs().filter(l => l.id !== id);
            storage.cacheFoodLogs(logs);
            this.renderTodayPage();
            notify.success('Food log deleted');
        } catch (error) {
            notify.error('Failed to delete food log');
        }
    }

    async deleteWorkoutLog(id) {
        if (!confirm('Delete this workout log?')) return;

        try {
            await supabase.deleteWorkoutLog(id);
            const logs = storage.getCachedWorkoutLogs().filter(l => l.id !== id);
            storage.cacheWorkoutLogs(logs);
            this.renderTodayPage();
            notify.success('Workout log deleted');
        } catch (error) {
            notify.error('Failed to delete workout log');
        }
    }

    /* ============================================
       FOOD LOGGING
       ============================================ */

    async submitFoodLog(e) {
        e.preventDefault();

        if (!this.selectedFood) {
            notify.warning('Please select a food');
            return;
        }

        try {
            const quantity = parseFloat(document.getElementById('log-food-quantity').value);
            const mealType = document.getElementById('log-meal-type').value;
            const date = document.getElementById('log-food-date').value;

            // Calculate macros
            const macros = MacrosCalculator.calculateMacros(this.selectedFood, quantity);

            const log = {
                food_item_id: this.selectedFood.id,
                food_name: this.selectedFood.name,
                quantity,
                unit: this.selectedFood.unit_type,
                meal_type: mealType,
                date,
                ...macros
            };

            await supabase.addFoodLog(log);

            // Update cache
            const logs = storage.getCachedFoodLogs();
            logs.push(log);
            storage.cacheFoodLogs(logs);

            // Reset form
            document.getElementById('food-log-form').reset();
            document.getElementById('selected-food-info').style.display = 'none';
            this.selectedFood = null;

            notify.success('Food logged successfully');
            this.renderTodayPage();
        } catch (error) {
            console.error('Food log error:', error);
            notify.error('Failed to log food');
        }
    }

    /* ============================================
       WORKOUT LOGGING
       ============================================ */

    updateWorkoutTypeFields(type) {
        // Hide all
        document.getElementById('gym-subtype-group').style.display = 'none';
        document.getElementById('running-distance-group').style.display = 'none';
        document.getElementById('cardio-type-group').style.display = 'none';

        // Show relevant
        if (type === 'gym') {
            document.getElementById('gym-subtype-group').style.display = 'block';
        } else if (type === 'running') {
            document.getElementById('running-distance-group').style.display = 'block';
        } else if (type === 'cardio') {
            document.getElementById('cardio-type-group').style.display = 'block';
        }
    }

    async submitWorkoutLog(e) {
        e.preventDefault();

        try {
            const type = document.getElementById('log-workout-type').value;
            const duration = parseInt(document.getElementById('log-workout-duration').value);
            const date = document.getElementById('log-workout-date').value;
            let subtype = '';
            let caloriesBurned = parseInt(document.getElementById('log-workout-calories').value) || 0;

            if (type === 'gym') {
                subtype = document.getElementById('log-gym-subtype').value;
            } else if (type === 'running') {
                subtype = parseFloat(document.getElementById('log-running-distance').value) + ' km';
            } else if (type === 'cardio') {
                subtype = document.getElementById('log-cardio-type').value;
            }

            // Estimate calories if not provided
            if (!caloriesBurned) {
                const weight = this.currentProfile?.weight || 70;
                caloriesBurned = MacrosCalculator.estimateCaloriesBurned(type, subtype, duration, weight);
            }

            const log = {
                date,
                workout_type: type,
                subtype,
                duration,
                calories_burned: caloriesBurned,
                notes: document.getElementById('log-workout-notes').value
            };

            await supabase.addWorkoutLog(log);

            // Update cache
            const logs = storage.getCachedWorkoutLogs();
            logs.push(log);
            storage.cacheWorkoutLogs(logs);

            // Reset form
            document.getElementById('workout-log-form').reset();

            notify.success('Workout logged successfully');
            this.renderTodayPage();
        } catch (error) {
            console.error('Workout log error:', error);
            notify.error('Failed to log workout');
        }
    }

    /* ============================================
       FOOD LIBRARY
       ============================================ */

    async loadFoodLibrary() {
        try {
            const foods = storage.getCachedFoodItems();
            const category = document.getElementById('food-category-filter').value;

            const filtered = category ? foods.filter(f => f.category === category) : foods;

            this.renderFoodLibrary(filtered);
        } catch (error) {
            console.error('Load food library error:', error);
        }
    }

    async searchFoodLibrary(term) {
        try {
            const foods = storage.getCachedFoodItems();

            if (!term) {
                this.loadFoodLibrary();
                return;
            }

            const filtered = foods.filter(f =>
                f.name.toLowerCase().includes(term.toLowerCase()) ||
                (f.category && f.category.toLowerCase().includes(term.toLowerCase()))
            );

            this.renderFoodLibrary(filtered);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    renderFoodLibrary(foods) {
        const container = document.getElementById('food-library-container');

        if (foods.length === 0) {
            container.innerHTML = '<p class="empty-state">No foods found</p>';
            return;
        }

        const html = foods.map(food => `
            <div class="food-item">
                <div class="food-item-info">
                    <div class="food-item-name">${this.escapeHtml(food.name)}</div>
                    <div class="food-item-meta">
                        <span>${food.category || 'General'}</span>
                        <span>${food.base_unit_value}${food.unit_type}</span>
                    </div>
                    <div class="food-item-macros">
                        <div class="macro-label">
                            <span class="macro-value">${food.calories}</span>
                            kcal
                        </div>
                        <div class="macro-label">
                            <span class="macro-value">${food.protein}g</span>
                            P
                        </div>
                        <div class="macro-label">
                            <span class="macro-value">${food.carbs}g</span>
                            C
                        </div>
                        <div class="macro-label">
                            <span class="macro-value">${food.fat}g</span>
                            F
                        </div>
                    </div>
                </div>
                <div class="food-item-actions">
                    <button class="btn-icon" onclick="app.editFood(${food.id})">✏️</button>
                    ${food.created_by_user ? `<button class="btn-icon" onclick="app.deleteFood(${food.id})">🗑️</button>` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateFoodCategories() {
        const foods = storage.getCachedFoodItems();
        const categories = new Set(foods.map(f => f.category).filter(Boolean));

        const select = document.getElementById('food-category-filter');
        const modalSelect = document.getElementById('modal-food-category');

        let html = '<option value="">All Categories</option>';
        Array.from(categories).sort().forEach(cat => {
            html += `<option value="${cat}">${cat}</option>`;
        });

        select.innerHTML = html;
        modalSelect.innerHTML = html;
    }

    /* ============================================
       ADD/EDIT FOOD ITEMS
       ============================================ */

    openAddFoodModal() {
        document.getElementById('add-food-modal').style.display = 'flex';
    }

    async submitAddFood(e) {
        e.preventDefault();

        try {
            const food = {
                name: document.getElementById('add-food-name').value,
                category: document.getElementById('add-food-category').value || 'Custom',
                unit_type: document.getElementById('add-food-unit').value,
                base_unit_value: parseInt(document.getElementById('add-food-base-value').value),
                calories: parseFloat(document.getElementById('add-food-calories').value),
                protein: parseFloat(document.getElementById('add-food-protein').value),
                carbs: parseFloat(document.getElementById('add-food-carbs').value),
                fat: parseFloat(document.getElementById('add-food-fat').value),
                created_by_user: true
            };

            const result = await supabase.addFoodItem(food);

            // Update cache
            const foods = storage.getCachedFoodItems();
            foods.push(result[0]);
            storage.cacheFoodItems(foods);

            this.updateFoodCategories();
            document.getElementById('add-food-form').reset();
            document.getElementById('add-food-modal').style.display = 'none';

            notify.success('Food added successfully');
            this.loadFoodLibrary();
        } catch (error) {
            console.error('Add food error:', error);
            notify.error('Failed to add food');
        }
    }

    async editFood(id) {
        const foods = storage.getCachedFoodItems();
        const food = foods.find(f => f.id === id);

        if (!food) return;

        document.getElementById('edit-food-id').value = id;
        document.getElementById('edit-food-name').value = food.name;
        document.getElementById('edit-food-category').value = food.category;
        document.getElementById('edit-food-calories').value = food.calories;
        document.getElementById('edit-food-protein').value = food.protein;
        document.getElementById('edit-food-carbs').value = food.carbs;
        document.getElementById('edit-food-fat').value = food.fat;

        document.getElementById('edit-food-modal').style.display = 'flex';
    }

    async submitEditFood(e) {
        e.preventDefault();

        try {
            const id = parseInt(document.getElementById('edit-food-id').value);

            const updates = {
                name: document.getElementById('edit-food-name').value,
                category: document.getElementById('edit-food-category').value,
                calories: parseFloat(document.getElementById('edit-food-calories').value),
                protein: parseFloat(document.getElementById('edit-food-protein').value),
                carbs: parseFloat(document.getElementById('edit-food-carbs').value),
                fat: parseFloat(document.getElementById('edit-food-fat').value)
            };

            await supabase.updateFoodItem(id, updates);

            // Update cache
            const foods = storage.getCachedFoodItems();
            const index = foods.findIndex(f => f.id === id);
            if (index >= 0) {
                foods[index] = { ...foods[index], ...updates };
                storage.cacheFoodItems(foods);
            }

            document.getElementById('edit-food-modal').style.display = 'none';
            notify.success('Food updated successfully');
            this.loadFoodLibrary();
        } catch (error) {
            console.error('Edit food error:', error);
            notify.error('Failed to update food');
        }
    }

    async deleteFood(id) {
        if (!confirm('Delete this food item?')) return;

        try {
            await supabase.deleteFoodItem(id);

            // Update cache
            const foods = storage.getCachedFoodItems().filter(f => f.id !== id);
            storage.cacheFoodItems(foods);

            notify.success('Food deleted');
            this.loadFoodLibrary();
        } catch (error) {
            notify.error('Failed to delete food');
        }
    }

    /* ============================================
       FOOD SEARCH MODAL
       ============================================ */

    openFoodSearchModal() {
        document.getElementById('food-search-modal').style.display = 'flex';
        this.loadFoodInModal();
    }

    async loadFoodInModal() {
        try {
            const foods = storage.getCachedFoodItems();
            const category = document.getElementById('modal-food-category').value;

            const filtered = category ? foods.filter(f => f.category === category) : foods;

            this.renderFoodInModal(filtered);
        } catch (error) {
            console.error('Load modal food error:', error);
        }
    }

    async searchFoodInModal(term) {
        try {
            const foods = storage.getCachedFoodItems();

            if (!term) {
                this.loadFoodInModal();
                return;
            }

            const filtered = foods.filter(f =>
                f.name.toLowerCase().includes(term.toLowerCase())
            );

            this.renderFoodInModal(filtered);
        } catch (error) {
            console.error('Modal search error:', error);
        }
    }

    renderFoodInModal(foods) {
        const container = document.getElementById('modal-food-results');

        if (foods.length === 0) {
            container.innerHTML = '<p class="empty-state">No foods found</p>';
            return;
        }

        const html = foods.map(food => `
            <div class="food-list-item" onclick="app.selectFood(${food.id}, this)">
                <div class="food-list-item-name">${this.escapeHtml(food.name)}</div>
                <div class="food-list-item-detail">
                    ${food.category} • ${food.base_unit_value}${food.unit_type} = ${food.calories} cal
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    selectFood(id, element) {
        const foods = storage.getCachedFoodItems();
        this.selectedFood = foods.find(f => f.id === id);

        if (this.selectedFood) {
            const info = document.getElementById('selected-food-info');
            info.innerHTML = `
                <div style="font-weight: 600;">${this.selectedFood.name}</div>
                <div style="font-size: 12px; color: var(--text-muted);">
                    ${this.selectedFood.base_unit_value}${this.selectedFood.unit_type}
                </div>
            `;
            info.style.display = 'block';

            document.getElementById('food-search-modal').style.display = 'none';
            document.getElementById('log-food-quantity').focus();
        }
    }

    /* ============================================
       CSV IMPORT/EXPORT
       ============================================ */

    openImportCsvModal() {
        document.getElementById('import-csv-modal').style.display = 'flex';
    }

    async previewCsv(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const lines = text.trim().split('\n');
            const preview = document.getElementById('csv-preview');
            const btn = document.getElementById('csv-import-btn');

            let html = '';
            const data = [];
            let validCount = 0;

            lines.forEach((line, index) => {
                if (index === 0) return; // Skip header

                const parts = line.split(',');
                if (parts.length < 8) {
                    html += `<div class="csv-row csv-row-invalid">Invalid: ${this.escapeHtml(line)}</div>`;
                } else {
                    html += `<div class="csv-row csv-row-valid">✓ ${parts[0].trim()}</div>`;
                    validCount++;
                    data.push(parts);
                }
            });

            preview.innerHTML = html || '<p>No valid entries</p>';
            btn.style.display = validCount > 0 ? 'block' : 'none';
            this.csvData = data;
        } catch (error) {
            notify.error('Failed to parse CSV');
        }
    }

    async importCsv() {
        if (!this.csvData || this.csvData.length === 0) {
            notify.warning('No valid data to import');
            return;
        }

        try {
            const foods = this.csvData.map(parts => ({
                name: parts[0].trim(),
                category: parts[1].trim(),
                unit_type: parts[2].trim(),
                base_unit_value: parseInt(parts[3]),
                calories: parseFloat(parts[4]),
                protein: parseFloat(parts[5]),
                carbs: parseFloat(parts[6]),
                fat: parseFloat(parts[7]),
                created_by_user: true
            }));

            await supabase.bulkInsertFoodItems(foods);

            // Update cache
            const existing = storage.getCachedFoodItems();
            storage.cacheFoodItems([...existing, ...foods]);

            this.updateFoodCategories();
            document.getElementById('import-csv-modal').style.display = 'none';
            document.getElementById('csv-file-input').value = '';

            notify.success(`Imported ${foods.length} food items`);
            this.loadFoodLibrary();
        } catch (error) {
            console.error('Import error:', error);
            notify.error('Failed to import CSV');
        }
    }

    exportJSON() {
        const data = storage.exportToJSON();
        this.downloadFile(data, 'cutlog-export.json', 'application/json');
        notify.success('Exported as JSON');
    }

    exportCSV() {
        const data = storage.exportToCSV();
        this.downloadFile(data, 'cutlog-export.csv', 'text/csv');
        notify.success('Exported as CSV');
    }

    downloadFile(content, filename, type) {
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

    /* ============================================
       WORKOUT HISTORY
       ============================================ */

    async loadWorkoutHistory() {
        try {
            const workouts = storage.getCachedWorkoutLogs();
            const dateFilter = document.getElementById('workout-date-filter').value;
            const typeFilter = document.getElementById('workout-type-filter').value;

            let filtered = workouts;

            if (dateFilter) {
                filtered = filtered.filter(w => w.date === dateFilter);
            }

            if (typeFilter) {
                filtered = filtered.filter(w => w.workout_type === typeFilter);
            }

            this.renderWorkoutHistory(filtered.reverse());
        } catch (error) {
            console.error('Load workout history error:', error);
        }
    }

    renderWorkoutHistory(workouts) {
        const container = document.getElementById('workout-history-container');

        if (workouts.length === 0) {
            container.innerHTML = '<p class="empty-state">No workouts found</p>';
            return;
        }

        const html = workouts.map(log => `
            <div class="log-item workout-log">
                <div class="log-item-main">
                    <div class="log-item-title" style="text-transform: capitalize;">${log.workout_type}${log.subtype ? ` - ${log.subtype}` : ''}</div>
                    <div class="log-item-detail">${new Date(log.date).toLocaleDateString()} • ${log.duration}min</div>
                </div>
                <div class="log-item-meta">
                    <div class="log-item-value">${log.calories_burned}cal</div>
                    <div class="log-item-actions">
                        <button class="btn-icon" onclick="app.deleteWorkoutLog(${log.id})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    /* ============================================
       PROGRESS PAGE
       ============================================ */

    async renderProgressPage() {
        try {
            const metrics = storage.getCachedBodyMetrics();

            if (metrics.length === 0) {
                document.getElementById('weight-chart-container').innerHTML = '<p class="empty-state">No weight data yet</p>';
                document.getElementById('waist-chart-container').innerHTML = '<p class="empty-state">No waist data yet</p>';
                return;
            }

            // Weight chart
            const weightData = ChartManager.prepareTrendData(
                metrics.filter(m => m.weight),
                'weight'
            );
            if (weightData.length > 0) {
                const canvas = document.getElementById('weight-chart');
                ChartManager.drawLineChart(canvas, weightData, {
                    color: '#FF6B6B'
                });

                this.renderWeightStats(metrics.filter(m => m.weight));
            }

            // Waist chart
            const waistData = ChartManager.prepareTrendData(
                metrics.filter(m => m.waist),
                'waist'
            );
            if (waistData.length > 0) {
                const canvas = document.getElementById('waist-chart');
                ChartManager.drawLineChart(canvas, waistData, {
                    color: '#4ECDC4'
                });

                this.renderWaistStats(metrics.filter(m => m.waist));
            }

            // Overall stats
            this.renderOverallStats(metrics);
        } catch (error) {
            console.error('Render progress error:', error);
        }
    }

    renderWeightStats(metrics) {
        const sorted = metrics.sort((a, b) => new Date(a.date) - new Date(b.date));
        const current = sorted[sorted.length - 1];
        const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

        const change = previous ? current.weight - previous.weight : 0;
        const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';

        const html = `
            <div class="stat-box">
                <div class="stat-label">Current Weight</div>
                <div class="stat-value">${current.weight}kg</div>
                <div class="stat-change ${change < 0 ? '' : 'negative'}">${trend} ${change > 0 ? '+' : ''}${change.toFixed(1)}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Lowest</div>
                <div class="stat-value">${Math.min(...sorted.map(m => m.weight)).toFixed(1)}kg</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Highest</div>
                <div class="stat-value">${Math.max(...sorted.map(m => m.weight)).toFixed(1)}kg</div>
            </div>
        `;

        document.getElementById('weight-stats').innerHTML = html;
    }

    renderWaistStats(metrics) {
        const sorted = metrics.sort((a, b) => new Date(a.date) - new Date(b.date));
        const current = sorted[sorted.length - 1];
        const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

        const change = previous ? current.waist - previous.waist : 0;
        const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';

        const html = `
            <div class="stat-box">
                <div class="stat-label">Current Waist</div>
                <div class="stat-value">${current.waist}cm</div>
                <div class="stat-change ${change < 0 ? '' : 'negative'}">${trend} ${change > 0 ? '+' : ''}${change.toFixed(1)}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Lowest</div>
                <div class="stat-value">${Math.min(...sorted.map(m => m.waist)).toFixed(1)}cm</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Highest</div>
                <div class="stat-value">${Math.max(...sorted.map(m => m.waist)).toFixed(1)}cm</div>
            </div>
        `;

        document.getElementById('waist-stats').innerHTML = html;
    }

    renderOverallStats(metrics) {
        const weightMetrics = metrics.filter(m => m.weight).sort((a, b) => new Date(a.date) - new Date(b.date));
        const workouts = storage.getCachedWorkoutLogs();
        const foodLogs = storage.getCachedFoodLogs();

        const stats = [];

        if (weightMetrics.length > 1) {
            const change = weightMetrics[weightMetrics.length - 1].weight - weightMetrics[0].weight;
            stats.push({
                label: 'Total Weight Change',
                value: `${change > 0 ? '+' : ''}${change.toFixed(1)}kg`
            });
        }

        stats.push({
            label: 'Total Workouts',
            value: workouts.length
        });

        stats.push({
            label: 'Total Food Logs',
            value: foodLogs.length
        });

        stats.push({
            label: 'Logging Consistency',
            value: MacrosCalculator.calculateConsistencyScore(foodLogs) + '%'
        });

        const html = stats.map(stat => `
            <div class="stat-box">
                <div class="stat-label">${stat.label}</div>
                <div class="stat-value">${stat.value}</div>
            </div>
        `).join('');

        document.getElementById('overall-stats').innerHTML = html;
    }

    async logWeight() {
        try {
            const date = document.getElementById('weight-date').value;
            const weight = parseFloat(document.getElementById('weight-value').value);

            if (!date || !weight) {
                notify.warning('Please fill in all fields');
                return;
            }

            const metric = { date, weight };
            await supabase.addBodyMetric(metric);

            // Update cache
            const metrics = storage.getCachedBodyMetrics();
            metrics.push(metric);
            storage.cacheBodyMetrics(metrics);

            document.getElementById('weight-value').value = '';
            notify.success('Weight logged');
            this.renderProgressPage();
        } catch (error) {
            console.error('Log weight error:', error);
            notify.error('Failed to log weight');
        }
    }

    async logWaist() {
        try {
            const date = document.getElementById('waist-date').value;
            const waist = parseFloat(document.getElementById('waist-value').value);

            if (!date || !waist) {
                notify.warning('Please fill in all fields');
                return;
            }

            const metric = { date, waist };
            await supabase.addBodyMetric(metric);

            // Update cache
            const metrics = storage.getCachedBodyMetrics();
            metrics.push(metric);
            storage.cacheBodyMetrics(metrics);

            document.getElementById('waist-value').value = '';
            notify.success('Waist logged');
            this.renderProgressPage();
        } catch (error) {
            console.error('Log waist error:', error);
            notify.error('Failed to log waist');
        }
    }

    /* ============================================
       SETTINGS
       ============================================ */

    async loadSettings() {
        try {
            const profile = storage.getCachedProfile();

            if (profile) {
                document.getElementById('profile-age').value = profile.age || '';
                document.getElementById('profile-gender').value = profile.gender || 'male';
                document.getElementById('profile-height').value = profile.height || '';
                document.getElementById('profile-weight').value = profile.weight || '';
                document.getElementById('profile-activity').value = profile.activity_level || 'moderate';
                document.getElementById('profile-target-weight').value = profile.target_weight || '';

                this.updateBMRDisplay(profile);
            }

            const goals = storage.get('goals') || { calorie: 2000, protein: 150, carbs: 250, fat: 65 };
            document.getElementById('goal-calorie').value = goals.calorie;
            document.getElementById('goal-protein').value = goals.protein;
            document.getElementById('goal-carbs').value = goals.carbs;
            document.getElementById('goal-fat').value = goals.fat;
        } catch (error) {
            console.error('Load settings error:', error);
        }
    }

    updateBMRDisplay(profile) {
        const bmr = MacrosCalculator.calculateBMR(profile);
        const tdee = MacrosCalculator.calculateTDEE(profile);

        const html = `
            <strong>BMR:</strong> ${bmr} cal/day<br>
            <strong>TDEE:</strong> ${tdee} cal/day<br>
            <strong>Suggested deficit:</strong> ${Math.round(tdee * 0.2)} cal/day<br>
            <strong>Estimated daily protein:</strong> ${Math.round(profile.weight * 2.2)}g
        `;

        document.getElementById('bmr-tdee-info').innerHTML = html;
    }

    async submitProfile(e) {
        e.preventDefault();

        try {
            const profile = {
                age: parseInt(document.getElementById('profile-age').value),
                gender: document.getElementById('profile-gender').value,
                height: parseFloat(document.getElementById('profile-height').value),
                weight: parseFloat(document.getElementById('profile-weight').value),
                activity_level: document.getElementById('profile-activity').value,
                target_weight: parseFloat(document.getElementById('profile-target-weight').value)
            };

            await supabase.updateProfile(profile);
            storage.cacheProfile(profile);
            this.currentProfile = profile;

            this.updateBMRDisplay(profile);
            notify.success('Profile saved');
        } catch (error) {
            console.error('Profile save error:', error);
            notify.error('Failed to save profile');
        }
    }

    async submitGoals(e) {
        e.preventDefault();

        try {
            const goals = {
                calorie: parseInt(document.getElementById('goal-calorie').value),
                protein: parseInt(document.getElementById('goal-protein').value),
                carbs: parseInt(document.getElementById('goal-carbs').value),
                fat: parseInt(document.getElementById('goal-fat').value)
            };

            storage.set('goals', goals);
            notify.success('Goals saved');
        } catch (error) {
            console.error('Goals save error:', error);
            notify.error('Failed to save goals');
        }
    }

    async clearAllData() {
        if (!confirm('This will delete ALL data. Are you sure?')) return;

        if (!confirm('This action cannot be undone. Delete everything?')) return;

        try {
            storage.clear();
            notify.success('All data cleared');
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            notify.error('Failed to clear data');
        }
    }

    /* ============================================
       UTILITIES
       ============================================ */

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showSetupModal() {
        const setupHtml = `
            <div class="modal" style="display: flex;">
                <div class="modal-content" style="width: 100%; max-height: 100vh;">
                    <div class="modal-header">
                        <h2>Setup Supabase</h2>
                    </div>
                    <div class="modal-body">
                        <p>Enter your Supabase project details to get started.</p>
                        <form id="setup-form" class="form">
                            <div class="form-group">
                                <label for="setup-url">Supabase URL</label>
                                <input type="url" id="setup-url" placeholder="https://your-project.supabase.co" required>
                            </div>
                            <div class="form-group">
                                <label for="setup-key">API Key (Anon/Public)</label>
                                <input type="password" id="setup-key" placeholder="Your API key" required>
                            </div>
                            <button type="submit" class="btn-primary" style="width: 100%;">Connect</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', setupHtml);

        document.getElementById('setup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = document.getElementById('setup-url').value;
            const key = document.getElementById('setup-key').value;

            await supabase.initialize(url, key);
            location.reload();
        });
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CutLogApp();
    app.init();
});
