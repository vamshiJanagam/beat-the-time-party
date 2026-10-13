// BEAT THE TIME category dictionary.
// These are intentionally curated words/phrases, not fuzzy guesses.
// Gameplay should accept a word only when it exists in the selected category.
const categories = {
  Animals: [
    'tiger','lion','elephant','zebra','giraffe','monkey','dog','cat','horse','bear','wolf','fox','rabbit','deer','goat','sheep','cow','buffalo','camel','panda','koala','leopard','cheetah','gorilla','chimpanzee','hippopotamus','rhinoceros','giraffe','hyena','jackal','otter','beaver','squirrel','hamster','mouse','rat','pig','donkey','mule','kangaroo','wallaby','sloth','armadillo','bat','dolphin','whale','shark','octopus','squid','jellyfish','turtle','tortoise','frog','toad','snake','crocodile','alligator','lizard','iguana','eagle','owl','parrot','flamingo','peacock','swan','penguin','ostrich','duck','goose','camel','seal','walrus','fox'
  ],
  Food: [
    'pizza','burger','pasta','rice','bread','sandwich','noodles','salad','soup','curry','biryani','dosa','idli','samosa','taco','burrito','steak','pancake','waffle','cookie','cake','donut','apple','banana','mango','orange','grape','watermelon','pineapple','papaya','guava','potato','tomato','carrot','onion','spinach','broccoli','cauliflower','peas','corn','beans','dal','roti','chapati','paratha','naan','pakora','vada','pav bhaji','poha','upma','khichdi','pulao','kebab','fries','popcorn','chocolate','ice cream','yogurt','cheese','omelette','fried rice','spring roll','dumpling','lasagna','sushi','ramen','falafel','hummus'
  ],
  Countries: [
    'india','china','japan','nepal','bhutan','bangladesh','pakistan','sri lanka','maldives','afghanistan','canada','mexico','brazil','argentina','chile','peru','colombia','ecuador','bolivia','uruguay','paraguay','france','germany','italy','spain','portugal','norway','sweden','finland','denmark','iceland','ireland','uk','united kingdom','netherlands','belgium','switzerland','austria','poland','greece','turkey','egypt','kenya','nigeria','ghana','south africa','ethiopia','morocco','algeria','tunisia','tanzania','australia','new zealand','thailand','vietnam','indonesia','malaysia','singapore','philippines','south korea','north korea','mongolia','russia','ukraine','saudi arabia','uae','united arab emirates','qatar','oman','israel','jordan','lebanon'
  ],
  Cities: [
    'mumbai','delhi','hyderabad','bangalore','bengaluru','chennai','kolkata','pune','jaipur','lucknow','ahmedabad','surat','goa','london','paris','berlin','rome','madrid','lisbon','tokyo','osaka','kyoto','seoul','beijing','shanghai','sydney','melbourne','toronto','vancouver','dubai','doha','cairo','nairobi','singapore','bangkok','moscow','chicago','boston','new york','los angeles','san francisco','washington','miami','las vegas','barcelona','amsterdam','vienna','prague','istanbul','delhi','agra','varanasi','bengaluru','kochi','visakhapatnam','patna','bhubaneswar','indore','nagpur','chandigarh','surat','coimbatore','madurai','mysore','thiruvananthapuram'
  ],
  Sports: [
    'cricket','football','soccer','tennis','hockey','basketball','baseball','golf','boxing','wrestling','kabaddi','badminton','volleyball','rugby','cycling','swimming','archery','shooting','rowing','skiing','surfing','athletics','running','marathon','table tennis','chess','carrom','snooker','billiards','bowling','gymnastics','karate','judo','taekwondo','fencing','polo','motorsport','formula one','formula 1','skating','snowboarding','weightlifting','diving','triathlon','handball','water polo','base jumping','horse racing'
  ],
  Movies: [
    'avatar','titanic','inception','interstellar','gladiator','rocky','jaws','frozen','coco','up','cars','alien','joker','dune','matrix','barbie','batman','superman','spiderman','spider man','moana','avengers','iron man','thor','black panther','toy story','finding nemo','the lion king','shrek','kung fu panda','ratatouille','inside out','wall e','top gun','jurassic park','terminator','godfather','forrest gump','parasite','oppenheimer','kgf','rrr','baahubali','dangal','3 idiots','lagaan','drishyam','pushpa','jawan','pathaan','dilwale dulhania le jayenge','taare zameen par','andhadhun','bahubali'
  ],
  Professions: [
    'doctor','teacher','engineer','lawyer','pilot','chef','nurse','dentist','architect','artist','designer','writer','actor','actress','farmer','scientist','journalist','photographer','manager','plumber','carpenter','electrician','mechanic','driver','police officer','policeman','policewoman','firefighter','soldier','sailor','accountant','banker','economist','programmer','developer','analyst','consultant','lawyer','judge','professor','researcher','musician','singer','dancer','director','producer','editor','journalist','reporter','tailor','barber','hairdresser','baker','butcher','fisherman','pilot','architect','pharmacist','veterinarian','nurse','receptionist','salesperson','entrepreneur'
  ],
  Vehicles: [
    'car','bus','train','truck','bike','bicycle','scooter','motorcycle','airplane','aeroplane','helicopter','boat','ship','submarine','tractor','van','taxi','ambulance','rocket','tram','metro','auto','autorickshaw','rickshaw','suv','jeep','minivan','pickup truck','fire truck','school bus','motorbike','moped','yacht','ferry','canoe','kayak','cruise ship','cargo ship','jet','glider','hot air balloon','spaceship','cart','wagon','bulldozer','excavator','crane','forklift','limousine','convertible','sedan','hatchback','coupe'
  ],
  Technology: [
    'computer','laptop','phone','smartphone','mobile','tablet','keyboard','mouse','monitor','printer','scanner','camera','server','router','modem','robot','drone','sensor','battery','charger','browser','website','software','console','processor','cpu','gpu','ram','hard drive','ssd','usb','smartwatch','headphones','earbuds','microphone','projector','television','tv','remote','wifi','bluetooth','internet','app','application','database','cloud','firewall','operating system','android','ios','windows','linux','macbook','iphone','ipad','playstation','xbox','nintendo switch','vr headset','3d printer','smart speaker','keyboard','webcam'
  ],
  Nature: [
    'river','mountain','forest','desert','ocean','island','waterfall','volcano','valley','canyon','lake','cloud','rain','snow','wind','thunder','lightning','rainbow','flower','tree','hill','cave','glacier','beach','cliff','meadow','jungle','swamp','wetland','stream','pond','riverbank','sand dune','geyser','earthquake','sunlight','sunrise','sunset','storm','fog','mist','hail','frost','iceberg','coral reef','grassland','savanna','rainforest','bush','leaf','soil','rock','stone','sand','mud','river','ocean','sea'
  ],
  Brands: [
    'apple','google','nike','adidas','samsung','sony','amazon','microsoft','tesla','toyota','honda','pepsi','coke','coca cola','lego','disney','netflix','intel','puma','ford','bmw','mercedes','audi','volkswagen','hyundai','kia','oneplus','xiaomi','oppo','vivo','realme','nokia','motorola','dell','hp','lenovo','asus','acer','canon','nikon','philips','panasonic','lg','whirlpool','nestle','mcdonalds','starbucks','kfc','dominos','burger king','lays','kitkat','oreo','adobe','nvidia','spotify','youtube','uber','airbnb','paypal','visa','mastercard','rolex','gucci','prada','puma','reebok'
  ],
  'Household Objects': [
    'chair','table','sofa','couch','bed','lamp','mirror','clock','plate','spoon','fork','knife','cup','mug','bottle','bucket','towel','pillow','blanket','broom','mop','basket','box','drawer','cabinet','shelf','curtain','carpet','mat','vase','plate','bowl','pan','pot','kettle','toaster','oven','microwave','refrigerator','fridge','washing machine','iron','fan','vacuum cleaner','dustbin','trash can','hanger','door','window','key','lock','cushion','remote','television','soap','brush','comb','scissors','sewing machine','clock','calendar','candle','umbrella'
  ],
  Clothing: [
    'shirt','t shirt','t-shirt','pants','trousers','jeans','dress','skirt','jacket','coat','sweater','hoodie','shorts','socks','shoes','boots','hat','cap','scarf','gloves','belt','tie','suit','blazer','kurta','kurti','saree','sari','dhoti','lungi','lehenga','salwar','salwar kameez','dupatta','pajamas','pajama','tracksuit','uniform','vest','tank top','top','blouse','sandal','slipper','flip flop','raincoat','swimsuit','underwear','bra','skirt','gown','shawl','turban','tie','bow tie','cardigan','overcoat','windbreaker','shorts'
  ],
  Music: [
    'guitar','piano','drums','violin','flute','trumpet','saxophone','keyboard','concert','album','song','singer','rapper','band','jazz','rock','pop','blues','opera','melody','rhythm','beat','harmony','chorus','verse','lyrics','composer','musician','drummer','guitarist','pianist','violinist','DJ','dj','rap','hip hop','classical','country music','folk','reggae','metal','indie','symphony','orchestra','choir','microphone','record','recording','instrument','bass','cello','clarinet','harmonica','ukulele','sitar','tabla','santoor','veena','mridangam'
  ],
  'Video Games': [
    'minecraft','fortnite','pokemon','zelda','the legend of zelda','tetris','pacman','pac-man','contra','super contra','contra iii','valorant','overwatch','overwatch 2','fifa','ea sports fc','dota','dota 2','portal','portal 2','halo','sonic','sonic the hedgehog','mario','super mario','super mario bros','roblox','terraria','apex','apex legends','fallout','fallout 4','fallout new vegas','skyrim','the elder scrolls','destiny','destiny 2','minecraft dungeons','call of duty','call of duty mobile','pubg','pubg mobile','bgmi','free fire','among us','gta','grand theft auto','grand theft auto v','red dead redemption','red dead redemption 2','god of war','god of war ragnarok','elden ring','dark souls','dark souls 3','league of legends','counter strike','counter-strike','csgo','cs2','rocket league','need for speed','need for speed most wanted','forza','forza horizon','street fighter','street fighter 6','tekken','tekken 8','mortal kombat','mortal kombat 1','super smash bros','animal crossing','animal crossing new horizons','splatoon','the last of us','the last of us part ii','uncharted','uncharted 4','horizon','horizon zero dawn','horizon forbidden west','assassins creed','assassin s creed','far cry','far cry 6','watch dogs','clash of clans','candy crush','temple run','subway surfers','angry birds','fall guys','stumble guys','brawl stars','clash royale','mario kart','mario kart 8','donkey kong','metroid','kirby','mega man','castlevania','street fighter ii','kingdom hearts','final fantasy','final fantasy vii','chrono trigger','resident evil','resident evil 4','silent hill','metal gear solid','death stranding','sekiro','bloodborne','hades','hollow knight','celeste','undertale','cuphead','among us','dead cells','stardew valley','the sims','simcity','age of empires','civilization','starcraft','warcraft','diablo','world of warcraft','counter strike condition zero','quake','doom','wolfenstein','quake 3','command and conquer','battlefield','battlefield 2042','valorant','palworld','helldivers 2','tekken 7','need for speed underground','prince of persia','max payne','tomb raider','crash bandicoot','spyro','rayman','plants vs zombies','fruit ninja','pokemon go','pokemon unite'
  ],
  Books: [
    'novel','poem','story','comic','atlas','dictionary','encyclopedia','diary','biography','autobiography','thriller','mystery','fantasy','romance','history','science','journal','magazine','manual','textbook','fiction','nonfiction','drama','poetry','mythology','fairy tale','adventure','horror','detective','cookbook','guidebook','storybook','picture book','reference book','short story','graphic novel','memoir','essay','almanac','catalog','handbook','yearbook','notebook','workbook','novel','comic book','travel book','children book','children’s book'
  ],
  Science: [
    'atom','molecule','cell','gene','gravity','energy','force','light','sound','heat','water','oxygen','carbon','protein','virus','bacteria','planet','electron','proton','neutron','photon','nucleus','dna','rna','chromosome','evolution','photosynthesis','respiration','ecosystem','matter','mass','speed','motion','pressure','temperature','electricity','magnetism','acid','base','chemical','reaction','element','compound','mixture','solution','physics','chemistry','biology','astronomy','geology','ecology','genetics','microbiology','botany','zoology','anatomy','gravity','friction','radiation','atom','molecule','enzyme','hormone','tissue','organ','fossil'
  ],
  Space: [
    'sun','moon','mars','earth','venus','jupiter','saturn','mercury','neptune','uranus','pluto','comet','asteroid','galaxy','nebula','star','planet','rocket','orbit','eclipse','solar system','milky way','black hole','supernova','meteor','meteorite','satellite','spaceship','space station','astronaut','cosmos','universe','constellation','moon','sunspot','quasar','pulsar','exoplanet','gravity','crater','rover','mars rover','telescope','spacecraft','launch','orbit','apogee','perigee','asteroid belt','kuiper belt','oort cloud','andromeda','nebula','galaxy','cosmic dust','space shuttle'
  ],
  'School Subjects': [
    'math','maths','mathematics','english','telugu','hindi','urdu','sanskrit','science','physics','chemistry','biology','environmental studies','environmental science','evs','social studies','social science','history','geography','civics','economics','political science','computer science','computer','information technology','it','coding','programming','physical education','pe','art','drawing','music','drama','literature','language','grammar','algebra','geometry','statistics','accountancy','accounts','business studies','commerce','psychology','sociology','philosophy','home science','moral science','general knowledge','gk','health education','life skills','dance','fine arts','environmental education','robotics','electronics','biology','economics','history','geography'
  ],
  Travel: [
    'hotel','airport','passport','ticket','luggage','suitcase','map','tour','beach','museum','temple','train','flight','taxi','guide','camera','visa','hostel','resort','cruise','souvenir','trip','journey','vacation','holiday','tourist','tourism','destination','itinerary','boarding pass','check in','check-in','passport','visa','hotel room','reception','lobby','airport terminal','runway','train station','bus station','road trip','backpacking','camping','trekking','hiking','sightseeing','landmark','monument','beach','mountain','island','city tour','travel bag','travel insurance','currency exchange','car rental','rental car','tour guide','travel agency','booking','reservation','flight ticket','train ticket','bus ticket'
  ],
  Drinks: [
    'water','coffee','tea','juice','milk','soda','lemonade','smoothie','shake','cola','cocoa','latte','espresso','mocha','lassi','chai','sprite','tonic','punch','mocktail','pepsi','coke','coca cola','coca-cola','fanta','7up','7 up','mountain dew','red bull','sting','gatorade','monster','limca','maaza','frooti','slice','appy fizz','thums up','thumsup','mirinda','dew','root beer','ginger ale','lemon soda','orange juice','apple juice','mango juice','grape juice','pineapple juice','tomato juice','milkshake','chocolate shake','banana shake','mango shake','protein shake','green tea','black tea','iced tea','cold coffee','hot chocolate','buttermilk','chaas','coconut water','sugarcane juice','jaljeera','rooh afza','aam panna','rasam','broth','sports drink','energy drink','sparkling water','mineral water','cappuccino','americano','macchiato','frappuccino','herbal tea','kombucha'
  ],
  Birds: [
    'eagle','owl','parrot','sparrow','pigeon','crow','peacock','flamingo','swan','duck','goose','penguin','ostrich','hawk','falcon','vulture','robin','woodpecker','pelican','crane','kingfisher','hummingbird','canary','finch','parakeet','cockatoo','macaw','kiwi','emu','turkey','hen','chicken','rooster','quail','dove','seagull','albatross','heron','stork','ibis','toucan','cuckoo','magpie','raven','nightingale','sparrow','starling','swallow','wren','woodpecker','hornbill','oriole','mynah','myna','koel','puffin','ostrich','flamingo','pelican','penguin'
  ],
  'Sea Animals': [
    'shark','whale','dolphin','octopus','squid','crab','lobster','jellyfish','turtle','seal','walrus','ray','eel','starfish','seahorse','clam','oyster','shrimp','mussel','coral','sardine','tuna','salmon','mackerel','anchovy','swordfish','marlin','stingray','manta ray','sea lion','sea otter','narwhal','manatee','dugong','orca','killer whale','blue whale','humpback whale','sperm whale','sea snake','sea cucumber','sea urchin','anemone','barnacle','plankton','krill','coral','pufferfish','jellyfish','nautilus','moray eel','lobster','crab','clam','oyster','mussel','scallop','sponge','seahorse','starfish','cuttlefish','coral reef','anglerfish'
  ],
  Plants: [
    'rose','lotus','tulip','sunflower','lily','jasmine','mango','banana','coconut','bamboo','oak','pine','maple','fern','cactus','mint','basil','wheat','rice','corn','grass','tree','plant','flower','hibiscus','marigold','daisy','lavender','orchid','daffodil','chrysanthemum','bougainvillea','neem','peepal','banyan','ashoka','guava','papaya','lemon','orange','apple','grape','tomato','potato','carrot','onion','spinach','cabbage','cauliflower','broccoli','pea','bean','cotton','sugarcane','tea plant','coffee plant','rubber plant','aloe vera','tulsi','curry leaf','ginger','turmeric','garlic','chilli','wheat','barley','oats','sunflower','soybean','mustard','rice plant','corn plant'
  ]
};

