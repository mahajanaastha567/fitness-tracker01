// Helper function to get local date string in YYYY-MM-DD format
function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Weight Management
function getWeights() {
    return JSON.parse(localStorage.getItem("weights")) || [];
}

function saveWeights(data) {
    localStorage.setItem("weights", JSON.stringify(data));
}

function addWeight() {
    let currentWeight = parseFloat(document.getElementById("currentWeight").value);
    let targetWeight = parseFloat(document.getElementById("targetWeight").value);
    let date = document.getElementById("weightDate").value || getLocalDateString();

    if (!currentWeight || !targetWeight) {
        alert("Fill all weight fields");
        return;
    }

    let weights = getWeights();
    weights.push({ currentWeight, targetWeight, date });
    saveWeights(weights);

    displayWeightStatus();
    updateMealPlannerByWeight(currentWeight);
    document.getElementById("currentWeight").value = "";
    document.getElementById("targetWeight").value = "";
}

function displayWeightStatus() {
    let weights = getWeights();
    if (weights.length === 0) {
        document.getElementById("weightStatus").innerHTML = "No weight data logged yet";
        return;
    }

    let mode = localStorage.getItem("fitnessMode") || "maintenance";
    
    // Group weights by date
    let weightsByDate = {};
    weights.forEach((w, index) => {
        if (!weightsByDate[w.date]) {
            weightsByDate[w.date] = [];
        }
        weightsByDate[w.date].push({...w, index});
    });

    // Sort dates in reverse order (newest first)
    let sortedDates = Object.keys(weightsByDate).sort().reverse();

    let status = `<strong style="font-size: 16px; color: #FF1493;">📊 Weight History</strong><br>`;

    sortedDates.forEach((date) => {
        status += `<div style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #FFB3D9 0%, #B8E1F5 100%); padding: 10px 15px; border-radius: 8px; margin: 15px 0 10px 0; font-weight: bold; color: #333;">
            <span>📅 ${date}</span>
            <button onclick="deleteWeightsByDate('${date}')" style="background: linear-gradient(135deg, #FFB347 0%, #FFA07A 100%); border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">🗑️ Delete</button>
        </div>`;

        weightsByDate[date].forEach((w) => {
            let difference = w.targetWeight - w.currentWeight;
            let statusColor = mode === "weightLoss" && difference > 0 ? "#FF69B4" : mode === "weightGain" && difference < 0 ? "#FF69B4" : "#FFB347";
            
            status += `<div style="margin: 10px 0 10px 20px; padding: 10px; border-left: 3px solid ${statusColor}; background: rgba(255, 179, 217, 0.1); border-radius: 4px;">
                📍 Current: <strong>${w.currentWeight} kg</strong> | 
                🎯 Target: <strong>${w.targetWeight} kg</strong> | 
                📈 Difference: <strong style="color: ${statusColor}">${difference > 0 ? '+' : ''}${difference.toFixed(1)} kg</strong>
            </div>`;
        });
    });

    document.getElementById("weightStatus").innerHTML = status;
}

// Diet/Meal Management
// Goals
function setDailyGoals() {
    let calorieGoal = document.getElementById("calorieGoal").value;
    let proteinGoal = document.getElementById("proteinGoal").value;

    if (!calorieGoal || !proteinGoal) {
        alert("Fill all goal fields");
        return;
    }

    localStorage.setItem("calorieGoal", calorieGoal);
    localStorage.setItem("proteinGoal", proteinGoal);
    alert("✨ Daily goals saved!");
}

// Fitness Mode
function updateMode(mode) {
    localStorage.setItem("fitnessMode", mode);
    displayWeightStatus();
}

// Workout Management
function getWorkouts() {
    return JSON.parse(localStorage.getItem("workouts")) || [];
}

function saveWorkouts(data) {
    localStorage.setItem("workouts", JSON.stringify(data));
}

