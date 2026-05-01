/* ============================================
   Macros Calculator Module
   ============================================ */

class MacrosCalculator {
    /**
     * Calculate calorie macros for quantity
     */
    static calculateMacros(foodItem, quantity) {
        if (!foodItem || !quantity) return null;

        const multiplier = quantity / foodItem.base_unit_value;
        return {
            calories: Math.round(foodItem.calories * multiplier * 10) / 10,
            protein: Math.round(foodItem.protein * multiplier * 10) / 10,
            carbs: Math.round(foodItem.carbs * multiplier * 10) / 10,
            fat: Math.round(foodItem.fat * multiplier * 10) / 10
        };
    }

    /**
     * Calculate BMR using Mifflin-St Jeor formula
     */
    static calculateBMR(profile) {
        if (!profile) return 0;

        const { age, gender, weight, height } = profile;

        if (gender.toLowerCase() === 'male') {
            return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
        } else {
            return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
        }
    }

    /**
     * Calculate TDEE based on activity level
     */
    static calculateTDEE(profile) {
        const bmr = this.calculateBMR(profile);
        if (!profile.activity_level) return bmr;

        const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'veryactive': 1.9
        };

        const multiplier = activityMultipliers[profile.activity_level] || 1.5;
        return Math.round(bmr * multiplier);
    }

    /**
     * Estimate calories burned from workout
     */
    static estimateCaloriesBurned(workoutType, subtype, duration, weight = 70) {
        const caloriesPerMinute = {
            gym: {
                push: 7,
                pull: 6.5,
                legs: 8,
                upper: 6,
                lower: 7,
                full: 8,
                core: 4
            },
            running: {
                default: 12 // ~12 cal/min for 70kg person at moderate pace
            },
            cardio: {
                treadmill: 10,
                cycling: 8,
                sports: 9,
                walking: 4
            }
        };

        let rate = 8; // default
        
        if (workoutType === 'gym' && caloriesPerMinute.gym[subtype]) {
            rate = caloriesPerMinute.gym[subtype];
        } else if (workoutType === 'running') {
            rate = caloriesPerMinute.running.default;
        } else if (workoutType === 'cardio' && caloriesPerMinute.cardio[subtype]) {
            rate = caloriesPerMinute.cardio[subtype];
        }

        // Adjust for body weight (70kg baseline)
        const weightAdjustment = weight / 70;
        return Math.round(rate * duration * weightAdjustment);
    }

    /**
     * Calculate calorie deficit/surplus
     */
    static calculateDeficit(consumed, burned, tdee) {
        const net = consumed - burned;
        const deficit = tdee - net;
        return {
            consumed,
            burned,
            net,
            tdee,
            deficit,
            isDeficit: deficit > 0,
            percentage: Math.round((deficit / tdee) * 100)
        };
    }

    /**
     * Estimate daily fat loss from deficit
     */
    static estimateFatLoss(dailyDeficit, days = 1) {
        // 1kg fat = ~7700 calories
        const lossGrams = (dailyDeficit * days) / 7700 * 1000;
        return Math.round(lossGrams);
    }

    /**
     * Calculate macro percentages
     */
    static calculateMacroPercentages(calories, protein, carbs, fat) {
        const proteinCals = protein * 4;
        const carbsCals = carbs * 4;
        const fatCals = fat * 9;

        return {
            proteinPercent: calories > 0 ? Math.round((proteinCals / calories) * 100) : 0,
            carbsPercent: calories > 0 ? Math.round((carbsCals / calories) * 100) : 0,
            fatPercent: calories > 0 ? Math.round((fatCals / calories) * 100) : 0
        };
    }

    /**
     * Calculate ideal macros based on goals
     */
    static calculateIdealMacros(tdee, goal = 'balanced') {
        const goals = {
            balanced: { protein: 0.3, carbs: 0.45, fat: 0.25 },
            highProtein: { protein: 0.4, carbs: 0.4, fat: 0.2 },
            lowCarb: { protein: 0.35, carbs: 0.25, fat: 0.4 },
            bulking: { protein: 0.25, carbs: 0.55, fat: 0.2 }
        };

        const distribution = goals[goal] || goals.balanced;

        return {
            protein: Math.round((tdee * distribution.protein) / 4),
            carbs: Math.round((tdee * distribution.carbs) / 4),
            fat: Math.round((tdee * distribution.fat) / 9)
        };
    }

    /**
     * Calculate progress
     */
    static calculateProgress(currentValue, previousValue) {
        if (!previousValue) return 0;
        const change = currentValue - previousValue;
        const percentage = (change / previousValue) * 100;
        return {
            change,
            percentage: Math.round(percentage * 10) / 10,
            direction: change > 0 ? 'up' : 'down'
        };
    }

    /**
     * Calculate moving average
     */
    static calculateMovingAverage(values, days = 7) {
        if (values.length === 0) return 0;
        
        const recent = values.slice(-days);
        const sum = recent.reduce((a, b) => a + b, 0);
        return Math.round((sum / recent.length) * 10) / 10;
    }

    /**
     * Calculate consistency score (0-100)
     */
    static calculateConsistencyScore(logs, targetDays = 30) {
        if (!logs || logs.length === 0) return 0;

        // Group logs by date
        const dates = new Set(logs.map(log => {
            const d = new Date(log.date);
            return d.toISOString().split('T')[0];
        }));

        const loggingDays = dates.size;
        const consistency = Math.min(100, Math.round((loggingDays / targetDays) * 100));
        return consistency;
    }

    /**
     * Calculate target weight timeline
     */
    static calculateTimelineToTarget(currentWeight, targetWeight, dailyDeficit) {
        if (dailyDeficit <= 0) return null;

        const weightDifference = Math.abs(currentWeight - targetWeight);
        const caloriesNeeded = weightDifference * 7700;
        const daysNeeded = caloriesNeeded / dailyDeficit;

        return {
            daysNeeded: Math.round(daysNeeded),
            weeksNeeded: Math.round(daysNeeded / 7),
            monthsNeeded: Math.round(daysNeeded / 30),
            estimatedDate: new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000)
        };
    }
}

// Export class
