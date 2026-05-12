export interface FoodItem {
  id: string;
  name: string;
  category: "Starch" | "Protein" | "Vegetable" | "Fat";
  baseCalories: number;
  unit: string;
  visualHeuristic: string;
  preparationVariants?: {
    label: string;
    calorieImpact: number;
    description: string;
  }[];
  expertTip: string;
}

export const FOOD_DATABASE: FoodItem[] = [
  // --- STARCHES (CARBS) ---
  { id: "pounded-yam", name: "Pounded Yam", category: "Starch", baseCalories: 350, unit: "Standard Ball", visualHeuristic: "One fist-sized ball", expertTip: "Eat with fiber-rich soups like Efo Riro to slow down sugar absorption." },
  { id: "amala-yam", name: "Amala", category: "Starch", baseCalories: 280, unit: "Standard Ball", visualHeuristic: "One medium ball", expertTip: "The high fiber content makes this an excellent choice for weight management." },
  { id: "jollof-rice", name: "Jollof Rice", category: "Starch", baseCalories: 400, unit: "Milk Tin", visualHeuristic: "1.5 Milk Tins", expertTip: "Parboil rice thoroughly to reduce starch content before final cooking." },
  { id: "garri", name: "Eba (Garri)", category: "Starch", baseCalories: 330, unit: "Standard Ball", visualHeuristic: "One medium ball", expertTip: "Use lukewarm water instead of boiling water to maintain a lower glycemic index." },
  { id: "yam-boiled", name: "Boiled Yam", category: "Starch", baseCalories: 250, unit: "Slice", visualHeuristic: "3 Medium Slices", expertTip: "Boiling with the skin on preserves more vitamins and minerals." },
  { id: "tuwo", name: "Tuwo Shinkafa", category: "Starch", baseCalories: 300, unit: "Standard Ball", visualHeuristic: "One large ball", expertTip: "A great gluten-free staple, best served with Gbegiri for extra protein." },
  { id: "bread", name: "Agege Bread", category: "Starch", baseCalories: 280, unit: "Slice", visualHeuristic: "3 Thick Slices", expertTip: "High in simple carbs. Limit intake and pair with a protein like beans or eggs." },
  { id: "sweet-potato", name: "Boiled Sweet Potato", category: "Starch", baseCalories: 180, unit: "Piece", visualHeuristic: "2 Medium Pieces", expertTip: "Excellent source of Vitamin A. Eat with the skin for maximum fiber." },
  { id: "plantain-boiled", name: "Boiled Plantain", category: "Starch", baseCalories: 220, unit: "Finger", visualHeuristic: "1.5 Fingers", expertTip: "Unripe plantain is better for blood sugar management than ripe ones." },
  { id: "wheat-swallow", name: "Wheat Swallow", category: "Starch", baseCalories: 310, unit: "Standard Ball", visualHeuristic: "One medium ball", expertTip: "A higher fiber alternative to garri or pounded yam." },
  { id: "fufu", name: "Fufu (Akpu)", category: "Starch", baseCalories: 340, unit: "Standard Ball", visualHeuristic: "One medium ball", expertTip: "Highly fermented and good for gut health, but high in energy density." },
  { id: "semolina", name: "Semovita", category: "Starch", baseCalories: 320, unit: "Standard Ball", visualHeuristic: "One medium ball", expertTip: "Fortified with vitamins, but ensure you pair with plenty of vegetables." },
  { id: "fried-yam", name: "Fried Yam (Dundun)", category: "Starch", baseCalories: 450, unit: "Slice", visualHeuristic: "4 Small Slices", expertTip: "High in fat. Limit frequency and pair with unsweetened pepper sauce." },
  { id: "fried-plantain", name: "Dodo (Fried Plantain)", category: "Starch", baseCalories: 380, unit: "Slice", visualHeuristic: "6 Diagonal Slices", expertTip: "Ripe plantain absorbs oil easily. Blot with a napkin before eating." },
  { id: "basmati-rice", name: "White Rice", category: "Starch", baseCalories: 240, unit: "Milk Tin", visualHeuristic: "2 Milk Tins", expertTip: "Pair with a high-protein stew and half a plate of vegetables." },
  { id: "ofada-rice", name: "Ofada Rice", category: "Starch", baseCalories: 260, unit: "Milk Tin", visualHeuristic: "1.5 Milk Tins", expertTip: "Unpolished rice with high fiber. The best rice choice for weight loss." },
  { id: "abacha", name: "Abacha (African Salad)", category: "Starch", baseCalories: 300, unit: "Standard Plate", visualHeuristic: "1 Full Plate", expertTip: "High in minerals. Be careful with the amount of palm oil used." },
  { id: "corn-boiled", name: "Boiled Corn", category: "Starch", baseCalories: 150, unit: "Ear", visualHeuristic: "1 Medium Ear", expertTip: "A great complex carb snack. High in fiber and Vitamin B." },
  { id: "pancake", name: "Nigerian Pancake", category: "Starch", baseCalories: 250, unit: "Piece", visualHeuristic: "2 Medium Pieces", expertTip: "Use less sugar and more onions/peppers for a healthier twist." },

  // --- PROTEINS ---
  { id: "beans", name: "Honey Beans", category: "Protein", baseCalories: 250, unit: "Milk Tin", visualHeuristic: "1 Full Milk Tin", expertTip: "Cook with onions and pepper instead of palm oil to keep it heart-healthy." },
  { id: "fish-fried", name: "Fried Titus Fish", category: "Protein", baseCalories: 280, unit: "Piece", visualHeuristic: "1 Large Piece", expertTip: "Rich in Omega-3. Air-fry or grill instead of deep-frying to save 100+ calories." },
  { id: "chicken", name: "Boiled Chicken", category: "Protein", baseCalories: 220, unit: "Piece", visualHeuristic: "1 Drumstick or Thigh", expertTip: "Remove the skin before eating to reduce saturated fat by 50%." },
  { id: "beef", name: "Beef Chunks", category: "Protein", baseCalories: 240, unit: "Piece", visualHeuristic: "3 Medium Pieces", expertTip: "Choose lean cuts and trim visible fat before cooking in stews." },
  { id: "egg", name: "Boiled Eggs", category: "Protein", baseCalories: 155, unit: "Egg", visualHeuristic: "2 Large Eggs", expertTip: "A complete protein. Perfect for muscle repair after your morning activity." },
  { id: "moin-moin", name: "Moin Moin", category: "Protein", baseCalories: 200, unit: "Wrap", visualHeuristic: "1 Medium Wrap", expertTip: "Steaming is the healthiest way to enjoy beans. Great for fiber and protein." },
  { id: "stockfish", name: "Stockfish", category: "Protein", baseCalories: 150, unit: "Piece", visualHeuristic: "2 Large Chunks", expertTip: "Very low in fat and high in protein. Excellent for weight loss stews." },
  { id: "cow-skin", name: "Ponmo (Cow Skin)", category: "Protein", baseCalories: 80, unit: "Piece", visualHeuristic: "4 Large Pieces", expertTip: "Low in calories but also low in protein. Use it for volume and texture." },
  { id: "turkey", name: "Grilled Turkey", category: "Protein", baseCalories: 250, unit: "Piece", visualHeuristic: "1 Medium Chunk", expertTip: "Grilling is better than frying. High in zinc and B vitamins." },
  { id: "goat-meat", name: "Goat Meat (Asun Style)", category: "Protein", baseCalories: 260, unit: "Piece", visualHeuristic: "3 Medium Chunks", expertTip: "Leaner than beef. Great when grilled with plenty of peppers." },
  { id: "snails", name: "Steamed Snails", category: "Protein", baseCalories: 90, unit: "Piece", visualHeuristic: "3 Large Snails", expertTip: "Extremely lean and high in iron. A premium weight-loss protein." },
  { id: "catfish", name: "Point & Kill (Catfish)", category: "Protein", baseCalories: 200, unit: "Piece", visualHeuristic: "1 Large Chunk", expertTip: "High in healthy fats. Best enjoyed in a light pepper soup." },
  { id: "shrimp", name: "Dried Shrimps/Crayfish", category: "Protein", baseCalories: 100, unit: "Handful", visualHeuristic: "1 Small Handful", expertTip: "A great way to add flavor and protein to soups without adding fat." },
  { id: "akara", name: "Akara (Bean Cake)", category: "Protein", baseCalories: 320, unit: "Ball", visualHeuristic: "3 Medium Balls", expertTip: "Fried beans. Limit to 2-3 balls and pair with a light pap or oats." },
  { id: "gizzards", name: "Peppered Gizzards", category: "Protein", baseCalories: 210, unit: "Piece", visualHeuristic: "5-6 Pieces", expertTip: "High in iron and protein, but watch the oil in 'peppered' preparations." },

  // --- VEGETABLES (SOUPS & GREENS) ---
  { id: "efo-riro", name: "Efo Riro (Spinach)", category: "Vegetable", baseCalories: 150, unit: "Ladle", visualHeuristic: "2 Full Ladles", expertTip: "Don't overcook the leaves. 3-5 minutes is enough to preserve Vitamin C." },
  { id: "ewedu", name: "Ewedu Soup", category: "Vegetable", baseCalories: 60, unit: "Ladle", visualHeuristic: "3 Full Ladles", expertTip: "Highly alkaline and great for digestion. Pair with Amala for a low-cal meal." },
  { id: "okro", name: "Okro Soup", category: "Vegetable", baseCalories: 110, unit: "Ladle", visualHeuristic: "2 Full Ladles", expertTip: "Rich in mucilage which aids in lowering cholesterol and managing blood sugar." },
  { id: "salad", name: "Cabbage & Carrots", category: "Vegetable", baseCalories: 80, unit: "Handful", visualHeuristic: "2 Large Handfuls", expertTip: "Use a lemon and vinegar dressing instead of cream to keep it light." },
  { id: "garden-egg", name: "Garden Egg", category: "Vegetable", baseCalories: 40, unit: "Fruit", visualHeuristic: "3-4 Medium Fruits", expertTip: "A powerful antioxidant. Eat as a snack between meals to stay full." },
  { id: "bitter-leaf", name: "Bitter Leaf Soup", category: "Vegetable", baseCalories: 120, unit: "Ladle", visualHeuristic: "2 Ladles", expertTip: "Excellent for liver detox and blood purification." },
  { id: "waterleaf", name: "Waterleaf (Afang/Edikang)", category: "Vegetable", baseCalories: 70, unit: "Ladle", visualHeuristic: "2 Ladles", expertTip: "High in water content and minerals. Great for hydration and skin health." },
  { id: "edikaikong", name: "Edikaikong Soup", category: "Vegetable", baseCalories: 250, unit: "Ladle", visualHeuristic: "1.5 Ladles", expertTip: "Very nutrient dense. Use more pumpkin leaves and less oil for better results." },
  { id: "ogbono", name: "Ogbono Soup", category: "Vegetable", baseCalories: 300, unit: "Ladle", visualHeuristic: "1.5 Ladles", expertTip: "High in healthy fats and fiber. Good for satiety, but watch the calorie density." },
  { id: "egusi", name: "Egusi Soup", category: "Vegetable", baseCalories: 350, unit: "Ladle", visualHeuristic: "1.5 Ladles", expertTip: "Rich in protein and fats. Pair with a small portion of swallow and plenty of water." },
  { id: "banga", name: "Banga Soup", category: "Vegetable", baseCalories: 380, unit: "Ladle", visualHeuristic: "1.5 Ladles", expertTip: "High in vitamins A and E. Very energy-dense, so watch your swallow portion." },
  { id: "white-soup", name: "Afia Efere (White Soup)", category: "Vegetable", baseCalories: 180, unit: "Ladle", visualHeuristic: "2 Ladles", expertTip: "Low fat as it uses no oil. Great for weight loss when paired with light swallow." },
  { id: "cucumber", name: "Cucumber Slices", category: "Vegetable", baseCalories: 20, unit: "Fruit", visualHeuristic: "1 Full Cucumber", expertTip: "Nearly zero calories. Eat anytime you feel hungry between meals." },

  // --- FATS & SNACKS ---
  { id: "avocado", name: "Avocado (Pear)", category: "Fat", baseCalories: 160, unit: "Half", visualHeuristic: "Half a Medium Pear", expertTip: "Healthy monounsaturated fats. Great for brain health and skin." },
  { id: "groundnuts", name: "Roasted Groundnuts", category: "Fat", baseCalories: 170, unit: "Handful", visualHeuristic: "1 Small Handful", expertTip: "High in protein but very calorie-dense. Limit to 10-15 nuts per day." },
  { id: "chin-chin", name: "Chin Chin", category: "Fat", baseCalories: 400, unit: "Handful", visualHeuristic: "1 Small Handful", expertTip: "Very high in sugar and fat. Should be a rare treat, not a daily snack." },
  { id: "puff-puff", name: "Puff Puff", category: "Fat", baseCalories: 200, unit: "Ball", visualHeuristic: "2 Small Balls", expertTip: "Deep fried dough. High in empty calories. Limit to 1-2 pieces max." },
  { id: "kulikuli", name: "Kuli Kuli", category: "Fat", baseCalories: 150, unit: "Piece", visualHeuristic: "3 Medium Sticks", expertTip: "High protein peanut snack. Much healthier than biscuits or sweets." }
];

/**
 * Translation Layer: Maps crisp calorie targets to Visual Plate proportions.
 */
export function translateToVisualPlate(targetCalories: number) {
  if (targetCalories === 0) return null;

  // DYNAMIC LOGIC: Proportions shift based on caloric needs
  let veg = 50;
  let starch = 25;
  let protein = 25;

  if (targetCalories < 1800) {
    // Weight Loss Mode: Massive Veg, Low Starch
    veg = 60;
    starch = 15;
    protein = 25;
  } else if (targetCalories > 2600) {
    // Muscle Gain / Active Mode: More Carbs and Protein
    veg = 40;
    starch = 35;
    protein = 25;
  }

  return {
    plate: {
      vegetables: `${veg}%`,
      starch: `${starch}%`,
      protein: `${protein}%`,
    },
    heuristics: {
      staple: targetCalories > 2200 ? "2 Milk Tins" : "1.5 Milk Tins",
      protein: targetCalories > 2200 ? "1 Full Handful" : "1 Small Handful",
    }
  };
}
