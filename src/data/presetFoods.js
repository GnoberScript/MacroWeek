/*
 * MacroWeek starter catalog
 *
 * The brand/category fields power the filters in the UI. Restaurant values are
 * rounded reference estimates from published brand nutrition information; menu
 * names, recipes, and serving sizes can vary by country and over time. Users
 * should compare against the restaurant's current local nutrition information.
 * References:
 * - https://www.burgerking.com.ph/menu
 * - https://origin.bk.com/pdfs/nutrition.pdf
 * - https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html
 * - https://www.starbucks.com/menu
 * - https://www.highlandscoffee.com.vn/en/freeze.html
 */

const starter = (id, name, description, servingDescription, calories, protein, carbs, fat, extra = {}) => ({
  id, name, description, servingDescription, quantity: 1, unit: 'serving',
  calories, protein, carbs, fat, brand: 'Staples', category: 'Everyday',
  source: 'USDA FoodData Central estimate', preset: true, ...extra,
})

const restaurant = (brand, id, name, category, calories, protein, carbs, fat, servingDescription = '1 item') => ({
  id: `${brand === 'Burger King' ? 'bk' : 'mcdo'}-${id}`,
  name, description: `${brand} · ${category}`, servingDescription,
  quantity: 1, unit: 'serving', calories, protein, carbs, fat, brand, category,
  source: `${brand} published nutrition reference estimate`, preset: true,
})

const starbucks = (id, name, category, calories, protein, carbs, fat, servingDescription = 'Grande (16 fl oz)') => ({
  id: `starbucks-${id}`, name, description: `Starbucks · ${category}`,
  servingDescription, quantity: 1, unit: 'drink', calories, protein, carbs, fat,
  brand: 'Starbucks', category,
  source: 'Starbucks standard-recipe nutrition reference estimate', preset: true,
})

const highlands = (id, name, category, calories, protein, carbs, fat, servingDescription = 'Medium (16 fl oz)') => ({
  id: `highlands-${id}`, name, description: `Highlands Coffee · ${category}`,
  servingDescription, quantity: 1, unit: 'drink', calories, protein, carbs, fat,
  brand: 'Highlands Coffee', category,
  source: 'Recipe-based estimate — Highlands does not publish complete macros', preset: true,
})

const everydayFoods = [
  starter('preset-chicken', 'Chicken breast', 'Cooked, roasted, skinless', '100 g cooked', 165, 31, 0, 3.6, { quantity: 100, unit: 'g' }),
  starter('preset-rice', 'White rice', 'Long-grain, cooked', '1 cup cooked', 205, 4.3, 44.5, 0.4, { unit: 'cup' }),
  starter('preset-tofu', 'Firm tofu', 'Prepared with calcium', '100 g', 144, 17.3, 2.8, 8.7, { quantity: 100, unit: 'g' }),
  starter('preset-beef', 'Lean ground beef', '90% lean, cooked', '100 g cooked', 254, 26, 0, 17, { quantity: 100, unit: 'g' }),
  starter('preset-whey', 'Whey protein', 'Generic protein powder', '1 scoop (30 g)', 120, 24, 3, 1.5, { unit: 'scoop', source: 'Typical label estimate — check your brand' }),
]

const burgerKingFoods = [
  restaurant('Burger King', 'whopper', 'Whopper', 'Burgers', 670, 31, 54, 40),
  restaurant('Burger King', 'whopper-jr', 'Whopper Jr.', 'Burgers', 330, 15, 30, 18),
  restaurant('Burger King', 'double-whopper', 'Double Whopper', 'Burgers', 920, 52, 54, 59),
  restaurant('Burger King', 'bacon-king', 'Bacon King', 'Burgers', 1200, 66, 49, 81),
  restaurant('Burger King', 'impossible-whopper', 'Plant-Based Whopper', 'Burgers', 630, 25, 58, 34),
  restaurant('Burger King', 'cheeseburger', 'Cheeseburger', 'Burgers', 300, 15, 27, 13),
  restaurant('Burger King', 'double-cheeseburger', 'Double Cheeseburger', 'Burgers', 400, 24, 27, 21),
  restaurant('Burger King', 'original-chicken', 'Original Chicken Sandwich', 'Chicken', 680, 28, 49, 39),
  restaurant('Burger King', 'chicken-jr', 'Chicken Jr.', 'Chicken', 440, 16, 38, 24),
  restaurant('Burger King', 'chicken-fries-9', 'Chicken Fries — 9 pc', 'Chicken', 260, 15, 20, 13, '9 pieces'),
  restaurant('Burger King', 'nuggets-8', 'Chicken Nuggets — 8 pc', 'Chicken', 380, 18, 20, 24, '8 pieces'),
  restaurant('Burger King', 'fries-small', 'Thick-Cut Fries — Small', 'Sides', 300, 4, 44, 13, '1 small order'),
  restaurant('Burger King', 'fries-medium', 'Thick-Cut Fries — Medium', 'Sides', 370, 5, 54, 16, '1 medium order'),
  restaurant('Burger King', 'fries-large', 'Thick-Cut Fries — Large', 'Sides', 430, 6, 60, 19, '1 large order'),
  restaurant('Burger King', 'onion-rings-small', 'Onion Rings — Small', 'Sides', 280, 4, 40, 12, '1 small order'),
  restaurant('Burger King', 'hash-browns-small', 'Hash Browns — Small', 'Breakfast', 250, 2, 24, 16, '1 small order'),
]

