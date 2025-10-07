// TriviaTopics.js
const categories = {
    arts: [
        "Beatles Albums", "Disney Classics", "Broadway Musicals", "Oscar Winners",
        "James Bond", "Marvel Universe", "90s Sitcoms", "Studio Ghibli",
        "Shakespeare Plays", "Renaissance Painters"
    ],
    literature: [
        "Harry Potter", "Jane Austen", "Famous Openings", "Pulitzer Novels",
        "Greek Mythology", "Science Fiction", "Agatha Christie", "Children’s Literature",
        "Nobel Literature", "Romantic Poetry"
    ],
    science: [
        "Periodic Table", "Space Exploration", "20th Century Inventions", "Programming Languages",
        "Human Anatomy", "Famous Physicists", "Dinosaurs", "Solar System",
        "Medical Breakthroughs", "Artificial Intelligence"
    ],
    history: [
        "US Presidents", "Civil War", "Cold War", "Ancient Egypt",
        "Roman Empire", "French Revolution", "WWII Leaders", "Civil Rights",
        "World Treaties", "Berlin Wall"
    ],
    geography: [
        "State Capitals", "World Landmarks", "Seven Wonders", "Famous Rivers",
        "National Parks", "Mountains", "European Countries", "Asian Cities",
        "African Geography", "Lost Countries"
    ],
    sports: [
        "World Cup", "Olympic Cities", "Tennis Grand Slams", "NBA MVPs",
        "Tour de France", "World Series", "Winter Olympics", "Cricket World Cup",
        "Boxing Legends", "Golf Majors"
    ],
    popCulture: [
        "YouTubers", "Netflix Originals", "Super Bowl", "Simpsons Episodes",
        "Pokémon", "Video Game Consoles", "2010s Memes", "SNL Cast",
        "90s Anime", "MTV Videos"
    ],
    food: [
        "Pasta Types", "Famous Cheeses", "World Cuisines", "Coffee Varieties",
        "Cocktail Recipes", "Famous Chefs", "Chocolate Brands", "Michelin Stars",
        "Sushi Types", "Street Foods"
    ],
    misc: [
        "Dog Breeds", "Cat Breeds", "Board Games", "LEGO Themes",
        "Candy Brands", "80s Cartoons", "90s Toys", "Mythical Creatures",
        "Land Expeditions", "Phobias"
    ],
    quirky: [
        "Animal Flags", "Peace Prize", "Famous Pirates", "Cryptids",
        "Olympic Mascots", "Constellations", "European Castles", "Banned Books",
        "Failed Inventions", "Largest Structures"
    ]
};

/**
 * Get a random selection of topics.
 * Ensures no category is repeated (if possible).
 * @param {number} count - number of topics to return
 * @returns {string[]} array of topics
 */
const getRandomTopics = (count) => {
    const categoryKeys = Object.keys(categories);
    const chosenTopics = [];
    const usedCategories = new Set();

    while (chosenTopics.length < count && usedCategories.size < categoryKeys.length) {
        // pick a random category not yet used
        const availableCategories = categoryKeys.filter(cat => !usedCategories.has(cat));
        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

        const topicList = categories[randomCategory];
        const randomTopic = topicList[Math.floor(Math.random() * topicList.length)];

        chosenTopics.push(randomTopic);
        usedCategories.add(randomCategory);
    }

    return chosenTopics;
}

const getRandomTopicsString = (count) => {
    return getRandomTopics(count).join(", ")
}

export { getRandomTopics, getRandomTopicsString}