// Recommended Workout
function displayRecommendedWorkout() {
    let mode = localStorage.getItem("fitnessMode") || "maintenance";

    let recommendations = {
        weightLoss: {
            title: "⬇️ Weight Loss Workout",
            description: "High-intensity cardio and strength training to maximize calorie burn.",
            workouts: [
                "🏃 Running: 30-45 mins at moderate pace (400-600 cal)",
                "🚴 Cycling: 45-60 mins steady state (500-700 cal)",
                "🤸 HIIT Training: 20-30 mins high intensity (300-500 cal)",
                "🏊 Swimming: 30-40 mins continuous (400-550 cal)",
                "🤾 Jump Rope: 20-30 mins intervals (300-450 cal)"
            ],
            frequency: "5-6 days per week",
            totalCal: "2000-3000 cal/week",
            tips: "Focus on cardio, incorporate strength training 2-3x per week"
        },
        weightGain: {
            title: "⬆️ Weight Gain Workout",
            description: "Heavy strength training with progressive overload for muscle building.",
            workouts: [
                "🏋️ Weight Lifting: 45-60 mins heavy compound lifts (200-300 cal)",
                "💪 Strength Training: 5x5 routine, 3-4 sets (250-350 cal)",
                "🤸 Resistance Training: Machines and cables (200-300 cal)",
                "🧘 Yoga & Stretching: Recovery and flexibility (150-200 cal)",
                "🏃 Light Cardio: 10-20 mins walking or light jogging (100-150 cal)"
            ],
            frequency: "4-5 days per week",
            totalCal: "1000-1500 cal/week",
            tips: "Prioritize heavy lifting, eat in caloric surplus, limit cardio"
        },
        maintenance: {
            title: "⚖️ Maintenance Workout",
            description: "Balanced mix of cardio and strength training to stay fit.",
            workouts: [
                "🏃 Running: 30 mins moderate pace (300-400 cal)",
                "🏋️ Strength Training: 30-40 mins full body (250-300 cal)",
                "🚴 Cycling: 40 mins steady state (350-450 cal)",
                "🧘 Yoga: 30-45 mins (150-250 cal)",
                "⛹️ Sports: Basketball, tennis, etc (300-400 cal)"
            ],
            frequency: "4-5 days per week",
            totalCal: "1500-2000 cal/week",
            tips: "Mix cardio and strength equally, ensure adequate rest days"
        }
    };

    let workout = recommendations[mode];
    let html = `<strong style="font-size: 16px; color: #FF1493;">${workout.title}</strong><br>
        <div style="margin-top: 10px;">
        <p><strong>📝 ${workout.description}</strong></p>
        <strong style="display: block; margin-top: 15px; color: #C77DAA;">💪 Recommended Workouts:</strong>`;
    
    workout.workouts.forEach(w => {
        html += `<br>• ${w}`;
    });

    html += `<br><br><strong style="color: #C77DAA;">📅 Frequency:</strong> ${workout.frequency}
        <br><strong style="color: #C77DAA;">🔥 Weekly Calorie Burn:</strong> ${workout.totalCal}
        <br><strong style="color: #C77DAA;">💡 Tips:</strong> ${workout.tips}
        </div>`;

    document.getElementById("workoutRecommendation").innerHTML = html;
}

function addWorkout() {
    let type = document.getElementById("type").value;
    let duration = document.getElementById("duration").value;
    let calories = document.getElementById("calories").value;

    if (!type || !duration || !calories) {
        alert("Fill all fields");
        return;
    }

    let workouts = getWorkouts();
    let date = new Date().toISOString().split('T')[0];
    workouts.push({ type, duration, calories, date });
    saveWorkouts(workouts);

    displayWorkouts();
    drawChart();
    document.getElementById("type").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("calories").value = "";
}