const mcdoFoods = [
  restaurant('McDo', 'big-mac', 'Big Mac', 'Burgers', 590, 25, 46, 34),
  restaurant('McDo', 'quarter-pounder', 'Quarter Pounder with Cheese', 'Burgers', 520, 30, 42, 26),
  restaurant('McDo', 'double-quarter-pounder', 'Double Quarter Pounder with Cheese', 'Burgers', 740, 48, 43, 42),
  restaurant('McDo', 'mcdouble', 'McDouble', 'Burgers', 390, 22, 33, 20),
  restaurant('McDo', 'cheeseburger', 'Cheeseburger', 'Burgers', 300, 15, 32, 13),
  restaurant('McDo', 'hamburger', 'Hamburger', 'Burgers', 250, 12, 31, 9),
  restaurant('McDo', 'mcchicken', 'McChicken', 'Chicken', 400, 14, 39, 21),
  restaurant('McDo', 'mccrispy', 'McCrispy Chicken Sandwich', 'Chicken', 470, 26, 45, 20),
  restaurant('McDo', 'nuggets-6', 'Chicken McNuggets — 6 pc', 'Chicken', 250, 14, 15, 15, '6 pieces'),
  restaurant('McDo', 'nuggets-10', 'Chicken McNuggets — 10 pc', 'Chicken', 410, 23, 26, 24, '10 pieces'),
  restaurant('McDo', 'fried-chicken', 'Fried Chicken — 1 pc', 'Chicken', 320, 22, 12, 20, '1 piece'),
  restaurant('McDo', 'fried-chicken-rice', 'Fried Chicken with Rice', 'Chicken', 520, 25, 53, 23, '1 chicken piece + rice'),
  restaurant('McDo', 'filet-o-fish', 'Filet-O-Fish', 'Fish', 380, 16, 39, 18),
  restaurant('McDo', 'fries-small', 'World Famous Fries — Small', 'Sides', 230, 3, 31, 11, '1 small order'),
  restaurant('McDo', 'fries-medium', 'World Famous Fries — Medium', 'Sides', 320, 5, 43, 15, '1 medium order'),
  restaurant('McDo', 'fries-large', 'World Famous Fries — Large', 'Sides', 480, 7, 65, 23, '1 large order'),
  restaurant('McDo', 'hash-brown', 'Hash Brown', 'Breakfast', 140, 2, 18, 8),
  restaurant('McDo', 'egg-mcmuffin', 'Egg McMuffin', 'Breakfast', 310, 17, 30, 13),
  restaurant('McDo', 'sausage-egg-mcmuffin', 'Sausage McMuffin with Egg', 'Breakfast', 480, 20, 30, 31),
  restaurant('McDo', 'apple-pie', 'Baked Apple Pie', 'Desserts', 230, 2, 33, 11),
]