// Common answers people naturally give in a fast word game. Keep these explicit
// so broad coverage does not turn into accepting unrelated words by guesswork.
const commonAnswers = {
  Animals: ['antelope','badger','boar','cheetah','chinchilla','cougar','coyote','ferret','hedgehog','moose','porcupine','raccoon','reindeer','weasel','yak'],
  Food: ['avocado','bacon','cheeseburger','chicken','egg','fried chicken','french fries','garlic bread','noodle soup','omelet','omelette','puri','puri bhaji','prawn','pudding','quinoa','scrambled eggs','steamed rice','stew','soup dumplings'],
  Countries: ['america','england','scotland','united states','united states of america','usa','us','wales','czech republic','ivory coast','cote d ivoire','democratic republic of the congo','congo','north macedonia','east timor','timor leste'],
  Cities: ['new delhi','washington dc','hong kong','jerusalem','cape town','mexico city','kuala lumpur','jakarta','manila','karachi','lahore','dhaka','kathmandu','mecca','abu dhabi','melbourne'],
  Sports: ['mixed martial arts','mma','squash','darts','ice hockey','figure skating','speed skating','futsal','surfing','rowing','sailing','ultimate frisbee','pole vault','long jump','high jump','shot put'],
  Movies: ['the dark knight','avengers endgame','avengers infinity war','finding dory','despicable me','minions','home alone','the jungle book','pulp fiction','the shawshank redemption','the pursuit of happyness','spirited away','your name','chennai express','hera pheri','munna bhai mbbs'],
  Professions: ['cashier','waiter','waitress','flight attendant','lifeguard','optician','optometrist','psychologist','therapist','social worker','security guard','delivery driver','fashion designer','web developer','software engineer','veterinarian'],
  Vehicles: ['electric car','electric bike','e-bike','sailboat','speedboat','motor scooter','scooter','rickshaw','tuk tuk','school van','fire engine','spaceshuttle','space shuttle','snowmobile','segway','golf cart'],
  Technology: ['smart tv','smart television','touchscreen','touch screen','power bank','flash drive','memory card','graphics card','motherboard','smart home','search engine','email','e-mail','video game console','virtual reality headset','3d printer'],
  Nature: ['aurora','aurora borealis','tide','tides','breeze','drought','flood','tornado','hurricane','cyclone','typhoon','climate','ecosystem','canyon','delta','estuary','dune','lava'],
  Brands: ['ikea','zara','h&m','uniqlo','under armour','new balance','reebok','colgate','oral b','procter and gamble','p&g','cadbury','hersheys','the coca cola company','airtel','jio'],
  'Household Objects': ['mattress','bedsheet','sheet','duvet','quilt','doormat','doorbell','light bulb','bulb','extension cord','power strip','dishwasher','water heater','thermos','thermometer','laundry basket'],
  Clothing: ['sneakers','trainers','underpants','briefs','boxers','leggings','tights','polo shirt','rain boots','mittens','beanie','hooded sweatshirt','jumper','bikini','swim trunks','overalls'],
  Music: ['electric guitar','acoustic guitar','bass guitar','harmonica','accordion','synthesizer','synth','music box','xylophone','maracas','trombone','tuba','mandolin','bagpipes','music video','soundtrack'],
  'Video Games': ['super mario odyssey','mario bros','mario brothers','the witcher 3','the witcher','cyberpunk 2077','the legend of zelda breath of the wild','zelda breath of the wild','grand theft auto online','gta online','overcooked','poppy playtime','genshin impact','mobile legends','clash royale'],
  Books: ['the hobbit','harry potter','harry potter and the philosophers stone','the hunger games','the alchemist','diary of a wimpy kid','the very hungry caterpillar','charlotte s web','charlottes web','charlotte\'s web','the little prince','the fault in our stars','book','paperback','hardcover','e book','ebook'],
  Science: ['cell division','climate change','solar energy','renewable energy','carbon dioxide','nitrogen','helium','hydrogen','baking soda','magnetic field','sound wave','water cycle','food chain','natural selection','scientific method'],
  Space: ['international space station','iss','hubble space telescope','james webb space telescope','jwst','earth orbit','lunar eclipse','solar eclipse','full moon','new moon','moon landing','space probe','space observatory','space debris','rocket ship','astronomical unit'],
  'School Subjects': ['physical education','computer studies','computer applications','business','business studies','world history','civics','literature','spelling','reading','writing','environmental science','moral education','health','foreign language','information and communications technology'],
  Travel: ['train ride','bus ride','road trip','cruise','tour bus','travel','backpack','backpackers hostel','hostel','travel visa','customs','immigration','ferry','passport control','travel itinerary'],
  Drinks: ['orange soda','lemon water','iced coffee','iced tea','black coffee','green tea','hot tea','hot cocoa','coconut milk','orange squash','fruit punch','apple cider','soda water','ginger beer','electrolyte drink'],
  Birds: ['blue jay','cardinal','seagull','sea gull','bluebird','kingfisher','cockatiel','budgie','partridge','pheasant','barn owl','snowy owl','wood duck','swift','swallow'],
  'Sea Animals': ['sea turtle','hermit crab','coconut crab','sea anemone','sea star','star fish','sea urchin','sea sponge','whale shark','hammerhead shark','great white shark','man o war','portuguese man o war','sea horse'],
  Plants: ['avocado tree','apple tree','orange tree','lemon tree','cherry tree','strawberry','blueberry','blackberry','watermelon','cucumber','pumpkin','bell pepper','pepper','lettuce','kale','sweet potato']
};
for (const [category, words] of Object.entries(commonAnswers)) {
  categories[category].push(...words);
}

const difficulties = {
  easy: { seconds: 12, forbidden: 2 },
  normal: { seconds: 10, forbidden: 3 },
  hard: { seconds: 7, forbidden: 4 }
};

module.exports = { categories, difficulties };
