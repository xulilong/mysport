import type { FoodItem } from '../types'

/** 常见食物热量库 — 覆盖日常高频食物 */
export const FOOD_DATABASE: FoodItem[] = [
  // 主食
  { name: '米饭（一碗）', caloriesPer100g: 116, typicalServing: 200, typicalCalories: 232, category: 'staple', protein: 2.6, carbs: 25.6, fat: 0.3 },
  { name: '馒头（一个）', caloriesPer100g: 223, typicalServing: 100, typicalCalories: 223, category: 'staple', protein: 7, carbs: 47, fat: 1.1 },
  { name: '面条（一碗）', caloriesPer100g: 110, typicalServing: 250, typicalCalories: 275, category: 'staple', protein: 4, carbs: 23, fat: 0.5 },
  { name: '全麦面包（2片）', caloriesPer100g: 246, typicalServing: 60, typicalCalories: 148, category: 'staple', protein: 9, carbs: 41, fat: 3.4 },
  { name: '燕麦片（一份）', caloriesPer100g: 367, typicalServing: 40, typicalCalories: 147, category: 'staple', protein: 13.5, carbs: 66, fat: 7 },
  { name: '红薯（一个）', caloriesPer100g: 86, typicalServing: 200, typicalCalories: 172, category: 'staple', protein: 1.6, carbs: 20, fat: 0.1 },
  { name: '玉米（一根）', caloriesPer100g: 112, typicalServing: 200, typicalCalories: 224, category: 'staple', protein: 4, carbs: 22, fat: 1.2 },
  { name: '糙米饭（一碗）', caloriesPer100g: 111, typicalServing: 200, typicalCalories: 222, category: 'staple', protein: 2.6, carbs: 23, fat: 0.9 },

  // 蛋白质
  { name: '鸡胸肉（一块）', caloriesPer100g: 133, typicalServing: 150, typicalCalories: 200, category: 'protein', protein: 31, carbs: 0, fat: 1.2 },
  { name: '水煮蛋（一个）', caloriesPer100g: 144, typicalServing: 50, typicalCalories: 72, category: 'protein', protein: 12.6, carbs: 0.6, fat: 9.5 },
  { name: '牛肉（瘦）', caloriesPer100g: 106, typicalServing: 100, typicalCalories: 106, category: 'protein', protein: 20.2, carbs: 0, fat: 2.3 },
  { name: '三文鱼', caloriesPer100g: 139, typicalServing: 100, typicalCalories: 139, category: 'protein', protein: 21.3, carbs: 0, fat: 6 },
  { name: '虾仁', caloriesPer100g: 48, typicalServing: 100, typicalCalories: 48, category: 'protein', protein: 10.4, carbs: 0, fat: 0.5 },
  { name: '豆腐（一块）', caloriesPer100g: 73, typicalServing: 150, typicalCalories: 110, category: 'protein', protein: 8.1, carbs: 2.8, fat: 3.7 },
  { name: '鱼（清蒸）', caloriesPer100g: 104, typicalServing: 150, typicalCalories: 156, category: 'protein', protein: 18, carbs: 0, fat: 3.5 },
  { name: '猪瘦肉', caloriesPer100g: 143, typicalServing: 100, typicalCalories: 143, category: 'protein', protein: 20.3, carbs: 0, fat: 6.2 },

  // 蔬菜
  { name: '西兰花', caloriesPer100g: 34, typicalServing: 150, typicalCalories: 51, category: 'vegetable', protein: 4.1, carbs: 4.3, fat: 0.6 },
  { name: '菠菜', caloriesPer100g: 24, typicalServing: 150, typicalCalories: 36, category: 'vegetable', protein: 2.6, carbs: 3.6, fat: 0.3 },
  { name: '黄瓜', caloriesPer100g: 15, typicalServing: 200, typicalCalories: 30, category: 'vegetable', protein: 0.7, carbs: 2.9, fat: 0.2 },
  { name: '番茄', caloriesPer100g: 19, typicalServing: 150, typicalCalories: 29, category: 'vegetable', protein: 0.9, carbs: 3.5, fat: 0.2 },
  { name: '生菜', caloriesPer100g: 13, typicalServing: 100, typicalCalories: 13, category: 'vegetable', protein: 1.3, carbs: 2, fat: 0.3 },
  { name: '炒青菜（一盘）', caloriesPer100g: 40, typicalServing: 200, typicalCalories: 80, category: 'vegetable', protein: 2, carbs: 3, fat: 2 },

  // 水果
  { name: '苹果（一个）', caloriesPer100g: 53, typicalServing: 200, typicalCalories: 106, category: 'fruit', protein: 0.3, carbs: 14, fat: 0.2 },
  { name: '香蕉（一根）', caloriesPer100g: 93, typicalServing: 120, typicalCalories: 112, category: 'fruit', protein: 1.4, carbs: 22, fat: 0.2 },
  { name: '橙子（一个）', caloriesPer100g: 48, typicalServing: 200, typicalCalories: 96, category: 'fruit', protein: 0.8, carbs: 12, fat: 0.2 },
  { name: '葡萄（一串）', caloriesPer100g: 43, typicalServing: 200, typicalCalories: 86, category: 'fruit', protein: 0.5, carbs: 10, fat: 0.2 },
  { name: '蓝莓（一盒）', caloriesPer100g: 57, typicalServing: 125, typicalCalories: 71, category: 'fruit', protein: 0.7, carbs: 14, fat: 0.3 },

  // 乳制品
  { name: '牛奶（一杯）', caloriesPer100g: 54, typicalServing: 250, typicalCalories: 135, category: 'dairy', protein: 3, carbs: 3.4, fat: 3.2 },
  { name: '酸奶（一杯）', caloriesPer100g: 72, typicalServing: 200, typicalCalories: 144, category: 'dairy', protein: 3.5, carbs: 10, fat: 1.5 },
  { name: '脱脂牛奶（一杯）', caloriesPer100g: 33, typicalServing: 250, typicalCalories: 83, category: 'dairy', protein: 3.4, carbs: 5, fat: 0.1 },

  // 零食/加餐
  { name: '坚果（一小把）', caloriesPer100g: 600, typicalServing: 25, typicalCalories: 150, category: 'snack', protein: 20, carbs: 15, fat: 50 },
  { name: '蛋白棒', caloriesPer100g: 350, typicalServing: 60, typicalCalories: 210, category: 'snack', protein: 20, carbs: 25, fat: 8 },
  { name: '黑巧克力（2小块）', caloriesPer100g: 546, typicalServing: 20, typicalCalories: 109, category: 'snack', protein: 5, carbs: 46, fat: 31 },

  // 饮品
  { name: '黑咖啡', caloriesPer100g: 2, typicalServing: 250, typicalCalories: 5, category: 'drink', protein: 0.1, carbs: 0, fat: 0 },
  { name: '拿铁（一杯）', caloriesPer100g: 40, typicalServing: 350, typicalCalories: 140, category: 'drink', protein: 5, carbs: 9, fat: 5 },
  { name: '奶茶（一杯）', caloriesPer100g: 60, typicalServing: 500, typicalCalories: 300, category: 'drink', protein: 2, carbs: 40, fat: 8 },
  { name: '可乐（一罐）', caloriesPer100g: 43, typicalServing: 330, typicalCalories: 142, category: 'drink', protein: 0, carbs: 35, fat: 0 },
  { name: '无糖可乐', caloriesPer100g: 0, typicalServing: 330, typicalCalories: 0, category: 'drink', protein: 0, carbs: 0, fat: 0 },

  // 快餐/外卖
  { name: '炒饭（一份）', caloriesPer100g: 180, typicalServing: 300, typicalCalories: 540, category: 'fast', protein: 8, carbs: 40, fat: 12 },
  { name: '饺子（10个）', caloriesPer100g: 185, typicalServing: 200, typicalCalories: 370, category: 'fast', protein: 10, carbs: 25, fat: 8 },
  { name: '包子（一个）', caloriesPer100g: 200, typicalServing: 80, typicalCalories: 160, category: 'fast', protein: 7, carbs: 30, fat: 4 },
  { name: '煎饼果子', caloriesPer100g: 220, typicalServing: 200, typicalCalories: 440, category: 'fast', protein: 8, carbs: 40, fat: 15 },
  { name: '麻辣烫（一份）', caloriesPer100g: 80, typicalServing: 500, typicalCalories: 400, category: 'fast', protein: 15, carbs: 30, fat: 15 },
  { name: '沙拉（一份）', caloriesPer100g: 35, typicalServing: 300, typicalCalories: 105, category: 'fast', protein: 5, carbs: 10, fat: 3 },
]

export const FOOD_CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'staple', label: '主食' },
  { key: 'protein', label: '蛋白质' },
  { key: 'vegetable', label: '蔬菜' },
  { key: 'fruit', label: '水果' },
  { key: 'dairy', label: '乳制品' },
  { key: 'snack', label: '零食' },
  { key: 'drink', label: '饮品' },
  { key: 'fast', label: '快餐' },
]

export function searchFoods(query: string, category?: string): FoodItem[] {
  let results = FOOD_DATABASE
  if (category && category !== 'all') {
    results = results.filter(f => f.category === category)
  }
  if (query.trim()) {
    const q = query.trim().toLowerCase()
    results = results.filter(f => f.name.toLowerCase().includes(q))
  }
  return results
}
