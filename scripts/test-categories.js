const assert = require('node:assert/strict');
const { categories } = require('../data/categories');
const { normalizeWord, isValidWordFormat } = require('../data/word-validation');
const normalize = normalizeWord;

function setFor(category) {
  return new Set((categories[category] || []).map(normalize));
}

const expectedCategories = [
  'Animals','Food','Countries','Cities','Sports','Movies','Professions','Vehicles',
  'Technology','Nature','Brands','Household Objects','Clothing','Music','Video Games',
  'Books','Science','Space','School Subjects','Travel','Drinks','Birds','Sea Animals','Plants'
];

for (const category of expectedCategories) {
  assert.ok(Array.isArray(categories[category]), `Missing category: ${category}`);
  assert.ok(categories[category].length >= 30, `${category} needs a larger dictionary`);
}

const validCases = {
  'School Subjects': ['maths','mathematics','EVS','environmental studies','social studies','social science','physics','chemistry','biology','computer science','physical education','Telugu','computer applications','world history'],
  'Drinks': ['Pepsi','Coke','Coca-Cola','Fanta','Sprite','Mountain Dew','Sting','Gatorade','chai','coffee','coconut water','7 Up','iced coffee'],
  Animals: ['tiger','elephant','crocodile','dolphin','penguin','rat','RAT','raccoon','hedgehog'],
  Food: ['pizza','biryani','dosa','sushi','pasta','egg','quinoa','fried chicken'],
  Countries: ['India','Japan','Brazil','Australia','United Kingdom','USA','Scotland'],
  Cities: ['Hyderabad','Mumbai','London','Tokyo','New York','Kuala Lumpur','New Delhi'],
  Sports: ['cricket','football','badminton','formula 1','chess','squash','darts'],
  Movies: ['Avatar','Inception','RRR','Barbie','The Lion King','The Dark Knight','Finding Dory'],
  Professions: ['doctor','engineer','police officer','photographer','programmer','cashier','flight attendant'],
  Vehicles: ['car','train','airplane','autorickshaw','spaceship','electric car','golf cart'],
  Technology: ['computer','smartphone','router','webcam','PlayStation','3D printer'],
  Nature: ['river','mountain','waterfall','rainbow','glacier','aurora','tornado'],
  Brands: ['Apple','Pepsi','Samsung','Nike','Coca Cola','IKEA','H&M'],
  'Household Objects': ['chair','table','refrigerator','vacuum cleaner','umbrella','mattress','dishwasher'],
  Clothing: ['shirt','jeans','saree','kurta','hoodie','leggings','sneakers'],
  Music: ['guitar','piano','jazz','sitar','orchestra','accordion','xylophone'],
  'Video Games': ['Minecraft','Fortnite','Pokemon','GTA','Valorant','Contra','Super Contra','Tekken 8','Hades','Hollow Knight','Cyberpunk 2077'],
  Books: ['novel','dictionary','biography','comic book','textbook','The Hobbit','paperback'],
  Science: ['atom','molecule','gravity','DNA','photosynthesis','carbon dioxide','water cycle'],
  Space: ['Mars','Jupiter','galaxy','black hole','astronaut','International Space Station','JWST'],
  Travel: ['hotel','passport','airport terminal','boarding pass','souvenir','road trip','travel itinerary'],
  Birds: ['eagle','parrot','peacock','kingfisher','myna','blue jay','cockatiel'],
  'Sea Animals': ['shark','dolphin','octopus','manta ray','seahorse','hermit crab','sea turtle'],
  Plants: ['rose','bamboo','neem','tulsi','sunflower','cucumber','blueberry']
};

const invalidCases = {
  'School Subjects': ['bench','desk','pencil','teacher','classroom','school bag','football'],
  Drinks: ['bench','bottle','burger','pizza','chair','pepsi bottle'],
  Animals: ['table','car','doctor','pizza','laptop'],
  Food: ['chair','tiger','computer','doctor','train'],
  Countries: ['Mumbai','tiger','pizza','teacher','Asia'],
  Cities: ['India','tiger','pizza','teacher','country'],
  Sports: ['table','pizza','teacher','laptop','banana'],
  Movies: ['tiger','pizza','chair','doctor','cricket'],
  Professions: ['chair','pizza','tiger','laptop','Mumbai'],
  Vehicles: ['chair','pizza','doctor','tiger','maths'],
  Technology: ['banana','tiger','pizza','doctor','river'],
  Nature: ['laptop','doctor','pizza','shirt','computer'],
  Brands: ['tiger','chair','river','doctor','maths'],
  'Household Objects': ['tiger','pizza','doctor','cricket','Mars'],
  Clothing: ['tiger','pizza','computer','doctor','Hyderabad'],
  Music: ['tiger','pizza','doctor','car','Mumbai'],
  'Video Games': ['tiger','pizza','doctor','shirt','Hyderabad'],
  Books: ['tiger','pizza','doctor','car','Pepsi'],
  Science: ['tiger','pizza','shirt','Hyderabad','teacher'],
  Space: ['tiger','pizza','shirt','Hyderabad','teacher'],
  Travel: ['tiger','pizza','doctor','maths','Pepsi'],
  Birds: ['tiger','pizza','doctor','car','maths'],
  'Sea Animals': ['tiger','pizza','doctor','car','eagle'],
  Plants: ['tiger','pizza','doctor','car','laptop']
};

for (const [category, words] of Object.entries(validCases)) {
  const set = setFor(category);
  for (const word of words) assert.ok(set.has(normalize(word)), `Expected VALID: ${category} -> ${word}`);
}

for (const [category, words] of Object.entries(invalidCases)) {
  const set = setFor(category);
  for (const word of words) assert.ok(!set.has(normalize(word)), `Expected INVALID: ${category} -> ${word}`);
}

// Explicit regression checks from gameplay testing.
assert.ok(setFor('Drinks').has('pepsi'), 'Pepsi must be accepted in Drinks');
assert.ok(setFor('Animals').has('rat'), 'Rat must be accepted in Animals');
assert.ok(setFor('Technology').has('3d printer'), 'Answers containing digits must remain in the category dictionary');
assert.ok(setFor('Drinks').has('7 up'), 'Digit-leading answers must remain in the category dictionary');
assert.ok(setFor('Books').has(normalize('Charlotte’s Web')), 'Curly and straight apostrophes must normalize consistently');
for (const answer of ['3D printer','7 Up','H&M','e-mail','Charlotte’s Web']) {
  assert.ok(isValidWordFormat(normalize(answer)), `Expected supported answer format: ${answer}`);
}
assert.ok(!isValidWordFormat('answer!'), 'Reject punctuation that is not part of supported answer formats');
assert.ok(setFor('School Subjects').has('evs'), 'EVS must be accepted in School Subjects');
assert.ok(setFor('School Subjects').has('social studies'), 'Social Studies must be accepted in School Subjects');
assert.ok(!setFor('School Subjects').has('bench'), 'Bench must not be accepted in School Subjects');
assert.ok(!setFor('Drinks').has('bottle'), 'Bottle must not be accepted in Drinks');
assert.ok(setFor('Video Games').has('contra'), 'Contra must be accepted in Video Games');
assert.ok(setFor('Video Games').has('super contra'), 'Super Contra must be accepted in Video Games');
assert.ok(!setFor('Video Games').has('controller'), 'Controller must not be accepted in Video Games');

console.log(`Category validation passed: ${expectedCategories.length} categories, ${Object.values(categories).reduce((n, words) => n + words.length, 0)} curated entries.`);