const starbucksDrinks = [
  starbucks('brewed-coffee', 'Pike Place Roast', 'Brewed Coffee', 5, 1, 0, 0),
  starbucks('americano', 'Caffè Americano', 'Espresso', 15, 1, 2, 0),
  starbucks('cold-brew', 'Cold Brew Coffee', 'Cold Coffee', 5, 0, 0, 0),
  starbucks('nitro-cold-brew', 'Nitro Cold Brew', 'Cold Coffee', 5, 0, 0, 0),
  starbucks('vanilla-sweet-cream-cold-brew', 'Vanilla Sweet Cream Cold Brew', 'Cold Coffee', 110, 1, 14, 5),
  starbucks('caffe-latte', 'Caffè Latte', 'Espresso', 190, 13, 18, 7),
  starbucks('iced-caffe-latte', 'Iced Caffè Latte', 'Espresso', 130, 8, 13, 4.5),
  starbucks('caramel-macchiato', 'Caramel Macchiato', 'Espresso', 250, 10, 35, 7),
  starbucks('caffe-mocha', 'Caffè Mocha', 'Espresso', 370, 13, 43, 15),
  starbucks('white-chocolate-mocha', 'White Chocolate Mocha', 'Espresso', 440, 15, 55, 17),
  starbucks('brown-sugar-oatmilk-shaken', 'Iced Brown Sugar Oatmilk Shaken Espresso', 'Espresso', 120, 2, 20, 3),
  starbucks('coffee-frappuccino', 'Coffee Frappuccino', 'Frappuccino', 230, 3, 46, 3),
  starbucks('caramel-frappuccino', 'Caramel Frappuccino', 'Frappuccino', 380, 4, 55, 16),
  starbucks('java-chip-frappuccino', 'Java Chip Frappuccino', 'Frappuccino', 440, 6, 65, 19),
  starbucks('chai-tea-latte', 'Chai Tea Latte', 'Tea & Refreshers', 240, 8, 45, 4.5),
  starbucks('matcha-tea-latte', 'Matcha Tea Latte', 'Tea & Refreshers', 240, 12, 34, 7),
  starbucks('pink-drink', 'Pink Drink', 'Tea & Refreshers', 140, 1, 28, 2.5),
  starbucks('strawberry-acai', 'Strawberry Açaí Refresher', 'Tea & Refreshers', 100, 0, 23, 0),
]

const highlandsCoffeeDrinks = [
  highlands('phin-sua-da', 'Phin Sữa Đá', 'Vietnamese Coffee', 180, 4, 32, 4),
  highlands('phin-den-da', 'Phin Đen Đá', 'Vietnamese Coffee', 70, 1, 17, 0),
  highlands('bac-xiu-da', 'Bạc Xỉu Đá', 'Vietnamese Coffee', 220, 6, 36, 6),
  highlands('phindi-hanh-nhan', 'PhinDi Hạnh Nhân', 'Vietnamese Coffee', 200, 4, 32, 6),
  highlands('phindi-kem-sua', 'PhinDi Kem Sữa', 'Vietnamese Coffee', 230, 5, 38, 7),
  highlands('phindi-chocolate', 'PhinDi Chocolate', 'Vietnamese Coffee', 240, 5, 40, 7),
  highlands('americano', 'Americano', 'Espresso', 15, 1, 2, 0),
  highlands('latte', 'Caffè Latte', 'Espresso', 190, 10, 18, 8),
  highlands('cappuccino', 'Cappuccino', 'Espresso', 140, 8, 12, 6),
  highlands('caramel-macchiato', 'Caramel Macchiato', 'Espresso', 260, 8, 38, 9),
  highlands('classic-phin-freeze', 'Classic Phin Freeze', 'Freeze', 360, 5, 57, 13, 'Large (20 fl oz)'),
  highlands('caramel-phin-freeze', 'Caramel Phin Freeze', 'Freeze', 430, 5, 68, 16, 'Large (20 fl oz)'),
  highlands('cookies-cream-freeze', 'Cookies & Cream Freeze', 'Freeze', 480, 7, 70, 20, 'Large (20 fl oz)'),
  highlands('chocolate-freeze', 'Chocolate Freeze', 'Freeze', 450, 7, 67, 18, 'Large (20 fl oz)'),
  highlands('green-tea-freeze', 'Green Tea Freeze', 'Freeze', 420, 6, 67, 15, 'Large (20 fl oz)'),
  highlands('green-tea-latte', 'Green Tea Latte', 'Tea', 240, 8, 39, 6),
  highlands('golden-lotus-tea', 'Golden Lotus Tea', 'Tea', 260, 3, 44, 8),
  highlands('peach-lemongrass-tea', 'Peach Lemongrass Tea', 'Tea', 100, 0, 25, 0),
  highlands('lychee-tea', 'Lychee Tea', 'Tea', 130, 0, 32, 0),
]

export const foodBrands = ['Staples', 'Burger King', 'McDo', 'Starbucks', 'Highlands Coffee']
export const foodCategories = ['Everyday', 'Burgers', 'Chicken', 'Sides', 'Breakfast', 'Fish', 'Desserts', 'Brewed Coffee', 'Cold Coffee', 'Espresso', 'Frappuccino', 'Tea & Refreshers', 'Vietnamese Coffee', 'Freeze', 'Tea']
export const presetFoods = [...everydayFoods, ...burgerKingFoods, ...mcdoFoods, ...starbucksDrinks, ...highlandsCoffeeDrinks]