function displayWorkouts() {
    let workouts = getWorkouts();

    let list = document.getElementById("workoutList");
    list.innerHTML = "";

    if (workouts.length === 0) {
        list.innerHTML = "<li style='border: none; text-align: center; color: #999;'>No workouts logged yet - Time to get moving! 💪</li>";
        return;
    }

    // Group workouts by date
    let workoutsByDate = {};
    workouts.forEach((w, index) => {
        if (!workoutsByDate[w.date]) {
            workoutsByDate[w.date] = [];
        }
        workoutsByDate[w.date].push({...w, index});
    });

    // Sort dates in reverse order (newest first)
    let sortedDates = Object.keys(workoutsByDate).sort().reverse();

    sortedDates.forEach((date) => {
        // Add date header with delete button
        let dateHeader = document.createElement("li");
        dateHeader.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #FFB3D9 0%, #B8E1F5 100%); padding: 10px 15px; border-radius: 8px; margin: 15px 0 10px 0; font-weight: bold; color: #333;">
            <span>📅 ${date}</span>
            <button onclick="deleteWorkoutsByDate('${date}')" style="background: linear-gradient(135deg, #FFB347 0%, #FFA07A 100%); border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">🗑️ Delete</button>
        </div>`;
        dateHeader.style.border = "none";
        list.appendChild(dateHeader);

        // Add workouts for this date
        workoutsByDate[date].forEach((w) => {
            let li = document.createElement("li");
            li.innerHTML = `<div style="flex: 1; margin-left: 15px;">
                <strong>🏋️ ${w.type}</strong><br>
                <span style="color: #666; font-size: 13px;">
                ⏱️ ${w.duration} mins | 🔥 ${w.calories} cal burned
                </span>
            </div>
            <button onclick="deleteWorkout(${w.index})" style="background: linear-gradient(135deg, #FFB347 0%, #FFA07A 100%);">Remove</button>`;
            list.appendChild(li);
        });
    });
}

function deleteWorkout(index) {
    let workouts = getWorkouts();
    workouts.splice(index, 1);
    saveWorkouts(workouts);
    displayWorkouts();
    drawChart();
}

// Chart
function drawChart() {
    let canvas = document.getElementById("chart");
    if (!canvas) return;

    let ctx = canvas.getContext("2d");
    let workouts = getWorkouts();
    let last7Days = getWorkoutsLast7Days();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#4CAF50";

    let maxCalories = Math.max(...last7Days.map(d => d.calories), 1);
    let barWidth = canvas.width / 7;

    last7Days.forEach((day, i) => {
        let height = (day.calories / maxCalories) * (canvas.height - 40);
        ctx.fillRect(i * barWidth + 10, canvas.height - height - 30, barWidth - 20, height);
        
        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(day.date.slice(5), i * barWidth + barWidth / 2, canvas.height - 10);
        ctx.fillStyle = "#4CAF50";
    });
}

function getWorkoutsLast7Days() {
    let workouts = getWorkouts();
    let days = [];
    
    for (let i = 6; i >= 0; i--) {
        let date = new Date();
        date.setDate(date.getDate() - i);
        let dateStr = date.toISOString().split('T')[0];
        let dayWorkouts = workouts.filter(w => w.date === dateStr);
        let calories = dayWorkouts.reduce((sum, w) => sum + parseInt(w.calories), 0);
        days.push({ date: dateStr, calories });
    }
    
    return days;
}

/* Dark Mode */
function toggleTheme() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

/* Initialize */
function init() {
    console.log("Initializing app...");
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark");
    }
    
    let mode = localStorage.getItem("fitnessMode") || "maintenance";
    document.querySelector(`input[value="${mode}"]`).checked = true;
    
    displayWeightStatus();
    drawChart();
    console.log("App initialized.");
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Close menu when a link is clicked
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            document.querySelector('.nav-menu').classList.remove('active');
        });
    });
    init();  // Initialize the app
});

// Delete all weights for a specific date
function deleteWeightsByDate(date) {
    if (!confirm(`🗑️ Delete all weight records for ${date}?`)) return;
    let weights = getWeights();
    weights = weights.filter(w => w.date !== date);
    saveWeights(weights);
    displayWeightStatus();
}

// Delete all workouts for a specific date
function deleteWorkoutsByDate(date) {
    if (!confirm(`🗑️ Delete all workouts for ${date}?`)) return;
    let workouts = getWorkouts();
    workouts = workouts.filter(w => w.date !== date);
    saveWorkouts(workouts);
    displayWorkouts();
    drawChart();
}

// ============ MONTHLY MEAL PLANNER BY WEIGHT ============

// Comprehensive meal plans for different weight ranges
const mealPlans = {
    "60-70": {
        veg: {
            calories: "1800-2000 cal/day",
            protein: "50-60g/day",
            description: "Light vegetarian meal plan for weight 60-70 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥣 Oatmeal (50g) with berries and honey", lunch: "🥗 Spinach salad with paneer (100g) and olive oil", dinner: "🍲 Lentil soup with whole wheat bread", snacks: "🥜 handful of almonds, Green tea" },
                    { day: "Tuesday", breakfast: "🥚 2 Boiled eggs with toast and butter", lunch: "🥘 Mixed vegetable curry with quinoa (1 cup)", dinner: "🍝 Pasta with tomato sauce and mushrooms", snacks: "🍎 Apple with peanut butter" },
                    { day: "Wednesday", breakfast: "🥛 Milk (200ml) with granola and banana", lunch: "🫘 Chickpea salad with raw veggies", dinner: "🥦 Steamed broccoli with brown rice and sesame oil", snacks: "🧅 Cucumber and hummus" },
                    { day: "Thursday", breakfast: "🥞 Whole wheat pancakes with berries", lunch: "🍲 Tomato and basil soup with grilled cheese", dinner: "🥕 Roasted vegetables with tofu and teriyaki sauce", snacks: "🥛 Greek yogurt" },
                    { day: "Friday", breakfast: "🥣 Chia seed pudding with almond milk", lunch: "🥗 Caesar salad with paneer cubes", dinner: "🍚 Vegetable biryani (moderate portions)", snacks: "🍌 Banana with honey" },
                    { day: "Saturday", breakfast: "🥞 Momos (4 pieces) with soup", lunch: "🥘 Baked sweet potato with cottage cheese", dinner: "🍝 Spaghetti with white sauce and spinach", snacks: "🥒 Pickled veggies, herbal tea" },
                    { day: "Sunday", breakfast: "🍳 Vegetable omelette with whole grain toast", lunch: "🫘 Dal makhani with rice", dinner: "🥗 Mixed green salad with sunflower seeds", snacks: "🍎 Seasonal fruit" }
                ]
            }
        },
        nonveg: {
            calories: "1800-2000 cal/day",
            protein: "60-70g/day",
            description: "Light non-vegetarian meal plan for weight 60-70 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥚 2 Scrambled eggs with whole wheat toast", lunch: "🍗 Grilled chicken breast (150g) with steamed vegetables", dinner: "🐟 Grilled fish (120g) with rice and salad", snacks: "🥜 Almonds, Green tea" },
                    { day: "Tuesday", breakfast: "🥛 Milk with granola and banana", lunch: "🍲 Chicken and vegetable soup with bread", dinner: "🍝 Pasta with lean meat sauce and veggies", snacks: "🍎 Apple with almond butter" },
                    { day: "Wednesday", breakfast: "🥞 Oatmeal with berries and honey", lunch: "🥘 Lean beef and broccoli stir-fry with brown rice", dinner: "🐔 Baked chicken thighs with roasted carrots", snacks: "🧅 Cucumber and yogurt dip" },
                    { day: "Thursday", breakfast: "🥣 Cereal with low-fat milk and strawberries", lunch: "🐟 Tuna salad with whole grain crackers", dinner: "🍖 Turkey meatballs with tomato sauce and pasta", snacks: "🥛 Greek yogurt" },
                    { day: "Friday", breakfast: "🥚 Omelette with mushrooms and cheese", lunch: "🍗 Grilled chicken with quinoa and veggies", dinner: "🐟 Baked salmon with sweet potato and greens", snacks: "🍌 Banana with honey" },
                    { day: "Saturday", breakfast: "🥞 Pancakes with lean turkey sausage", lunch: "🥘 Chicken curry with brown rice (moderate)", dinner: "🍝 Spaghetti with ground turkey and marinara", snacks: "🥒 Pickles, herbal tea" },
                    { day: "Sunday", breakfast: "🍳 Vegetable and egg scramble with toast", lunch: "🍲 Chicken stew with vegetables", dinner: "🥗 Mixed salad with grilled shrimp and olive oil", snacks: "🍎 Orange" }
                ]
            }
        }
    },
    "70-80": {
        veg: {
            calories: "2000-2200 cal/day",
            protein: "60-70g/day",
            description: "Moderate vegetarian meal plan for weight 70-80 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥣 Oatmeal (60g) with fruits and nuts", lunch: "🥗 Paneer tikka salad with brown rice", dinner: "🍲 Dal with whole wheat roti (2)", snacks: "🥜 Mixed nuts, Protein shake" },
                    { day: "Tuesday", breakfast: "🥚 3 Boiled eggs with toast and butter", lunch: "🥘 Chickpea curry with jeera rice", dinner: "🌽 Corn and vegetable pasta", snacks: "🍌 Banana with peanut butter" },
                    { day: "Wednesday", breakfast: "🥛 Milk shake with banana and oats", lunch: "🥗 Greek salad with feta and chickpeas", dinner: "🍚 Vegetable biryani with yogurt", snacks: "🥒 Cucumber and salad" },
                    { day: "Thursday", breakfast: "🥞 Wheat pancakes with honey and berries", lunch: "🍲 Tomato soup with grilled paneer and bread", dinner: "🥕 Roasted vegetables with tofu and tempeh", snacks: "🧅 Hummus and veggies" },
                    { day: "Friday", breakfast: "🥣 Chia seeds with yogurt and granola", lunch: "🥗 Mixed vegetable salad with sunflower seeds", dinner: "🍝 Whole wheat pasta with vegetable sauce", snacks: "🍎 Apple with almond butter" },
                    { day: "Saturday", breakfast: "🍳 Vegetable omelette with cheese", lunch: "🥘 Rajma (kidney beans) with rice", dinner: "🌽 Corn soup with bread croutons", snacks: "🥛 Greek yogurt with berries" },
                    { day: "Sunday", breakfast: "🥞 Semolina upma with vegetables", lunch: "🫘 Lentil soup with roasted beetroot", dinner: "🥗 Large mixed salad with tahini dressing", snacks: "🍊 Seasonal fruit" }
                ]
            }
        },
        nonveg: {
            calories: "2000-2200 cal/day",
            protein: "70-85g/day",
            description: "Moderate non-vegetarian meal plan for weight 70-80 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥚 3 Scrambled eggs with toast", lunch: "🍗 Grilled chicken (180g) with vegetables and rice", dinner: "🐟 Baked fish with lemon and steamed broccoli", snacks: "🥜 Almonds, Protein shake" },
                    { day: "Tuesday", breakfast: "🥛 Milk with granola and berries", lunch: "🍖 Lean beef stir-fry with brown rice", dinner: "🍗 Chicken curry with whole wheat roti", snacks: "🍌 Banana with Greek yogurt" },
                    { day: "Wednesday", breakfast: "🥞 Oatmeal pancakes with turkey bacon", lunch: "🐟 Tuna salad with whole grain bread", dinner: "🍝 Pasta with lean ground meat sauce", snacks: "🧅 Veggies with ranch dip" },
                    { day: "Thursday", breakfast: "🥣 Cereal with milk and banana", lunch: "🍗 Roasted chicken thighs with sweet potato", dinner: "🥘 Turkey meatball curry with rice", snacks: "🥛 Greek yogurt" },
                    { day: "Friday", breakfast: "🍳 Meat and veggie omelette", lunch: "🐟 Grilled salmon with quinoa salad", dinner: "🍖 Grilled steak with vegetables", snacks: "🍎 Apple" },
                    { day: "Saturday", breakfast: "🥞 Pancakes with sausage links", lunch: "🍲 Chicken and lentil soup", dinner: "🥘 Chicken biryani (moderate portion)", snacks: "🥒 Pickles, tea" },
                    { day: "Sunday", breakfast: "🍳 Omelette with ham and cheese", lunch: "🥗 Chicken and vegetable salad", dinner: "🍲 Fish soup with seafood", snacks: "🍊 Orange" }
                ]
            }
        }
    },
    "80-90": {
        veg: {
            calories: "2200-2500 cal/day",
            protein: "70-85g/day",
            description: "Standard vegetarian meal plan for weight 80-90 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥣 Oatmeal (80g) with fruits and almonds", lunch: "🥗 Paneer salad with brown rice (1.5 cups)", dinner: "🍲 Dal with 3 roti and ghee", snacks: "🥜 Mixed nuts, Protein shake" },
                    { day: "Tuesday", breakfast: "🥚 4 Eggs with toast, butter, jam", lunch: "🥘 Chickpea curry with jeera rice (2 cups)", dinner: "🌽 Corn and vegetable pasta al dente", snacks: "🍌 Banana with peanut butter, Milk" },
                    { day: "Wednesday", breakfast: "🥛 Milk shake with banana, oats, peanut butter", lunch: "🥗 Greek salad with feta, chickpeas, olive oil", dinner: "🍚 Vegetable biryani with yogurt (1.5 cups)", snacks: "🥒 Cucumber, yogurt dip" },
                    { day: "Thursday", breakfast: "🥞 Wheat pancakes with honey, butter, berries", lunch: "🍲 Tomato soup with paneer and whole wheat bread", dinner: "🥕 Roasted vegetables with tofu and brown rice", snacks: "🧅 Hummus, vegetables" },
                    { day: "Friday", breakfast: "🥣 Granola with yogurt and berries", lunch: "🥗 Mixed salad with sunflower seeds and olive oil", dinner: "🍝 Whole wheat pasta with cream sauce", snacks: "🍎 Apple with peanut butter" },
                    { day: "Saturday", breakfast: "🍳 Vegetable omelette with cheese and butter", lunch: "🥘 Rajma with rice and vegetables", dinner: "🌽 Corn soup with bread and butter", snacks: "🥛 Greek yogurt with granola" },
                    { day: "Sunday", breakfast: "🥞 Upma with coconut and vegetables", lunch: "🫘 Lentil stew with roasted beetroot", dinner: "🥗 Large salad with tahini, olive oil dressing", snacks: "🍊 Fruit with nuts" }
                ]
            }
        },
        nonveg: {
            calories: "2200-2500 cal/day",
            protein: "85-100g/day",
            description: "Standard non-vegetarian meal plan for weight 80-90 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥚 4 Scrambled eggs with toast and butter", lunch: "🍗 Grilled chicken (200g) with rice, vegetables", dinner: "🐟 Baked fish with steamed vegetables and rice", snacks: "🥜 Almonds, Protein shake" },
                    { day: "Tuesday", breakfast: "🥛 Milk with granola and banana", lunch: "🍖 Lean beef stir-fry with brown rice (2 cups)", dinner: "🍗 Chicken curry with 2-3 roti", snacks: "🍌 Banana with yogurt" },
                    { day: "Wednesday", breakfast: "🥞 Oatmeal pancakes with turkey bacon", lunch: "🐟 Tuna salad with whole grain bread and butter", dinner: "🍝 Pasta with lean ground meat sauce (2 portions)", snacks: "🧅 Ranch veggies" },
                    { day: "Thursday", breakfast: "🥣 Cereal with milk and banana", lunch: "🍗 Roasted chicken with sweet potato", dinner: "🥘 Turkey meatball curry with 2 roti", snacks: "🥛 Greek yogurt" },
                    { day: "Friday", breakfast: "🍳 Meat and veggie omelette with butter", lunch: "🐟 Salmon with quinoa (1.5 cups) and salad", dinner: "🍖 Grilled steak with potatoes and vegetables", snacks: "🍎 Apple" },
                    { day: "Saturday", breakfast: "🥞 Pancakes with sausage and maple syrup", lunch: "🍲 Chicken and vegetable soup with bread", dinner: "🥘 Elaborate biryani with meat (1.5 cups)", snacks: "🥒 Pickles" },
                    { day: "Sunday", breakfast: "🍳 Ham and cheese omelette", lunch: "🥗 Chicken and vegetable salad with olive oil", dinner: "🍲 Seafood soup with fish and prawns", snacks: "🍊 Orange with nuts" }
                ]
            }
        }
    },
    "90-100": {
        veg: {
            calories: "2500-2800 cal/day",
            protein: "85-100g/day",
            description: "Enhanced vegetarian meal plan for weight 90-100 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥣 Oatmeal (100g) with nuts and dates", lunch: "🥗 Paneer tikka with rice (2 cups) and olive oil", dinner: "🍲 Dal makhani with 3-4 roti and ghee", snacks: "🥜 PB&J sandwich, Protein shake" },
                    { day: "Tuesday", breakfast: "🥚 5 Eggs with toast, butter, jam", lunch: "🥘 Chickpea curry with basmati rice (2.5 cups)", dinner: "🍝 Creamy pasta with vegetables", snacks: "🍌 Banana with peanut butter, Milk" },
                    { day: "Wednesday", breakfast: "🥛 Protein milk shake with oats, peanut butter", lunch: "🥗 Loaded salad with paneer and seeds", dinner: "🍚 Vegetable pulao with yogurt (2 cups)", snacks: "🥒 Veggies with hummus" },
                    { day: "Thursday", breakfast: "🥞 Pancakes with honey, butter, nuts", lunch: "🍲 Rich tomato soup with paneer and bread", dinner: "🥕 Roasted veggies with tofu and rice (2 cups)", snacks: "🧅 Cheese and veggies" },
                    { day: "Friday", breakfast: "🥣 Granola with yogurt and dried fruits", lunch: "🥗 Salad with seeds and olive oil (generous)", dinner: "🍝 Pesto pasta with cream cheese", snacks: "🍎 Apple with almond butter" },
                    { day: "Saturday", breakfast: "🍳 Cheese omelette with vegetables and bread", lunch: "🥘 Rajma with rice and butter", dinner: "🌽 Corn chowder with cream and bread", snacks: "🥛 Chocolate milk with granola" },
                    { day: "Sunday", breakfast: "🥞 Paneer paratha with butter and honey", lunch: "🫘 Lentil khichdi with ghee", dinner: "🥗 Hearty salad with nuts and olive oil", snacks: "🍊 Dry fruits and nuts" }
                ]
            }
        },
        nonveg: {
            calories: "2500-2800 cal/day",
            protein: "100-120g/day",
            description: "Enhanced non-vegetarian meal plan for weight 90-100 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥚 5 Eggs with toast, butter, bacon", lunch: "🍗 Grilled chicken (250g) with rice, vegetables", dinner: "🐟 Baked fish with sweet potato and salad", snacks: "🥜 Almonds, Protein shake" },
                    { day: "Tuesday", breakfast: "🥛 Protein milk with granola and banana", lunch: "🍖 Beef stir-fry with rice (2.5 cups)", dinner: "🍗 Chicken curry with 4 roti", snacks: "🍌 Banana with peanut butter" },
                    { day: "Wednesday", breakfast: "🥞 Oatmeal with bacon and honey", lunch: "🐟 Tuna and egg salad with bread", dinner: "🍝 Pasta with ground meat and cream sauce (2.5 portions)", snacks: "🧅 Veggies and dip" },
                    { day: "Thursday", breakfast: "🥣 Granola with milk and berries", lunch: "🍗 Roasted chicken thighs with potatoes", dinner: "🥘 Turkey meatball curry with rice", snacks: "🥛 Greek yogurt with granola" },
                    { day: "Friday", breakfast: "🍳 Ham and veggie omelette with cheese", lunch: "🐟 Salmon with quinoa (2 cups) and veggies", dinner: "🍖 Steak with fries and salad", snacks: "🍎 Apple" },
                    { day: "Saturday", breakfast: "🥞 Pancakes with sausage links and syrup", lunch: "🍲 Chicken noodle soup with bread", dinner: "🥘 Biryani with meat (2 cups)", snacks: "🥒 Pickles, nuts" },
                    { day: "Sunday", breakfast: "🍳 Full breakfast: eggs, sausage, toast, butter", lunch: "🥗 Chicken and vegetable salad with croutons", dinner: "🍲 Seafood with noodles", snacks: "🍊 Fruit" }
                ]
            }
        }
    },
    "100-110": {
        veg: {
            calories: "2800-3100 cal/day",
            protein: "100-115g/day",
            description: "High-calorie vegetarian meal plan for weight 100-110 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥣 Oatmeal (120g) with nuts, seeds, dates", lunch: "🥗 Paneer biryani with rice (2.5 cups) and nuts", dinner: "🍲 Dal makhani with 4 roti, ghee, butter", snacks: "🥜 PB&J sandwich with chips, Shake" },
                    { day: "Tuesday", breakfast: "🥚 5-6 Eggs with toast, butter, jam", lunch: "🥘 Rich chickpea curry with basmati rice (3 cups)", dinner: "🍝 Creamy Alfredo with paneer", snacks: "🍌 Banana with peanut butter, Milk" },
                    { day: "Wednesday", breakfast: "🥛 Protein shake with oats, PB, avocado", lunch: "🥗 Loaded salad with paneer, seeds, olive oil (generous)", dinner: "🍚 Vegetable pulao with ghee (2.5 cups)", snacks: "🥒 Cheese and veggies" },
                    { day: "Thursday", breakfast: "🥞 Pancakes with honey, butter, cream, nuts", lunch: "🍲 Rich paneer soup with cream and bread", dinner: "🥕 Roasted veggies with tofu and rice (2.5 cups)", snacks: "🧅 Cheese pakora or veggies" },
                    { day: "Friday", breakfast: "🥣 Granola with yogurt, dry fruits, honey", lunch: "🥗 Chickpea salad with olive oil and seeds", dinner: "🍝 Butter pasta with cream cheese", snacks: "🍎 Apple with almond butter" },
                    { day: "Saturday", breakfast: "🍳 Cheese omelette with toast, butter, veggies", lunch: "🥘 Rajma and rice with generous ghee", dinner: "🌽 Corn chowder with cream and bread", snacks: "🥛 Milk with granola and honey" },
                    { day: "Sunday", breakfast: "🥞 Paneer paratha with butter and honey", lunch: "🫘 Lentil khichdi with ghee and vegetables", dinner: "🥗 Hearty salad with nuts and generous olive oil", snacks: "🍊 Mixed dry fruits" }
                ]
            }
        },
        nonveg: {
            calories: "2800-3100 cal/day",
            protein: "115-135g/day",
            description: "High-calorie non-vegetarian meal plan for weight 100-110 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥚 6 Eggs with toast, butter, bacon, jam", lunch: "🍗 Grilled chicken (280g) with rice (2.5 cups)", dinner: "🐟 Baked fish with sweet potato, olive oil", snacks: "🥜 Almonds, Protein shake with milk" },
                    { day: "Tuesday", breakfast: "🥛 Protein shake with granola, banana, PB", lunch: "🍖 Beef stir-fry with rice (3 cups), oil", dinner: "🍗 Chicken curry with 4-5 roti", snacks: "🍌 Banana with peanut butter, Milk" },
                    { day: "Wednesday", breakfast: "🥞 Oatmeal pancakes with bacon, syrup", lunch: "🐟 Tuna salad with mayo and bread (2 slices)", dinner: "🍝 Pasta with ground meat and cream (3 portions)", snacks: "🧅 Veggies with mayo dip" },
                    { day: "Thursday", breakfast: "🥣 Granola with milk, berries, honey", lunch: "🍗 Roasted chicken with potatoes and oil", dinner: "🥘 Turkey meatball curry with rice", snacks: "🥛 Milk with granola" },
                    { day: "Friday", breakfast: "🍳 Steak, eggs, toast, butter, veggies", lunch: "🐟 Salmon with quinoa (2.5 cups) and salad", dinner: "🍖 Grilled steak with fries and vegetables", snacks: "🍎 Apple" },
                    { day: "Saturday", breakfast: "🥞 Pancakes with sausage, syrup, butter", lunch: "🍲 Chicken noodle soup with bread and butter", dinner: "🥘 Meat biryani (2.5 cups) with yogurt", snacks: "🥒 Pickles, nuts" },
                    { day: "Sunday", breakfast: "🍳 Full English: eggs, sausage, bacon, toast, butter", lunch: "🥗 Large chicken salad with croutons, mayo", dinner: "🍲 Seafood curry with rice", snacks: "🍊 Fruits and nuts" }
                ]
            }
        }
    },
    "110-120": {
        veg: {
            calories: "3100-3400 cal/day",
            protein: "115-135g/day",
            description: "Maximum vegetarian meal plan for weight 110-120 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥣 Oatmeal (150g) with nuts, seeds, dates, honey", lunch: "🥗 Paneer biryani (2.5 cups) with rice, nuts, ghee", dinner: "🍲 Rich dal makhani with 4-5 roti, ghee", snacks: "🥜 PB sandwich with fries, Protein shake" },
                    { day: "Tuesday", breakfast: "🥚 6-7 Eggs with toast, butter, jam, cheese", lunch: "🥘 Chickpea curry (2.5 cups) with rice (3 cups)", dinner: "🍝 Rich Alfredo with paneer (3 portions)", snacks: "🍌 Banana with PB, Milk" },
                    { day: "Wednesday", breakfast: "🥛 Protein shake with oats, PB, avocado, milk", lunch: "🥗 Hearty salad with paneer, ghee, olive oil", dinner: "🍚 Vegetable pulao with ghee (3 cups)", snacks: "🧀 Cheese pakora or veggies" },
                    { day: "Thursday", breakfast: "🥞 Pancakes with honey, butter, cream, nuts", lunch: "🍲 Rich paneer soup with cream and garlic bread", dinner: "🥕 Roasted veggies with tofu and rice (3 cups)", snacks: "🧅 Fried veggies or pakora" },
                    { day: "Friday", breakfast: "🥣 Granola with yogurt, dry fruits, honey, nuts", lunch: "🥗 Chickpea salad with generous olive oil", dinner: "🍝 Butter pasta with heavy cream", snacks: "🍎 Apple with almond butter" },
                    { day: "Saturday", breakfast: "🍳 Cheese omelette with toast, butter, veggies", lunch: "🥘 Rajma and rice with ghee and butter", dinner: "🌽 Cream corn chowder with bread and butter", snacks: "🥛 Milk with granola, honey, nuts" },
                    { day: "Sunday", breakfast: "🥞 Paneer paratha with butter, honey, nuts", lunch: "🫘 Lentil khichdi with ghee, vegetables, seeds", dinner: "🥗 Hearty salad with seeds and generous oils", snacks: "🍊 Mixed dry fruits and nuts" }
                ]
            }
        },
        nonveg: {
            calories: "3100-3400 cal/day",
            protein: "135-155g/day",
            description: "Maximum non-vegetarian meal plan for weight 110-120 kg",
            weeks: {
                "Week 1": [
                    { day: "Monday", breakfast: "🥚 7 Eggs with toast, butter, bacon, jam, cheese", lunch: "🍗 Grilled chicken (300g) with rice (3 cups)", dinner: "🐟 Fish with sweet potato, olive oil, vegetables", snacks: "🥜 Almonds, Protein shake with whole milk" },
                    { day: "Tuesday", breakfast: "🥛 Protein shake with granola, banana, PB, milk", lunch: "🍖 Beef stir-fry with rice (3.5 cups), oil", dinner: "🍗 Chicken curry with 5-6 roti, ghee", snacks: "🍌 Banana with peanut butter, Milk" },
                    { day: "Wednesday", breakfast: "🥞 Oatmeal with bacon, sausage, syrup", lunch: "🐟 Tuna salad with mayo and bread (3 slices)", dinner: "🍝 Pasta with ground meat and cream (3.5 portions)", snacks: "🧅 Veggies with mayo" },
                    { day: "Thursday", breakfast: "🥣 Granola with whole milk, berries, honey", lunch: "🍗 Roasted chicken with potatoes, butter", dinner: "🥘 Turkey meatball curry with rice (2.5 cups)", snacks: "🥛 Whole milk with granola" },
                    { day: "Friday", breakfast: "🍳 Steak, eggs, toast, butter, sausage, veggies", lunch: "🐟 Salmon (200g) with quinoa (2.5 cups), oil", dinner: "🍖 Grilled steak with fries and vegetables", snacks: "🍎 Apple with nuts" },
                    { day: "Saturday", breakfast: "🥞 Pancakes with sausage, bacon, syrup, butter", lunch: "🍲 Chicken noodle soup with bread and butter", dinner: "🥘 Meat biryani (3 cups) with yogurt", snacks: "🥒 Pickles, nuts" },
                    { day: "Sunday", breakfast: "🍳 Full English: multiple eggs, sausage, bacon, toast, butter, cheese", lunch: "🥗 Large chicken salad with croutons, mayo", dinner: "🍲 Seafood curry with rice (3 cups)", snacks: "🍊 Fruits and mixed nuts" }
                ]
            }
        }
    }
};

// Automatically update meal planner based on current weight
function updateMealPlannerByWeight(currentWeight) {
    let weightRange = "";
    
    // Determine weight range
    if (currentWeight >= 60 && currentWeight < 70) {
        weightRange = "60-70";
    } else if (currentWeight >= 70 && currentWeight < 80) {
        weightRange = "70-80";
    } else if (currentWeight >= 80 && currentWeight < 90) {
        weightRange = "80-90";
    } else if (currentWeight >= 90 && currentWeight < 100) {
        weightRange = "90-100";
    } else if (currentWeight >= 100 && currentWeight < 110) {
        weightRange = "100-110";
    } else if (currentWeight >= 110 && currentWeight <= 120) {
        weightRange = "110-120";
    } else if (currentWeight < 60) {
        weightRange = "60-70"; // Default to lowest
    } else if (currentWeight > 120) {
        weightRange = "110-120"; // Default to highest
    }
    
    if (weightRange) {
        // Set the dropdown value
        document.getElementById("weightRange").value = weightRange;
        
        // Auto-load the meal plan
        setTimeout(() => {
            loadMealPlan();
        }, 100);
    }
}

function loadMealPlan() {
    let weightRange = document.getElementById("weightRange").value;
    let dietInput = document.querySelector('input[name="mealPlannerDiet"]:checked');
    let dietType = dietInput ? dietInput.value : "nonveg";

    if (!weightRange) {
        document.getElementById("mealPlannerResult").innerHTML = "<p style='text-align: center; color: #999;'>⚠️ Please select your weight range to view the meal plan</p>";
        return;
    }

    let plan = mealPlans[weightRange][dietType];
    let html = `<strong style="font-size: 18px; color: #FF1493;">📅 ${plan.description.toUpperCase()}</strong><br>`;
    html += `<div style="margin-top: 12px; padding: 10px; background: rgba(255, 179, 217, 0.1); border-radius: 8px;">`;
    html += `<div style="display: flex; gap: 20px; font-weight: bold; color: #C77DAA; margin-bottom: 15px;">`;
    html += `<span>🔥 ${plan.calories}</span>`;
    html += `<span>💪 Protein: ${plan.protein}</span>`;
    html += `</div>`;

    // Display Week 1
    if (plan.weeks["Week 1"]) {
        html += `<strong style="font-size: 16px; color: #FF69B4; margin-top: 15px;">Week 1:</strong><br>`;
        
        plan.weeks["Week 1"].forEach(dayPlan => {
            html += `<div style="margin-top: 12px; padding: 12px; border-left: 3px solid #FFB3D9; background: rgba(255, 240, 245, 0.5); border-radius: 4px;">`;
            html += `<strong style="color: #FF1493; font-size: 14px;">📌 ${dayPlan.day}</strong><br>`;
            html += `<div style="margin-left: 10px; font-size: 13px; line-height: 1.8;">`;
            html += `<div>🌅 <strong>Breakfast:</strong> ${dayPlan.breakfast}</div>`;
            html += `<div>🍽️ <strong>Lunch:</strong> ${dayPlan.lunch}</div>`;
            html += `<div>🍴 <strong>Dinner:</strong> ${dayPlan.dinner}</div>`;
            html += `<div>🥤 <strong>Snacks:</strong> ${dayPlan.snacks}</div>`;
            html += `</div></div>`;
        });
    }

    html += `<div style="margin-top: 20px; padding: 12px; background: linear-gradient(135deg, #FFB3D9 0%, #B8E1F5 100%); border-radius: 8px; font-size: 13px;">`;
    html += `<strong style="color: #333;">💡 Tips:</strong><br>`;
    html += `🌍 This is Week 1 as a sample. Repeat with variations for Weeks 2, 3, and 4.<br>`;
    html += `💧 Drink plenty of water (8-10 glasses daily)<br>`;
    html += `🥗 Add different vegetables and seasonings for variety<br>`;
    html += `⏰ Adjust portion sizes based on your activity level<br>`;
    html += `📝 Consult a nutritionist for personalized adjustments<br>`;
    html += `</div>`;

    html += `</div>`;
    document.getElementById("mealPlannerResult").innerHTML = html;
}

// Load theme on page load
window.addEventListener('load', function() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }
});

init();